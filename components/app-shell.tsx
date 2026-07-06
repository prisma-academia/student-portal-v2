"use client";

import {
  IconHome,
  IconSchool,
  IconFiles,
  IconUser,
  IconLogout,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getConfig } from "@/lib/config";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const NAV = [
  { href: "/", label: "Home", icon: IconHome },
  { href: "/school", label: "School", icon: IconSchool },
  { href: "/resource", label: "Resources", icon: IconFiles },
  { href: "/profile", label: "Profile", icon: IconUser },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const logOut = useAuthStore((s) => s.logOut);
  const user = useAuthStore((s) => s.user);
  const { branding } = getConfig();

  const handleSignOut = () => {
    logOut();
    router.replace("/auth/sign-in");
  };

  return (
    <div className="flex min-h-full flex-col">
      <header className="bg-card/80 supports-[backdrop-filter]:bg-card/70 sticky top-0 z-40 border-b backdrop-blur-md">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-2 px-3 sm:h-14 sm:px-4">
          <Link href="/" className="flex min-w-0 items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={branding.logoUrl}
              alt={branding.logoAlt}
              className="h-8 w-auto shrink-0 object-contain sm:h-9"
            />
            <span className="text-foreground hidden truncate text-sm font-semibold sm:inline">
              {branding.appShortName}
            </span>
          </Link>

          <nav className="text-muted-foreground hidden items-center gap-0.5 md:flex">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex min-w-0 items-center gap-2">
            <span className="text-muted-foreground hidden max-w-[140px] truncate text-xs sm:block">
              {user?.regNumber ?? user?.email ?? ""}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="shrink-0 md:hidden"
              onClick={handleSignOut}
              aria-label="Sign out"
            >
              <IconLogout className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="hidden md:inline-flex"
              onClick={handleSignOut}
            >
              <IconLogout className="size-3.5" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-3 py-4 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:px-4 sm:py-6 md:pb-8">
        {children}
      </main>

      <Separator className="md:hidden" />

      <nav className="bg-card/95 fixed right-0 bottom-0 left-0 z-40 border-t pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-md md:hidden">
        <ul className="mx-auto flex max-w-lg justify-around">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  className={cn(
                    "flex min-h-12 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[0.65rem] font-medium",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="size-5 shrink-0" aria-hidden />
                  <span className="truncate">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
