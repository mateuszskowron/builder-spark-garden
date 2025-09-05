import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchEvents } from "@/controllers/calendarController";
import type { CalendarEvent } from "@/models/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function CalendarPage() {
  const { t } = useTranslation();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [month, setMonth] = useState<Date>(new Date());

  useEffect(() => {
    fetchEvents().then(setEvents);
  }, []);

  const daysWithEvents = useMemo(() =>
    new Set(events.map((e) => new Date(e.start).toDateString())), [events]);

  const modifiers = {
    hasEvent: (day: Date) => daysWithEvents.has(day.toDateString()),
  };

  const styles = {
    day: { borderRadius: 8 },
    head_cell: { fontWeight: 600 },
  } as const;

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-2xl">{t("calendar.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <DayPicker
            mode="single"
            month={month}
            onMonthChange={setMonth}
            modifiers={modifiers}
            modifiersStyles={{ hasEvent: { backgroundColor: "hsl(var(--accent))" } }}
            styles={styles}
            captionLayout="dropdown"
            fromYear={2020}
            toYear={2030}
            showOutsideDays
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("calendar.upcoming")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3" aria-label={t("calendar.upcoming") || undefined}>
            {events
              .slice()
              .sort((a, b) => +new Date(a.start) - +new Date(b.start))
              .map((e) => (
                <li key={e.id} className="rounded-md border p-3">
                  <div className="font-medium">{e.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(e.start).toLocaleString()} — {new Date(e.end).toLocaleTimeString()}
                  </div>
                </li>
              ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
