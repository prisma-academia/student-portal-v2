"use client";

import { IconExternalLink, IconFileText, IconFolder } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/system/empty-state";
import { PageHeader } from "@/components/system/page-header";
import { ListSkeleton } from "@/components/system/page-loader";
import { rowList } from "@/components/system/row-list";
import { QueryErrorPanel } from "@/components/system/query-error-panel";
import { ResponsiveSheet } from "@/components/system/responsive-sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { resolveAssetUrl } from "@/lib/config";
import { useDocuments } from "@/lib/queries";
import type { StudentDocument } from "@/types/student";

function formatSize(bytes?: number) {
  if (bytes == null || Number.isNaN(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileUrl(doc: StudentDocument) {
  return resolveAssetUrl(doc.file) ?? doc.file;
}

function DocumentList({ docs, onOpen, emptyText }: { docs: StudentDocument[]; onOpen: (d: StudentDocument) => void; emptyText: string }) {
  if (!docs.length) {
    return <EmptyState icon={<IconFolder />} title="No documents" description={emptyText} />;
  }
  return (
    <ul className={rowList}>
      {docs.map((doc) => (
        <li key={doc._id}>
          <button
            type="button"
            onClick={() => onOpen(doc)}
            className="hover:bg-muted/60 flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors sm:px-5"
          >
            <span className="bg-primary-soft text-primary-ink grid size-11 shrink-0 place-items-center rounded-[var(--radius-md)]">
              <IconFileText className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{doc.title}</span>
              <span className="text-muted-foreground block truncate text-sm">
                {[doc.course?.code, formatSize(doc.size)].filter(Boolean).join(" · ") || "Document"}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function ResourcesPage() {
  const q = useDocuments();
  const [selected, setSelected] = useState<StudentDocument | null>(null);

  const { publicDocs, sharedDocs } = useMemo(() => {
    const all = q.data ?? [];
    return { publicDocs: all.filter((d) => d.isPublic), sharedDocs: all.filter((d) => !d.isPublic) };
  }, [q.data]);

  const url = selected ? fileUrl(selected) : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Resources" description="Handouts, notes and forms shared by the school and your lecturers." />

      {q.isPending ? (
        <ListSkeleton rows={4} />
      ) : q.isError ? (
        <QueryErrorPanel message={q.error.message} onRetry={() => q.refetch()} />
      ) : (
        <Tabs defaultValue={sharedDocs.length && !publicDocs.length ? "shared" : "public"} className="gap-5">
          <TabsList className="bg-muted h-11 w-full rounded-full p-1 sm:w-auto sm:self-start">
            <TabsTrigger value="public" className="h-9 rounded-full px-5 text-sm font-semibold">
              For everyone <span className="num text-muted-foreground ml-1">{publicDocs.length}</span>
            </TabsTrigger>
            <TabsTrigger value="shared" className="h-9 rounded-full px-5 text-sm font-semibold">
              For my class <span className="num text-muted-foreground ml-1">{sharedDocs.length}</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="public">
            <DocumentList docs={publicDocs} onOpen={setSelected} emptyText="School-wide documents will appear here." />
          </TabsContent>
          <TabsContent value="shared">
            <DocumentList
              docs={sharedDocs}
              onOpen={setSelected}
              emptyText="Documents shared with your programme or level will appear here."
            />
          </TabsContent>
        </Tabs>
      )}

      <ResponsiveSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.title ?? "Document"}
        description={selected ? [selected.course?.code, formatSize(selected.size)].filter(Boolean).join(" · ") || undefined : undefined}
        className="sm:max-w-3xl"
        footer={
          url ? (
            <Button asChild size="lg" className="w-full sm:w-auto">
              <a href={url} target="_blank" rel="noopener noreferrer">
                <IconExternalLink />
                Open document
              </a>
            </Button>
          ) : undefined
        }
      >
        {url ? (
          <>
            {/* Inline preview where browsers render PDFs in frames; phones open the file instead. */}
            <div className="bg-muted relative hidden aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-md)] sm:block">
              <iframe title={selected?.title ?? "Document"} src={url} className="absolute inset-0 size-full border-0" />
            </div>
            <p className="text-muted-foreground text-sm sm:hidden">
              Tap <span className="text-foreground font-semibold">Open document</span> to view or save it on your phone.
            </p>
          </>
        ) : null}
      </ResponsiveSheet>
    </div>
  );
}
