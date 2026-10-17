"use client";

import { IconBook2, IconFileCertificate, IconReceipt2 } from "@tabler/icons-react";
import { motion } from "motion/react";
import Link from "next/link";
import { SchoolLogo } from "@/components/brand/school-logo";
import { GradientMesh } from "@/components/motion/gradient-mesh";
import { getConfig } from "@/lib/config";

const ease = [0.16, 1, 0.3, 1] as const;

export function AuthLayoutClient({ children }: { children: React.ReactNode }) {
  const { branding } = getConfig();

  return (
    <div className="relative isolate flex min-h-dvh flex-col">
      <GradientMesh className="-z-10" />

      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_minmax(0,28rem)] lg:gap-16 lg:py-12">
        {/* Desktop: who this portal belongs to and what it's for. */}
        <motion.aside
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="hidden lg:block"
        >
          <SchoolLogo className="size-16 text-2xl" />
          <p className="font-display mt-6 max-w-lg text-[2.75rem] leading-[1.05] font-extrabold tracking-[-0.03em] text-balance">
            {branding.appName}
          </p>
          <p className="text-muted-foreground mt-4 max-w-md text-lg">
            Pay your fees, check your results and keep up with school notices, all in one place.
          </p>
          <ul className="mt-8 flex flex-col gap-3 text-[0.9375rem] font-medium">
            {[
              { icon: IconReceipt2, text: "Pay fees on Paystack and download receipts" },
              { icon: IconBook2, text: "See your GPA, CGPA and carry-overs" },
              { icon: IconFileCertificate, text: "Print course forms, result slips and transcripts" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="bg-card/80 text-primary-ink grid size-9 place-items-center rounded-full shadow-[var(--shadow-soft)]">
                  <Icon className="size-[1.125rem]" aria-hidden />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </motion.aside>

        <div className="flex w-full flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease, delay: 0.05 }}
            className="bg-card w-full max-w-md rounded-[1.75rem] border p-6 shadow-[var(--shadow-lift)] sm:p-8"
          >
            <Link href="/auth/sign-in" className="mb-6 flex items-center gap-3 lg:hidden">
              <SchoolLogo className="size-11 text-lg" />
              <span className="font-display text-[0.9375rem] leading-tight font-extrabold">{branding.appName}</span>
            </Link>
            {children}
          </motion.div>
          <p className="text-muted-foreground mt-6 max-w-md px-2 text-center text-sm">© {new Date().getFullYear()} {branding.appName}</p>
        </div>
      </div>
    </div>
  );
}
