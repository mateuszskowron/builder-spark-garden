import type { CalendarEvent } from "@/models/types";

const events: CalendarEvent[] = [
  {
    id: "E-001",
    title: "Spotkanie projektowe",
    start: "2024-10-14T10:00:00.000Z",
    end: "2024-10-14T11:00:00.000Z",
    status: "planned",
    location: "Teams",
  },
  {
    id: "E-002",
    title: "Deadline raportu",
    start: "2024-10-16T23:59:00.000Z",
    end: "2024-10-16T23:59:00.000Z",
    status: "planned",
  },
  {
    id: "E-003",
    title: "Serwis urządzenia",
    start: "2024-10-18T08:30:00.000Z",
    end: "2024-10-18T09:00:00.000Z",
    status: "done",
  },
];

export async function fetchEvents(): Promise<CalendarEvent[]> {
  return delay(events, 250);
}

function delay<T>(value: T, ms: number): Promise<T> {
  return new Promise((res) => setTimeout(() => res(value), ms));
}
