"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Trash2,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ErrorState, Spinner } from "@/components/ui/states";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/cn";
import {
  WEEKDAYS,
  addMonths,
  dateKeyFromISO,
  formatDayLabel,
  isSameDay,
  isSameMonth,
  monthGrid,
  monthLabel,
  toDateKey,
  toMonthKey,
} from "@/lib/date";
import type { Reminder } from "@/lib/types";
import { useApi } from "@/lib/use-api";

function sortByTime(reminders: Reminder[]): Reminder[] {
  return [...reminders].sort((a, b) =>
    (a.eventTime || "99:99").localeCompare(b.eventTime || "99:99"),
  );
}

export default function CalendarPage() {
  const [month, setMonth] = useState(() => new Date());
  const monthKey = toMonthKey(month);

  const { data, loading, error, reload } = useApi<Reminder[]>(
    `/api/reminders?month=${monthKey}`,
  );
  const reminders = useMemo(() => data ?? [], [data]);

  const [activeDate, setActiveDate] = useState<Date | null>(null);
  const [editing, setEditing] = useState<Reminder | null>(null);

  const byDay = useMemo(() => {
    const map = new Map<string, Reminder[]>();
    for (const reminder of reminders) {
      const key = dateKeyFromISO(reminder.eventDate);
      const list = map.get(key) ?? [];
      list.push(reminder);
      map.set(key, list);
    }
    return map;
  }, [reminders]);

  const days = useMemo(() => monthGrid(month), [month]);
  const today = new Date();

  const activeReminders = useMemo(() => {
    if (!activeDate) return [];
    return sortByTime(byDay.get(toDateKey(activeDate)) ?? []);
  }, [activeDate, byDay]);

  function openDay(date: Date) {
    setEditing(null);
    setActiveDate(date);
  }

  function selectReminder(reminder: Reminder | null) {
    if (!reminder) {
      setEditing(null);
      return;
    }
    setEditing(reminder);
    setActiveDate(new Date(`${dateKeyFromISO(reminder.eventDate)}T00:00:00`));
  }

  function closeModal() {
    setActiveDate(null);
    setEditing(null);
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Calendar"
        title="Reminders"
        description="Click any date to add an event. Click an event in the list to edit or remove it."
      />

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMonth((prev) => addMonths(prev, -1))}
            aria-label="Previous month"
            className="flex size-9 items-center justify-center rounded-md border border-hairline text-ink-subtle transition-colors hover:bg-surface-1 hover:text-ink"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setMonth((prev) => addMonths(prev, 1))}
            aria-label="Next month"
            className="flex size-9 items-center justify-center rounded-md border border-hairline text-ink-subtle transition-colors hover:bg-surface-1 hover:text-ink"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <h2 className="text-headline text-ink">{monthLabel(month)}</h2>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setMonth(new Date())}
        >
          Today
        </Button>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-hairline">
          <div className="grid grid-cols-7 border-b border-hairline bg-surface-1">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="px-2 py-2 text-center text-caption text-ink-subtle"
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.charAt(0)}</span>
              </div>
            ))}
          </div>

          <div className="relative grid grid-cols-7">
            {loading ? (
              <div className="col-span-7 flex items-center justify-center py-16">
                <Spinner />
              </div>
            ) : (
              days.map((day) => {
                const key = toDateKey(day);
                const dayReminders = byDay.get(key) ?? [];
                const inMonth = isSameMonth(day, month);
                const isToday = isSameDay(day, today);

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => openDay(day)}
                    aria-label={`Open reminders for ${formatDayLabel(day)}, ${
                      dayReminders.length
                    } reminder${dayReminders.length === 1 ? "" : "s"}`}
                    className={cn(
                      "flex min-h-20 flex-col items-stretch gap-1 border-r border-b border-hairline p-1.5 text-left transition-colors last:border-r-0 hover:bg-surface-1 focus-visible:bg-surface-1 sm:min-h-28 sm:p-2",
                      !inMonth && "bg-canvas/40",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full text-caption",
                        isToday
                          ? "bg-primary text-on-primary"
                          : inMonth
                            ? "text-ink-muted"
                            : "text-ink-tertiary",
                      )}
                    >
                      {day.getDate()}
                    </span>

                    <span className="flex flex-col gap-1">
                      {dayReminders.slice(0, 2).map((reminder) => (
                        <span
                          key={reminder.id}
                          className="truncate rounded-sm border border-hairline bg-surface-2 px-1.5 py-0.5 text-caption text-ink-muted"
                        >
                          {reminder.eventTime
                            ? `${reminder.eventTime} `
                            : ""}
                          {reminder.title}
                        </span>
                      ))}
                      {dayReminders.length > 2 ? (
                        <span className="px-1.5 text-caption text-ink-tertiary">
                          +{dayReminders.length - 2} more
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {!loading && !error && reminders.length === 0 ? (
        <p className="flex items-center gap-2 text-body-sm text-ink-subtle">
          <CalendarDays className="size-4" />
          No reminders this month. Click a date to add one.
        </p>
      ) : null}

      <ReminderModal
        date={activeDate}
        reminders={activeReminders}
        editing={editing}
        onClose={closeModal}
        onSelect={selectReminder}
        onReload={reload}
      />
    </div>
  );
}

function ReminderModal({
  date,
  reminders,
  editing,
  onClose,
  onSelect,
  onReload,
}: {
  date: Date | null;
  reminders: Reminder[];
  editing: Reminder | null;
  onClose: () => void;
  onSelect: (reminder: Reminder | null) => void;
  onReload: () => Promise<void>;
}) {
  const open = date !== null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        date
          ? `${editing ? "Edit" : "New"} reminder at ${formatDayLabel(date)}`
          : ""
      }
    >
      {open && date ? (
        <ReminderPanel
          key={`${toDateKey(date)}:${editing?.id ?? "new"}`}
          date={date}
          reminders={reminders}
          editing={editing}
          onSelect={onSelect}
          onReload={onReload}
        />
      ) : null}
    </Modal>
  );
}

function ReminderPanel({
  date,
  reminders,
  editing,
  onSelect,
  onReload,
}: {
  date: Date;
  reminders: Reminder[];
  editing: Reminder | null;
  onSelect: (reminder: Reminder | null) => void;
  onReload: () => Promise<void>;
}) {
  const [title, setTitle] = useState(editing?.title ?? "");
  const [notes, setNotes] = useState(editing?.notes ?? "");
  const [eventTime, setEventTime] = useState(editing?.eventTime ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: title.trim(),
        notes: notes.trim(),
        eventTime,
        eventDate: toDateKey(date),
      };

      if (editing) {
        await apiFetch(`/api/reminders/${editing.id}`, {
          method: "PATCH",
          json: payload,
        });
        await onReload();
        onSelect(null);
      } else {
        await apiFetch("/api/reminders", { method: "POST", json: payload });
        setTitle("");
        setNotes("");
        setEventTime("");
        await onReload();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save reminder");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!editing) return;
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/api/reminders/${editing.id}`, { method: "DELETE" });
      await onReload();
      onSelect(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete reminder");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={save} className="flex flex-col gap-4">
        <Field label="Title" htmlFor="reminder-title">
          <Input
            id="reminder-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Dentist appointment"
            maxLength={255}
            required
          />
        </Field>

        <Field label="Notes" htmlFor="reminder-notes">
          <Textarea
            id="reminder-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Optional details"
            maxLength={2000}
          />
        </Field>

        <Field label="Time" htmlFor="reminder-time">
          <Input
            id="reminder-time"
            type="time"
            value={eventTime}
            onChange={(event) => setEventTime(event.target.value)}
            required
          />
        </Field>

        {error ? (
          <p role="alert" className="text-body-sm text-[#ff6369]">
            {error}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          {editing ? (
            <Button
              variant="danger"
              onClick={remove}
              disabled={saving}
              type="button"
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-3">
            {editing ? (
              <Button
                variant="tertiary"
                onClick={() => onSelect(null)}
                type="button"
              >
                Cancel
              </Button>
            ) : null}
            <Button type="submit" disabled={saving || !title.trim()}>
              {saving
                ? "Saving…"
                : editing
                  ? "Save changes"
                  : "Add reminder"}
            </Button>
          </div>
        </div>
      </form>

      <div className="border-t border-hairline pt-4">
        <p className="text-body-sm font-medium text-ink-muted">
          Reminders on this day
        </p>

        {reminders.length === 0 ? (
          <p className="mt-3 text-body-sm text-ink-subtle">
            Nothing scheduled yet.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {reminders.map((reminder) => (
              <li key={reminder.id}>
                <button
                  type="button"
                  onClick={() => onSelect(reminder)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left transition-colors",
                    editing?.id === reminder.id
                      ? "border-hairline-strong bg-surface-2"
                      : "border-hairline hover:border-hairline-strong hover:bg-surface-2",
                  )}
                >
                  <Clock className="size-3.5 shrink-0 text-ink-tertiary" />
                  <span className="w-10 shrink-0 text-caption text-ink-subtle">
                    {reminder.eventTime || "--:--"}
                  </span>
                  <span className="flex-1 truncate text-body-sm text-ink">
                    {reminder.title}
                  </span>
                  <span className="shrink-0 text-caption text-ink-tertiary">
                    Edit
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
