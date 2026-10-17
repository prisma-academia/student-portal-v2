"use client";

import { useLinkStatus } from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { navProgress } from "@/lib/nav-progress";
import { cn } from "@/lib/utils";

/** True when a click on this anchor will trigger a client-side route change. */
function isRouteChange(e: MouseEvent, a: HTMLAnchorElement) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
  if (a.target && a.target !== "_self") return false;
  if (a.hasAttribute("download")) return false;
  const url = new URL(a.href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  // Same page (or only the hash differs): nothing to load.
  return url.pathname !== window.location.pathname || url.search !== window.location.search;
}

function RouteWatcher() {
  const pathname = usePathname();
  const search = useSearchParams();
  useEffect(() => {
    navProgress.done();
  }, [pathname, search]);
  return null;
}

/**
 * A slim bar across the top of the screen that starts the instant a link is
 * tapped and finishes when the new route renders, so a slow network never
 * looks like a frozen app.
 */
export function NavProgress() {
  const pending = useSyncExternalStore(navProgress.subscribe, navProgress.get, () => false);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (a instanceof HTMLAnchorElement && isRouteChange(e, a)) navProgress.start();
    };
    // Capture phase: runs before Next's <Link> handler takes over the click.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    const clear = () => {
      timers.current.forEach((t) => {
        clearTimeout(t);
        clearInterval(t);
      });
      timers.current = [];
    };
    const unsubscribe = navProgress.subscribe(() => {
      clear();
      if (navProgress.get()) {
        setVisible(true);
        setProgress(0.12);
        // Trickle towards 90% (never reaching it) until the route arrives.
        const tick = window.setInterval(() => setProgress((p) => p + (0.9 - p) * 0.1), 250);
        // Safety net: a navigation that never resolves shouldn't leave the bar up.
        const giveUp = window.setTimeout(() => navProgress.done(), 20_000);
        timers.current.push(tick, giveUp);
      } else {
        setProgress(1);
        timers.current.push(
          window.setTimeout(() => setVisible(false), 320),
          window.setTimeout(() => setProgress(0), 650),
        );
      }
    });
    return () => {
      unsubscribe();
      clear();
    };
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <RouteWatcher />
      </Suspense>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none fixed inset-x-0 top-0 z-[90] h-[3px] transition-opacity duration-300",
          visible ? "opacity-100" : "opacity-0",
        )}
      >
        <div
          className="bg-primary h-full origin-left shadow-[0_0_10px_var(--primary),0_0_4px_var(--primary)] transition-transform duration-200 ease-out"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
      {pending ? (
        <span role="status" className="sr-only">
          Loading page
        </span>
      ) : null}
    </>
  );
}

/** Inside a nav <Link>: a soft pill + pulse the moment it's tapped, before the route lands. */
export function NavPendingPill({ className }: { className?: string }) {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      className={cn(
        "bg-primary-soft pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-150",
        pending && "animate-pulse opacity-70",
        className,
      )}
    />
  );
}
