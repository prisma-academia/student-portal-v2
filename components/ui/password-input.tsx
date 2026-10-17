"use client";

import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { useState, type ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Passwords never contain whitespace: strip it from typing, paste and autofill. */
export const stripWhitespace = (v: string) => v.replace(/\s+/g, "");

/**
 * Password field with a show/hide toggle. Spaces are removed as they're typed
 * or pasted (a pasted reg-number password often carries a trailing space).
 * Works controlled or uncontrolled: the DOM value is cleaned before onChange.
 */
export function PasswordInput({
  className,
  onChange,
  onKeyDown,
  value,
  ...props
}: Omit<ComponentProps<typeof Input>, "type">) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        {...props}
        type={show ? "text" : "password"}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        value={typeof value === "string" ? stripWhitespace(value) : value}
        className={cn("pr-12", className)}
        onKeyDown={(e) => {
          if (e.key === " ") e.preventDefault();
          onKeyDown?.(e);
        }}
        onChange={(e) => {
          const el = e.currentTarget;
          const clean = stripWhitespace(el.value);
          if (clean !== el.value) {
            const caret = Math.max(0, (el.selectionStart ?? clean.length) - (el.value.length - clean.length));
            el.value = clean;
            el.setSelectionRange?.(caret, caret);
          }
          onChange?.(e);
        }}
      />
      <button
        type="button"
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-[var(--radius-md)]"
        onClick={() => setShow((v) => !v)}
      >
        {show ? <IconEyeOff className="size-5" /> : <IconEye className="size-5" />}
      </button>
    </div>
  );
}
