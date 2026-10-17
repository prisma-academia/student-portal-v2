"use client";

import { IconCalendarEvent, IconList, IconSpeakerphone } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/system/empty-state";
import { PageHeader, SectionHeading } from "@/components/system/page-header";
import { ListSkeleton } from "@/components/system/page-loader";
import { rowList } from "@/components/system/row-list";
import { QueryErrorPanel } from "@/components/system/query-error-panel";
import { Button } from "@/components/ui/button";
import {
  EventRow,
  EventSheet,
  MemoRow,
  MemoSheet,
  upcomingEvents,
} from "@/components/updates/update-parts";
import { useEvents, useMemos } from "@/lib/queries";
import type { Memo, SchoolEvent } from "@/types/student";

// FullCalendar is heavy; only load it when the student asks for the calendar.
const EventsCalendar = dynamic(
  () => import("@/components/events-calendar").then((m) => m.EventsCalendar),
  { ssr: false, loading: () => <ListSkeleton rows={4} /> },
);

export default function UpdatesPage() {
  const events = useEvents();
  const memos = useMemos();
  const [view, setView] = useState<"list" | "calendar">("list");
  const [memo, setMemo] = useState<Memo | null>(null);
  const [event, setEvent] = useState<SchoolEvent | null>(null);

  const upcoming = useMemo(() => upcomingEvents(events.data), [events.data]);
  const sortedMemos = useMemo(
    () =>
      [...(memos.data ?? [])].sort(
        (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
      ),
    [memos.data],
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Updates" description="Memos from the school and events on your calendar." />

      <div className="grid gap-7 lg:grid-cols-2 lg:gap-8">
        <section aria-labelledby="memos-h">
          <SectionHeading title={<span id="memos-h">Memos</span>} />
          {memos.isPending ? (
            <ListSkeleton rows={3} />
          ) : memos.isError ? (
            <QueryErrorPanel message={memos.error.message} onRetry={() => memos.refetch()} />
          ) : !sortedMemos.length ? (
            <EmptyState icon={<IconSpeakerphone />} title="No memos" description="Memos the school sends to your class appear here." />
          ) : (
            <ul className={rowList}>
              {sortedMemos.map((m) => (
                <MemoRow key={m._id} memo={m} onOpen={setMemo} />
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="events-h">
          <SectionHeading
            title={<span id="events-h">{view === "list" ? "Upcoming events" : "Calendar"}</span>}
            action={
              events.data?.length ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setView((v) => (v === "list" ? "calendar" : "list"))}
                >
                  {view === "list" ? <IconCalendarEvent /> : <IconList />}
                  {view === "list" ? "Calendar view" : "List view"}
                </Button>
              ) : null
            }
          />
          {events.isPending ? (
            <ListSkeleton rows={3} />
          ) : events.isError ? (
            <QueryErrorPanel message={events.error.message} onRetry={() => events.refetch()} />
          ) : view === "calendar" ? (
            <EventsCalendar events={events.data ?? []} onSelect={setEvent} />
          ) : !upcoming.length ? (
            <EmptyState
              icon={<IconCalendarEvent />}
              title="Nothing coming up"
              description={
                events.data?.length
                  ? "There are no upcoming events. Past events are in the calendar view."
                  : "Exam dates, lectures and school events will show here."
              }
            />
          ) : (
            <ul className={rowList}>
              {upcoming.map((e) => (
                <EventRow key={e._id} event={e} onOpen={setEvent} />
              ))}
            </ul>
          )}
        </section>
      </div>

      <MemoSheet memo={memo} onOpenChange={(o) => !o && setMemo(null)} />
      <EventSheet event={event} onOpenChange={(o) => !o && setEvent(null)} />
    </div>
  );
}
