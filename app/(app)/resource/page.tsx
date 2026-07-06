"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/system/empty-state";
import { PageLoader } from "@/components/system/page-loader";
import { QueryErrorPanel } from "@/components/system/query-error-panel";
import { fetchDocuments } from "@/lib/api/student";
import { resolveAssetUrl } from "@/lib/config";
import type { StudentDocument } from "@/types/student";

function formatSize(bytes?: number) {
  if (bytes == null || Number.isNaN(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function DocumentList({
  docs,
  onOpen,
}: {
  docs: StudentDocument[];
  onOpen: (d: StudentDocument) => void;
}) {
  if (!docs.length) {
    return (
      <EmptyState title="No documents" description="Nothing in this tab." />
    );
  }
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {docs.map((doc) => (
        <li key={doc._id}>
          <button
            type="button"
            onClick={() => onOpen(doc)}
            className="hover:bg-muted/80 flex h-full w-full flex-col rounded-lg border px-3 py-3 text-left sm:px-4"
          >
            <span className="text-sm font-medium">{doc.title}</span>
            <span className="text-muted-foreground mt-1 text-xs">
              {doc.course?.code ?? "No course"} · {formatSize(doc.size)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function ResourcePage() {
  const [selected, setSelected] = useState<StudentDocument | null>(null);
  const q = useQuery({
    queryKey: ["student", "documents"],
    queryFn: async () => {
      const res = await fetchDocuments();
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
  });

  const { publicDocs, sharedDocs } = useMemo(() => {
    const all = q.data ?? [];
    return {
      publicDocs: all.filter((d) => d.isPublic),
      sharedDocs: all.filter((d) => !d.isPublic),
    };
  }, [q.data]);

  const fileUrl = selected?.file
    ? resolveAssetUrl(selected.file) ?? selected.file
    : null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">Resources</h1>
        <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
          Public and shared documents. PDFs open below or in a new tab.
        </p>
      </div>
      <Separator />

      {q.isPending ? (
        <PageLoader className="min-h-[160px]" />
      ) : q.isError ? (
        <QueryErrorPanel
          message={q.error.message}
          onRetry={() => q.refetch()}
        />
      ) : (
        <Tabs defaultValue="public" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:inline-flex sm:w-auto">
            <TabsTrigger value="public">
              Public
              {publicDocs.length ? (
                <Badge variant="secondary" className="ml-1 text-[0.6rem]">
                  {publicDocs.length}
                </Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="shared">
              Shared
              {sharedDocs.length ? (
                <Badge variant="secondary" className="ml-1 text-[0.6rem]">
                  {sharedDocs.length}
                </Badge>
              ) : null}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="public" className="mt-4">
            <DocumentList docs={publicDocs} onOpen={setSelected} />
          </TabsContent>
          <TabsContent value="shared" className="mt-4">
            <DocumentList docs={sharedDocs} onOpen={setSelected} />
          </TabsContent>
        </Tabs>
      )}

      {selected && fileUrl ? (
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base">{selected.title}</CardTitle>
              <CardDescription className="text-xs">
                {formatSize(selected.size)}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" asChild>
                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                  Open in new tab
                </a>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelected(null)}
              >
                Close viewer
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="bg-muted relative aspect-[4/5] w-full min-h-[50vh] sm:aspect-video sm:min-h-[480px]">
              <iframe
                title={selected.title}
                src={fileUrl}
                className="absolute inset-0 size-full rounded-b-lg border-0"
              />
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
