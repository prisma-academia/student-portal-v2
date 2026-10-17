"use client";

import { IconCalendarEvent, IconExternalLink, IconSpeakerphone } from "@tabler/icons-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ResponsiveSheet } from "@/components/system/responsive-sheet";
import { Button } from "@/components/ui/button";
import { formatDate, formatDateTime, formatRelative } from "@/lib/format";
import type { Memo, SchoolEvent } from "@/types/student";

export function memoAuthor(m: Memo): string {
  const c = m.createdBy;
  if (!c || typeof c === "string") return "";
  return c.name ?? [c.firstName, c.lastName].filter(Boolean).join(" ");
}

export function eventWhen(e: SchoolEvent): string {
  if (!e.start) return "";
  if (e.allDay) return formatDate(e.start);
  const start = formatDateTime(e.start);
  if (!e.end || e.end === e.start) return start;
  const sameDay = new Date(e.start).toDateString() === new Date(e.end).toDateString();
  return sameDay
    ? `${start} – ${new Date(e.end).toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" })}`
    : `${start} – ${formatDateTime(e.end)}`;
}

/** Events from today on, soonest first. */
export function upcomingEvents(events: SchoolEvent[] | undefined) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return (events ?? [])
    .filter((e) => e.start && new Date(e.end ?? e.start).getTime() >= today.getTime())
    .sort((a, b) => new Date(a.start!).getTime() - new Date(b.start!).getTime());
}

/** Date tile for an event row: day number over short month. */
function DateTile({ iso }: { iso?: string }) {
  const d = iso ? new Date(iso) : null;
  return (
    <div className="bg-primary-soft text-primary-ink grid size-12 shrink-0 place-items-center rounded-[var(--radius-md)] leading-none">
      <div className="text-center">
        <div className="num text-lg font-extrabold">{d ? d.getDate() : "–"}</div>
        <div className="text-[0.6875rem] font-bold uppercase">
          {d ? d.toLocaleDateString("en-NG", { month: "short" }) : ""}
        </div>
      </div>
    </div>
  );
}

export function EventRow({ event, onOpen }: { event: SchoolEvent; onOpen: (e: SchoolEvent) => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(event)}
        className="hover:bg-muted/60 flex w-full items-center gap-3 px-4 py-3 text-left transition-colors sm:px-5"
      >
        <DateTile iso={event.start} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{event.title || "School event"}</p>
          <p className="text-muted-foreground truncate text-sm">
            {eventWhen(event)}
            {event.start ? ` · ${formatRelative(event.start)}` : ""}
          </p>
        </div>
      </button>
    </li>
  );
}

export function MemoRow({ memo, onOpen }: { memo: Memo; onOpen: (m: Memo) => void }) {
  const author = memoAuthor(memo);
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(memo)}
        className="hover:bg-muted/60 flex w-full items-center gap-3 px-4 py-3 text-left transition-colors sm:px-5"
      >
        <div className="bg-muted text-foreground/70 grid size-12 shrink-0 place-items-center rounded-[var(--radius-md)]">
          <IconSpeakerphone className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{memo.name}</p>
          <p className="text-muted-foreground truncate text-sm">
            {[formatDate(memo.createdAt), author].filter(Boolean).join(" · ")}
          </p>
        </div>
      </button>
    </li>
  );
}

export function MemoSheet({ memo, onOpenChange }: { memo: Memo | null; onOpenChange: (o: boolean) => void }) {
  const author = memo ? memoAuthor(memo) : "";
  return (
    <ResponsiveSheet
      open={!!memo}
      onOpenChange={onOpenChange}
      title={memo?.name ?? "Memo"}
      description={memo ? [formatDate(memo.createdAt), author].filter(Boolean).join(" · ") : undefined}
    >
      {memo?.content ? (
        <div className="prose prose-sm dark:prose-invert prose-headings:font-display prose-a:text-primary-ink max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{memo.content}</ReactMarkdown>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">This memo has a title only, with no further details.</p>
      )}
    </ResponsiveSheet>
  );
}

export function EventSheet({
  event,
  onOpenChange,
}: {
  event: SchoolEvent | null;
  onOpenChange: (o: boolean) => void;
}) {
  return (
    <ResponsiveSheet
      open={!!event}
      onOpenChange={onOpenChange}
      title={event?.title || "School event"}
      description={event ? eventWhen(event) : undefined}
      footer={
        event?.url ? (
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <a href={event.url} target="_blank" rel="noopener noreferrer">
              <IconExternalLink />
              Open link
            </a>
          </Button>
        ) : undefined
      }
    >
      <div className="flex items-start gap-3">
        <IconCalendarEvent className="text-primary-ink mt-0.5 size-5 shrink-0" aria-hidden />
        <p className="text-sm">
          {event?.start ? formatRelative(event.start).replace(/^./, (c) => c.toUpperCase()) : ""}
          {event?.allDay ? " · All day" : ""}
        </p>
      </div>
      {event?.description ? (
        <p className="mt-4 text-[0.9375rem] whitespace-pre-line">{event.description}</p>
      ) : (
        <p className="text-muted-foreground mt-4 text-sm">No further details were added to this event.</p>
      )}
    </ResponsiveSheet>
  );
}
