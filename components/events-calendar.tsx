"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import { getConfig } from "@/lib/config";

export type SelectedCalendarEvent = {
  title: string;
  start?: Date | null;
  end?: Date | null;
  extendedProps?: Record<string, unknown>;
};

function normalizeEvents(raw: unknown[]) {
  return raw
    .map((e, i) => {
      const o = e as Record<string, unknown>;
      const title = String(o.title ?? o.name ?? "Event");
      const start = o.start ?? o.startDate ?? o.date;
      const end = o.end ?? o.endDate;
      const cat = String(o.category ?? o.type ?? "general").toLowerCase();
      const cls = cat.includes("department")
        ? "category-department"
        : cat.includes("class")
          ? "category-class"
          : "category-general";
      return {
        id: String(o._id ?? o.id ?? i),
        title,
        start: start ? String(start) : undefined,
        end: end ? String(end) : undefined,
        classNames: [cls],
        extendedProps: o,
      };
    })
    .filter((x) => x.start);
}

export function EventsCalendar({
  events,
  onSelectEvent,
}: {
  events: unknown[];
  onSelectEvent: (ev: SelectedCalendarEvent) => void;
}) {
  const [initialView, setInitialView] = useState("listWeek");
  const fcEvents = useMemo(() => normalizeEvents(events), [events]);
  const { branding } = getConfig();

  const style = {
    "--brand-calendar-department-bg": branding.calendarCategoryColors.department.bg,
    "--brand-calendar-department-hover":
      branding.calendarCategoryColors.department.hover,
    "--brand-calendar-class-bg": branding.calendarCategoryColors.class.bg,
    "--brand-calendar-class-hover": branding.calendarCategoryColors.class.hover,
    "--brand-calendar-general-bg": branding.calendarCategoryColors.general.bg,
    "--brand-calendar-general-hover":
      branding.calendarCategoryColors.general.hover,
  } as CSSProperties;

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setInitialView(mq.matches ? "dayGridMonth" : "listWeek");
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <div
      className="fc-calendar-root w-full overflow-hidden rounded-lg border bg-card p-1 sm:p-2"
      style={style}
    >
      <FullCalendar
        key={initialView}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
        initialView={initialView}
        headerToolbar={{
          left: "prev,next",
          center: "title",
          right: "listWeek,dayGridMonth,timeGridWeek",
        }}
        height="auto"
        events={fcEvents}
        eventClick={(info) => {
          info.jsEvent.preventDefault();
          onSelectEvent({
            title: info.event.title,
            start: info.event.start,
            end: info.event.end,
            extendedProps: info.event.extendedProps as Record<string, unknown>,
          });
        }}
      />
    </div>
  );
}
