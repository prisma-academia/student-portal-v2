"use client";

import { IconX } from "@tabler/icons-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Detail panel: a bottom sheet with a grab handle on phones (thumb reach),
 * a centred panel from `sm` up. Built on the Radix dialog, so focus is trapped
 * and Escape/back closes it.
 */
export function ResponsiveSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-[oklch(0.2_0.02_40/0.45)] backdrop-blur-[2px]" />
        <DialogPrimitive.Content
          className={cn(
            "bg-card text-card-foreground fixed z-50 flex max-h-[88dvh] w-full flex-col overflow-hidden shadow-[var(--shadow-lift)] outline-none",
            // phone: bottom sheet
            "inset-x-0 bottom-0 rounded-t-[1.5rem] duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
            // sm+: centred panel
            "sm:inset-x-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[1.25rem] sm:data-[state=open]:slide-in-from-bottom-4 sm:data-[state=closed]:slide-out-to-bottom-4 sm:data-[state=open]:zoom-in-[0.98]",
            className,
          )}
        >
          <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-[color-mix(in_oklch,var(--foreground)_18%,transparent)] sm:hidden" aria-hidden />
          <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-2 sm:px-6 sm:pt-6">
            <div className="min-w-0">
              <DialogPrimitive.Title className="font-display text-lg leading-snug font-bold">
                {title}
              </DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description className="text-muted-foreground mt-1 text-sm">
                  {description}
                </DialogPrimitive.Description>
              ) : (
                <DialogPrimitive.Description className="sr-only">Details</DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close
              className="text-muted-foreground hover:bg-muted hover:text-foreground -mt-1 -mr-2 grid size-10 shrink-0 place-items-center rounded-full transition-colors"
              aria-label="Close"
            >
              <IconX className="size-5" />
            </DialogPrimitive.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-6">{children}</div>
          {footer ? (
            <div className="bg-card flex flex-col-reverse gap-2 border-t px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:px-6 sm:pb-5">
              {footer}
            </div>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
