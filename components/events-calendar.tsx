"use client";

import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import type { SchoolEvent } from "@/types/student";

function categoryClass(category?: string) {
  const cat = String(category ?? "general").toLowerCase();
  if (cat.includes("department")) return "category-department";
  if (cat.includes("class")) return "category-class";
  return "category-general";
}

/** Month grid on wide screens, list on phones. Category tints come from the brand palette (globals.css). */
export function EventsCalendar({
  events,
  onSelect,
}: {
  events: SchoolEvent[];
  onSelect: (ev: SchoolEvent) => void;
}) {
  const [view, setView] = useState("listMonth");

  const fcEvents = useMemo(
    () =>
      events
        .filter((e) => e.start)
        .map((e) => ({
          id: e._id,
          title: e.title || "School event",
          start: e.start,
          end: e.end,
          allDay: e.allDay,
          classNames: [categoryClass(e.category)],
        })),
    [events],
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setView(mq.matches ? "dayGridMonth" : "listMonth");
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <div className="fc-calendar-root bg-card w-full overflow-hidden rounded-[var(--radius-xl)] border p-2 sm:p-3">
      <FullCalendar
        key={view}
        plugins={[dayGridPlugin, listPlugin]}
        initialView={view}
        headerToolbar={{ left: "prev,next", center: "title", right: "today" }}
        height="auto"
        events={fcEvents}
        noEventsContent="No events this month"
        eventClick={(info) => {
          info.jsEvent.preventDefault();
          const hit = events.find((e) => e._id === info.event.id);
          if (hit) onSelect(hit);
        }}
      />
    </div>
  );
}
