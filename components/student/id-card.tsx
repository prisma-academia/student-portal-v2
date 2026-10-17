"use client";

import { IconCheck, IconCopy } from "@tabler/icons-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { StudentAvatar } from "@/components/student/student-avatar";
import { levelLabel } from "@/lib/academic-levels";
import { getConfig } from "@/lib/config";
import { displayName, fullName } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Student } from "@/types/student";

/** Interleaved sine curves sweeping across the card, offset in phase. */
const GUILLOCHE: string[] = Array.from({ length: 14 }, (_, k) => {
  const phase = (k / 14) * Math.PI * 2;
  const amp = 26 + (k % 4) * 7;
  const mid = 40 + k * 13;
  let d = "";
  for (let x = -20; x <= 420; x += 8) {
    const y = mid + Math.sin(x / 34 + phase) * amp * Math.cos(x / 170 + phase / 2);
    d += (x === -20 ? "M" : "L") + x + " " + y.toFixed(1) + " ";
  }
  return d.trim();
});

/**
 * The student's identity card: passport photo, name, reg number and programme
 * on a field of the school colour. Signature move of the portal: a faint
 * guilloche like a printed ID, a light sweep and a slight tilt when pressed.
 */
export function IdCard({
  student,
  className,
}: {
  student: Student | null | undefined;
  className?: string;
}) {
  const { branding } = getConfig();
  const [copied, setCopied] = useState(false);
  const name = displayName(fullName(student?.personalInfo)) || "Student";
  const reg = student?.regNumber ?? "";
  const level = student?.classLevel?.level != null ? levelLabel(student.classLevel.level) : null;
  const set = student?.classLevel?.set;

  const copyReg = async () => {
    if (!reg) return;
    try {
      await navigator.clipboard.writeText(reg);
      setCopied(true);
      toast.success("Reg number copied");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Couldn't copy. Long-press the number to copy it.");
    }
  };

  return (
    <motion.section
      aria-label="Student ID"
      whileTap={{ scale: 0.985, rotateX: 3, rotateY: -2 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      style={{ transformPerspective: 900 }}
      className={cn(
        "group bg-[color-mix(in_oklch,var(--primary)_86%,black)] text-primary-foreground relative isolate overflow-hidden rounded-[1.5rem] p-4 shadow-[var(--shadow-lift)] sm:p-5",
        className,
      )}
    >
      {/* guilloche (security-print curves) + depth */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 size-full opacity-[0.14]"
        viewBox="0 0 400 240"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.75"
      >
        {GUILLOCHE.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </svg>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_100%_0%,oklch(1_0_0/0.18),transparent_55%),linear-gradient(to_top,oklch(0_0_0/0.18),transparent_60%)]"
      />
      <div aria-hidden className="id-sheen pointer-events-none absolute inset-0" />

      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-[0.8125rem] font-semibold opacity-90">{branding.appName}</p>
        {student?.status && student.status !== "active" ? (
          <span className="rounded-full bg-black/20 px-2.5 py-0.5 text-xs font-bold capitalize">{student.status}</span>
        ) : null}
      </div>

      <div className="mt-4 flex items-center gap-4">
        <StudentAvatar
          student={student}
          className="size-[4.5rem] shrink-0 rounded-[1.1rem] ring-[3px] ring-white/70 sm:size-20 [&_[data-slot=avatar-fallback]]:rounded-[1.1rem] [&_[data-slot=avatar-fallback]]:text-xl"
        />
        <div className="min-w-0 flex-1">
          <h2 className="font-display truncate text-xl leading-tight font-extrabold sm:text-2xl">{name}</h2>
          <button
            type="button"
            onClick={copyReg}
            className="num mt-1 inline-flex min-h-11 items-center gap-1.5 rounded-lg py-1 pr-2 text-lg font-bold tracking-wide transition-colors hover:bg-black/10 focus-visible:outline-white"
            aria-label={`Reg number ${reg}. Copy`}
          >
            {reg || "—"}
            {copied ? <IconCheck className="size-4" /> : <IconCopy className="size-4 opacity-70" />}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5 text-[0.8125rem] font-semibold">
        {student?.program?.name ? (
          <span className="rounded-full bg-white/18 px-2.5 py-1 backdrop-blur-[1px]">{student.program.name}</span>
        ) : null}
        {level ? <span className="rounded-full bg-white/18 px-2.5 py-1">{level}</span> : null}
        {set ? <span className="rounded-full bg-white/18 px-2.5 py-1">Set {set}</span> : null}
      </div>
    </motion.section>
  );
}
