"use client";

import {
  IconAlertTriangle,
  IconDownload,
  IconRefresh,
  IconShare,
  IconX,
  IconZoomIn,
  IconZoomOut,
} from "@tabler/icons-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchPdf, pdfFileName, savePdf } from "@/lib/api/download";

type PdfJs = typeof import("pdfjs-dist/legacy/build/pdf.mjs");
type PdfDoc = Awaited<ReturnType<PdfJs["getDocument"]>["promise"]>;

let pdfjsPromise: Promise<PdfJs> | null = null;

/** pdf.js loads on first use only (it's large); the legacy build covers older phones. */
function loadPdfJs() {
  pdfjsPromise ??= import("pdfjs-dist/legacy/build/pdf.mjs").then((lib) => {
    lib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
    return lib;
  });
  return pdfjsPromise;
}

const ZOOMS = [1, 1.25, 1.5, 2];

/** Draws every page to a canvas sized to the container width (sharp on high-DPI screens). */
function PdfPages({ doc, zoom }: { doc: PdfDoc; zoom: number }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !width) return;
    let cancelled = false;
    const tasks: { cancel: () => void }[] = [];

    (async () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      for (let n = 1; n <= doc.numPages; n++) {
        const page = await doc.getPage(n);
        if (cancelled) return;
        const base = page.getViewport({ scale: 1 });
        const cssWidth = width * zoom;
        const viewport = page.getViewport({ scale: (cssWidth / base.width) * dpr });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${(viewport.height / dpr).toFixed(1)}px`;
        canvas.className = "mx-auto block bg-white shadow-[var(--shadow-soft)] rounded-sm";
        canvas.setAttribute("aria-label", `Page ${n} of ${doc.numPages}`);
        canvas.setAttribute("role", "img");
        const task = page.render({ canvas, viewport });
        tasks.push(task);
        await task.promise;
        if (cancelled) return;
        // Show pages as they finish rather than waiting for the whole document.
        if (n === 1) {
          host.replaceChildren(canvas);
          setReady(true);
        } else host.appendChild(canvas);
      }
    })().catch((e) => {
      if (!cancelled && (e as Error)?.name !== "RenderingCancelledException") {
        console.error("PDF render failed", e);
      }
    });

    return () => {
      cancelled = true;
      tasks.forEach((t) => t.cancel());
    };
  }, [doc, width, zoom]);

  return (
    <div className="overflow-x-auto">
      {/* The host's children are canvases managed here, never by React. */}
      <div ref={hostRef} className="flex flex-col gap-4" />
      {!ready ? <Skeleton className="mx-auto aspect-[1/1.414] w-full max-w-3xl rounded-sm" /> : null}
    </div>
  );
}

type ViewerProps = { endpoint: string; filename: string; title: string };

/**
 * Header + pages. Mounted only while the dialog is open (Radix unmounts closed
 * content) and re-keyed on retry, so every open starts from a clean state.
 */
function ViewerBody({ endpoint, filename, title, onRetry }: ViewerProps & { onRetry: () => void }) {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [doc, setDoc] = useState<PdfDoc | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoomIdx, setZoomIdx] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    let loaded: PdfDoc | null = null;

    (async () => {
      const [file, lib] = await Promise.all([fetchPdf(endpoint, ctrl.signal), loadPdfJs()]);
      if (ctrl.signal.aborted) return;
      setBlob(file);
      const data = new Uint8Array(await file.arrayBuffer());
      loaded = await lib.getDocument({ data, isEvalSupported: false }).promise;
      if (ctrl.signal.aborted) {
        loaded.destroy();
        return;
      }
      setDoc(loaded);
    })().catch((e) => {
      if (ctrl.signal.aborted) return;
      setError(e instanceof Error ? e.message : "Couldn't open the document.");
    });

    return () => {
      ctrl.abort();
      loaded?.destroy();
    };
  }, [endpoint]);

  const file = useMemo(
    () => (blob ? new File([blob], pdfFileName(filename), { type: "application/pdf" }) : null),
    [blob, filename],
  );
  const canShare =
    !!file && typeof navigator !== "undefined" && !!navigator.canShare && navigator.canShare({ files: [file] });

  const share = async () => {
    if (!file) return;
    try {
      await navigator.share({ files: [file], title });
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") toast.error("Couldn't share. Use Download instead.");
    }
  };

  return (
    <>
      <header className="bg-card flex items-center gap-2 border-b px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 sm:px-4 sm:pt-3">
        <DialogPrimitive.Close
          className="text-muted-foreground hover:bg-muted hover:text-foreground grid size-10 shrink-0 place-items-center rounded-full transition-colors"
          aria-label="Close preview"
        >
          <IconX className="size-5" />
        </DialogPrimitive.Close>
        <div className="min-w-0 flex-1">
          <DialogPrimitive.Title className="font-display truncate text-base font-bold">{title}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="text-muted-foreground truncate text-xs">
            {doc
              ? `${doc.numPages} ${doc.numPages === 1 ? "page" : "pages"} · PDF`
              : error
                ? "Not available"
                : "Preparing document…"}
          </DialogPrimitive.Description>
        </div>
        <div className="hidden items-center gap-1 sm:flex">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Zoom out"
            disabled={!doc || zoomIdx === 0}
            onClick={() => setZoomIdx((i) => Math.max(0, i - 1))}
          >
            <IconZoomOut />
          </Button>
          <span className="num text-muted-foreground w-12 text-center text-sm">{Math.round(ZOOMS[zoomIdx] * 100)}%</span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Zoom in"
            disabled={!doc || zoomIdx === ZOOMS.length - 1}
            onClick={() => setZoomIdx((i) => Math.min(ZOOMS.length - 1, i + 1))}
          >
            <IconZoomIn />
          </Button>
        </div>
        {canShare ? (
          <Button variant="ghost" size="icon" aria-label="Share" onClick={share} className="sm:hidden">
            <IconShare />
          </Button>
        ) : null}
        <Button
          onClick={() => blob && savePdf(blob, filename)}
          loading={!blob && !error}
          disabled={!blob}
          className="shrink-0"
        >
          <IconDownload />
          Download
        </Button>
      </header>

      <div
        aria-busy={!doc && !error}
        className="bg-muted/60 min-h-0 flex-1 overflow-y-auto px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-6"
      >
        {error ? (
          <div className="mx-auto flex max-w-sm flex-col items-center gap-3 py-16 text-center">
            <span className="bg-danger-soft text-danger grid size-12 place-items-center rounded-full">
              <IconAlertTriangle className="size-6" />
            </span>
            <p className="font-semibold">We couldn&apos;t open this document</p>
            <p className="text-muted-foreground text-sm">{error}</p>
            <Button variant="outline" onClick={onRetry}>
              <IconRefresh /> Try again
            </Button>
          </div>
        ) : doc ? (
          <PdfPages doc={doc} zoom={ZOOMS[zoomIdx]} />
        ) : (
          <div role="status" aria-label="Loading document" className="mx-auto w-full max-w-3xl">
            <Skeleton className="aspect-[1/1.414] w-full rounded-sm" />
          </div>
        )}
      </div>
    </>
  );
}

/**
 * In-app PDF preview: fetches the authenticated document, renders it with
 * pdf.js (works on phones, where <iframe> PDFs don't), and offers Download
 * (and Share where the device supports sharing files).
 */
export function PdfViewer({
  open,
  onOpenChange,
  ...props
}: ViewerProps & { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [attempt, setAttempt] = useState(0);
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-[55] bg-[oklch(0.2_0.02_40/0.55)] backdrop-blur-[2px]" />
        <DialogPrimitive.Content className="bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-6 fixed inset-0 z-[56] flex flex-col outline-none sm:inset-6 sm:mx-auto sm:max-w-4xl sm:overflow-hidden sm:rounded-[1.25rem] sm:shadow-[var(--shadow-lift)]">
          <ViewerBody key={attempt} {...props} onRetry={() => setAttempt((n) => n + 1)} />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
