"use client";

import { IconFileTypePdf } from "@tabler/icons-react";
import { useState, type ComponentProps, type ReactNode } from "react";
import { PdfViewer } from "@/components/system/pdf-viewer";
import { Button } from "@/components/ui/button";

/** A button that opens an authenticated PDF in the in-app viewer (with Download there). */
export function PdfButton({
  endpoint,
  filename,
  title,
  children,
  icon,
  ...props
}: Omit<ComponentProps<typeof Button>, "onClick" | "title"> & {
  endpoint: string;
  filename: string;
  /** Viewer heading; defaults to the button's text when that's a plain string. */
  title?: string;
  children: ReactNode;
  icon?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const heading = title ?? (typeof children === "string" ? children : "Document");
  return (
    <>
      <Button type="button" variant="outline" {...props} onClick={() => setOpen(true)}>
        {icon ?? <IconFileTypePdf />}
        {children}
      </Button>
      <PdfViewer open={open} onOpenChange={setOpen} endpoint={endpoint} filename={filename} title={heading} />
    </>
  );
}
