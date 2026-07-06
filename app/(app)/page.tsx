"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { EventsCalendar } from "@/components/events-calendar";
import type { SelectedCalendarEvent } from "@/components/events-calendar";
import { EmptyState } from "@/components/system/empty-state";
import { PageLoader } from "@/components/system/page-loader";
import { QueryErrorPanel } from "@/components/system/query-error-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { fetchEvents, fetchMemos } from "@/lib/api/student";
import { formatDate } from "@/lib/format";
import { useAuthStore } from "@/stores/auth-store";
import type { Memo } from "@/types/student";

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const [eventOpen, setEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SelectedCalendarEvent | null>(null);
  const [memoOpen, setMemoOpen] = useState(false);
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);

  const eventsQuery = useQuery({
    queryKey: ["student", "events"],
    queryFn: async () => {
      const res = await fetchEvents();
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
  });

  const memosQuery = useQuery({
    queryKey: ["student", "memos"],
    queryFn: async () => {
      const res = await fetchMemos();
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
  });

  const name = [user?.personalInfo?.firstName, user?.personalInfo?.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
          {name || "Student"}
          {user?.regNumber ? (
            <span className="text-muted-foreground font-normal">
              {" "}
              ({user.regNumber})
            </span>
          ) : null}
        </h1>
        <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
          Events and announcements for your program.
        </p>
      </div>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Calendar</h2>
        {eventsQuery.isPending ? (
          <PageLoader className="min-h-[200px] py-8" />
        ) : eventsQuery.isError ? (
          <QueryErrorPanel
            message={eventsQuery.error.message}
            onRetry={() => eventsQuery.refetch()}
          />
        ) : !eventsQuery.data?.length ? (
          <EmptyState title="No events" description="There are no events to show yet." />
        ) : (
          <EventsCalendar
            events={eventsQuery.data}
            onSelectEvent={(ev) => {
              setSelectedEvent(ev);
              setEventOpen(true);
            }}
          />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Memos</h2>
        {memosQuery.isPending ? (
          <PageLoader className="min-h-[120px] py-6" />
        ) : memosQuery.isError ? (
          <QueryErrorPanel
            message={memosQuery.error.message}
            onRetry={() => memosQuery.refetch()}
          />
        ) : !memosQuery.data?.length ? (
          <EmptyState title="No memos" description="No memos have been published." />
        ) : (
          <ul className="flex flex-col gap-2">
            {memosQuery.data.map((m) => (
              <li key={m._id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMemo(m);
                    setMemoOpen(true);
                  }}
                  className="hover:bg-muted/80 w-full rounded-lg border px-3 py-3 text-left transition-colors sm:px-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{m.name}</span>
                    {m.isPublic ? (
                      <Badge variant="secondary" className="text-[0.6rem]">
                        Public
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {formatDate(m.createdAt)} ·{" "}
                    {m.createdBy?.name ?? "Unknown"}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Dialog open={eventOpen} onOpenChange={setEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title ?? "Event"}</DialogTitle>
            <DialogDescription>
              {selectedEvent?.start
                ? new Date(selectedEvent.start).toLocaleString()
                : ""}
            </DialogDescription>
          </DialogHeader>
          {selectedEvent?.extendedProps &&
          Object.keys(selectedEvent.extendedProps).length > 0 ? (
            <pre className="bg-muted max-h-48 overflow-auto rounded-md p-2 text-[0.65rem] whitespace-pre-wrap">
              {JSON.stringify(selectedEvent.extendedProps, null, 2)}
            </pre>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={memoOpen} onOpenChange={setMemoOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedMemo?.name}</DialogTitle>
            <DialogDescription>
              {selectedMemo ? formatDate(selectedMemo.createdAt) : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
            {selectedMemo?.content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {selectedMemo.content}
              </ReactMarkdown>
            ) : (
              <p className="text-muted-foreground text-xs">
                No body content for this memo.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
