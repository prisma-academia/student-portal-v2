"use client";

import { IconDownload, IconLoader2 } from "@tabler/icons-react";
import { useState, type ComponentProps, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { openPdf } from "@/lib/api/download";

/** A button that downloads an authenticated PDF, with a spinner and real errors. */
export function PdfButton({
  endpoint,
  filename,
  children,
  icon,
  ...props
}: Omit<ComponentProps<typeof Button>, "onClick"> & {
  endpoint: string;
  filename: string;
  children: ReactNode;
  icon?: ReactNode;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      {...props}
      disabled={busy || props.disabled}
      aria-busy={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await openPdf(endpoint, filename);
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Download failed. Try again.");
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? <IconLoader2 className="animate-spin" /> : (icon ?? <IconDownload />)}
      {children}
    </Button>
  );
}
