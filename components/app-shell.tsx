"use client";

import {
  IconChevronDown,
  IconDeviceDesktop,
  IconKey,
  IconLogout,
  IconMoon,
  IconSun,
  IconUserCircle,
} from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { SchoolLogo } from "@/components/brand/school-logo";
import { StudentAvatar } from "@/components/student/student-avatar";
import { NavPendingPill } from "@/components/system/nav-progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getConfig } from "@/lib/config";
import { displayName, fullName } from "@/lib/format";
import { NAV, isActive } from "@/lib/nav";
import { navProgress } from "@/lib/nav-progress";
import { splitFees, useFees, useStudent } from "@/lib/queries";
import {
  applyThemePreference,
  readThemePreference,
  type ThemePreference,
} from "@/lib/theme";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

function useUnpaidCount() {
  const fees = useFees();
  return splitFees(fees.data).outstanding.length;
}

function ProfileMenu() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logOut = useAuthStore((s) => s.logOut);
  const { data: student } = useStudent();
  // The menu content only mounts on open (client-side), so reading storage here is safe.
  const [theme, setTheme] = useState<ThemePreference>(() =>
    typeof window === "undefined" ? "system" : readThemePreference(),
  );
  const name = displayName(fullName(student?.personalInfo)) || "Student";

  const signOut = () => {
    navProgress.start();
    logOut();
    queryClient.clear();
    router.replace("/auth/sign-in");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="hover:bg-muted data-[state=open]:bg-muted flex min-h-11 items-center gap-2 rounded-full py-1 pr-2 pl-1 transition-colors sm:pr-3"
        aria-label={`Account menu for ${name}`}
      >
        <StudentAvatar student={student} className="size-9" />
        <span className="flex min-w-0 flex-col items-start text-left leading-tight">
          <span className="hidden max-w-[10rem] truncate text-sm font-semibold sm:block">{name}</span>
          <span className="num text-muted-foreground text-xs font-semibold sm:text-[0.75rem]">
            {student?.regNumber ?? ""}
          </span>
        </span>
        <IconChevronDown className="text-muted-foreground hidden size-4 sm:block" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-72">
        <div className="flex items-center gap-3 px-2.5 py-2.5">
          <StudentAvatar student={student} className="size-12" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{name}</p>
            <p className="num text-muted-foreground text-sm">{student?.regNumber}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <IconUserCircle />
            My profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/auth/change-password">
            <IconKey />
            Change password
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(v) => {
            const pref = v as ThemePreference;
            setTheme(pref);
            applyThemePreference(pref);
          }}
        >
          <DropdownMenuRadioItem value="light">
            <IconSun /> Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <IconMoon /> Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <IconDeviceDesktop /> Match my device
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={signOut}>
          <IconLogout />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CountBadge({ count, className }: { count: number; className?: string }) {
  if (!count) return null;
  return (
    <span
      className={cn(
        "bg-primary text-primary-foreground num grid h-[1.125rem] min-w-[1.125rem] place-items-center rounded-full px-1 text-[0.6875rem] leading-none font-bold",
        className,
      )}
      aria-label={`${count} unpaid`}
    >
      {count}
    </span>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { branding } = getConfig();
  const unpaid = useUnpaidCount();

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="bg-primary text-primary-foreground sr-only z-[70] rounded-md px-3 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>

      <header className="bg-background/85 supports-[backdrop-filter]:bg-background/70 sticky top-0 z-40 border-b border-[color-mix(in_oklch,var(--border)_70%,transparent)] pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2.5 rounded-lg" aria-label={`${branding.appName} home`}>
            <SchoolLogo className="size-9 text-base" />
            <span className="font-display hidden max-w-[14rem] truncate text-[0.9375rem] font-extrabold xl:inline">
              {branding.appName}
            </span>
          </Link>

          <nav aria-label="Main" className="ml-2 hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active = isActive(item, pathname);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative inline-flex h-10 items-center gap-2 rounded-full px-3.5 text-sm font-semibold transition-colors",
                    active ? "text-primary-ink" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {active ? (
                    <motion.span
                      layoutId="nav-pill-desktop"
                      className="bg-primary-soft absolute inset-0 -z-10 rounded-full"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  ) : (
                    <NavPendingPill className="-z-10" />
                  )}
                  <Icon className="size-[1.125rem]" aria-hidden />
                  {item.label}
                  {item.href === "/payments" ? <CountBadge count={unpaid} /> : null}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto">
            <ProfileMenu />
          </div>
        </div>
      </header>

      <main
        id="main"
        className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pt-5 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:px-6 sm:pt-8 md:pb-12"
      >
        {children}
      </main>

      <nav
        aria-label="Main"
        className="bg-card/92 supports-[backdrop-filter]:bg-card/80 fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-xl md:hidden"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {NAV.map((item) => {
            const active = isActive(item, pathname);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex min-h-[3.75rem] flex-col items-center justify-center gap-1 text-[0.75rem] font-semibold transition-colors",
                    active ? "text-primary-ink" : "text-muted-foreground",
                  )}
                >
                  <span className="relative grid h-8 w-14 place-items-center">
                    {active ? (
                      <motion.span
                        layoutId="nav-pill-mobile"
                        className="bg-primary-soft absolute inset-0 rounded-full"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    ) : (
                      <NavPendingPill />
                    )}
                    <Icon className="relative size-[1.375rem]" stroke={active ? 2.2 : 1.8} aria-hidden />
                    {item.href === "/payments" ? (
                      <CountBadge count={unpaid} className="absolute -top-1 right-1.5 ring-2 ring-[var(--card)]" />
                    ) : null}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
