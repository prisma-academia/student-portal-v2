import type {
  Fee,
  FeePlacement,
  FeeSessionTotals,
  FeeStatement,
  FeeTotals,
  SessionRef,
} from "@/types/student";

const money = (n: unknown) => {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
};
const round = (n: number) => Math.round(n * 100) / 100;

/** What a fee contributes: its amount, what was paid, and what is still owed. */
function feeFigures(fee: Fee) {
  const amount = money(fee.amount);
  const paid = fee.isPaid ? money(fee.userPayment?.amount ?? amount) : 0;
  return { amount, paid, outstanding: fee.isPaid ? 0 : amount };
}

const sessionKey = (session: SessionRef | null | undefined) =>
  session?._id ? String(session._id) : "none";

/** Totals worked out from the fees, for APIs that answer with the older plain array. */
function summarise(fees: Fee[]): FeeStatement["summary"] {
  const totals: FeeTotals = { expected: 0, paid: 0, outstanding: 0, arrears: 0 };
  const bySession = new Map<string, FeeSessionTotals>();
  fees.forEach((fee) => {
    const { amount, paid, outstanding } = feeFigures(fee);
    totals.expected += amount;
    totals.paid += paid;
    totals.outstanding += outstanding;
    if (fee.isArrears) totals.arrears += outstanding;
    const key = sessionKey(fee.session);
    const row = bySession.get(key) ?? {
      session: fee.session?._id ? fee.session : { _id: null, name: "No session" },
      placement: null,
      expected: 0,
      paid: 0,
      outstanding: 0,
    };
    row.expected += amount;
    row.paid += paid;
    row.outstanding += outstanding;
    bySession.set(key, row);
  });
  return {
    totals: {
      expected: round(totals.expected),
      paid: round(totals.paid),
      outstanding: round(totals.outstanding),
      arrears: round(totals.arrears),
    },
    byFeeType: [],
    // Newest session first (as the API orders it); fees with no session last.
    bySession: [...bySession.values()].sort((a, b) => {
      if (!a.session._id) return 1;
      if (!b.session._id) return -1;
      const byDate = new Date(b.session.startDate ?? 0).getTime() - new Date(a.session.startDate ?? 0).getTime();
      return byDate || String(b.session.name ?? "").localeCompare(String(a.session.name ?? ""));
    }),
  };
}

/**
 * Reads GET /student/me/fees?session=… into a statement. An API that predates the
 * statement ignores `session` and answers with a plain array; that becomes a statement
 * with totals worked out here and `legacy: true` (no per-session or arrears data).
 */
export function toFeeStatement(body: unknown): FeeStatement {
  if (Array.isArray(body)) {
    const fees = body as Fee[];
    return { fees, enrollments: [], summary: summarise(fees), legacy: true };
  }
  const raw = (body ?? {}) as Partial<FeeStatement>;
  const fees = Array.isArray(raw.fees) ? raw.fees : [];
  const computed = summarise(fees);
  return {
    fees,
    enrollments: Array.isArray(raw.enrollments) ? raw.enrollments : [],
    summary: {
      totals: raw.summary?.totals ?? computed.totals,
      byFeeType: raw.summary?.byFeeType ?? computed.byFeeType,
      bySession: raw.summary?.bySession ?? computed.bySession,
    },
  };
}

export type FeeGroup = {
  /** Session id, or "none" for fees not tied to a session. */
  key: string;
  session: SessionRef;
  isCurrent: boolean;
  placement: FeePlacement | null;
  fees: Fee[];
  paid: number;
  outstanding: number;
};

/** Unpaid first (earliest due first), then paid (latest payment first). */
function orderFees(fees: Fee[]) {
  const time = (v?: string) => new Date(v ?? 0).getTime();
  return [
    ...fees.filter((f) => !f.isPaid).sort((a, b) => time(a.dueDate) - time(b.dueDate)),
    ...fees
      .filter((f) => f.isPaid)
      .sort((a, b) => time(b.userPayment?.createdAt) - time(a.userPayment?.createdAt)),
  ];
}

/**
 * The statement's fees grouped by session, newest session first and fees with no
 * session last. Totals and placement come from the API's per-session summary when it
 * has a row for the session; otherwise they are added up here.
 */
export function groupFeesBySession(statement: FeeStatement): FeeGroup[] {
  const rows = new Map(statement.summary.bySession.map((row) => [sessionKey(row.session), row]));
  const groups = new Map<string, FeeGroup>();
  statement.fees.forEach((fee) => {
    const key = sessionKey(fee.session);
    const group = groups.get(key) ?? {
      key,
      session: fee.session?._id ? fee.session : { _id: null, name: "Other fees" },
      isCurrent: !!fee.session?.isCurrent,
      placement: rows.get(key)?.placement ?? null,
      fees: [],
      paid: 0,
      outstanding: 0,
    };
    const { paid, outstanding } = feeFigures(fee);
    group.fees.push(fee);
    group.paid += paid;
    group.outstanding += outstanding;
    groups.set(key, group);
  });

  const order = [...rows.keys()];
  const rank = (g: FeeGroup) => {
    if (g.key === "none") return Number.MAX_SAFE_INTEGER;
    const at = order.indexOf(g.key);
    return at === -1 ? order.length : at;
  };
  const start = (g: FeeGroup) => new Date(g.session.startDate ?? 0).getTime();

  return [...groups.values()]
    .map((g) => {
      const row = rows.get(g.key);
      return {
        ...g,
        fees: orderFees(g.fees),
        paid: round(row?.paid ?? g.paid),
        outstanding: round(row?.outstanding ?? g.outstanding),
      };
    })
    .sort((a, b) => rank(a) - rank(b) || start(b) - start(a));
}

/** The current session's name, from the statement (fees, per-session rows or enrollments). */
export function currentSessionName(statement: FeeStatement): string | null {
  return (
    statement.summary.bySession.find((r) => r.session.isCurrent)?.session.name ??
    statement.fees.find((f) => f.session?.isCurrent)?.session?.name ??
    statement.enrollments.find((e) => e.session?.isCurrent)?.session?.name ??
    null
  );
}

/** "Nursing · 200 Level" */
export function placementLabel(placement: FeePlacement | null | undefined) {
  return [placement?.program?.name, placement?.classLevel?.name].filter(Boolean).join(" · ");
}
