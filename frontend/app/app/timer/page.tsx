"use client";

import { useState } from "react";
import { Play, Square, Timer, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/ui/states";
import { apiFetch } from "@/lib/api";
import { formatDateTime, formatDuration, formatTime } from "@/lib/format";
import type { WorkSession } from "@/lib/types";
import { useApi } from "@/lib/use-api";

export default function TimerPage() {
  const { data, loading, error, reload } =
    useApi<WorkSession[]>("/api/work-sessions");
  const sessions = data ?? [];
  const running = sessions.find((session) => !session.endedAt) ?? null;

  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function start() {
    setBusy(true);
    setFormError(null);
    try {
      await apiFetch("/api/work-sessions/start", {
        method: "POST",
        json: { note: note.trim() },
      });
      setNote("");
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to start");
    } finally {
      setBusy(false);
    }
  }

  async function stop(session: WorkSession) {
    setBusy(true);
    setFormError(null);
    try {
      await apiFetch(`/api/work-sessions/${session.id}/stop`, {
        method: "PATCH",
      });
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to stop");
    } finally {
      setBusy(false);
    }
  }

  async function remove(session: WorkSession) {
    try {
      await apiFetch(`/api/work-sessions/${session.id}`, { method: "DELETE" });
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  const completed = sessions.filter((session) => session.endedAt);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Work Timer"
        title="Work sessions"
        description="Start when you begin, stop when you finish. The duration is calculated from the timestamps."
      />

      <Card>
        {running ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-body font-medium text-ink">
                <span
                  aria-hidden
                  className="size-2 animate-pulse rounded-full bg-success"
                />
                Running since {formatTime(running.startedAt)}
              </p>
              <p className="mt-1 text-body-sm text-ink-subtle">
                {running.note || "No note for this session."}
              </p>
            </div>
            <Button
              variant="danger"
              onClick={() => stop(running)}
              disabled={busy}
            >
              <Square className="size-4" />
              Stop session
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <Field
              label="What are you working on? (optional)"
              htmlFor="session-note"
              className="flex-1"
            >
              <Input
                id="session-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="e.g. Deep work on the API"
                maxLength={2000}
              />
            </Field>
            <Button onClick={start} disabled={busy}>
              <Play className="size-4" />
              Start now
            </Button>
          </div>
        )}

        {formError ? (
          <p role="alert" className="mt-4 text-body-sm text-[#ff6369]">
            {formError}
          </p>
        ) : null}
      </Card>

      <section className="flex flex-col gap-4">
        <h2 className="text-headline text-ink">History</h2>

        {loading ? (
          <ListSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : completed.length === 0 ? (
          <EmptyState
            icon={<Timer className="size-5" />}
            title="No finished sessions"
            description="Start a session and stop it when you are done to see it here."
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {completed.map((session) => (
              <li
                key={session.id}
                className="flex items-center gap-4 rounded-lg border border-hairline bg-surface-1 px-4 py-3"
              >
                <div className="flex-1">
                  <p className="text-body text-ink">
                    {formatDateTime(session.startedAt)}
                  </p>
                  <p className="mt-0.5 text-caption text-ink-subtle">
                    {formatTime(session.startedAt)} –{" "}
                    {session.endedAt ? formatTime(session.endedAt) : ""}
                    {session.note ? ` · ${session.note}` : ""}
                  </p>
                </div>
                <span className="text-body font-medium text-ink">
                  {formatDuration(session.durationSeconds)}
                </span>
                <button
                  type="button"
                  onClick={() => remove(session)}
                  aria-label="Delete session"
                  className="flex size-8 items-center justify-center rounded-md text-ink-tertiary transition-colors hover:bg-surface-2 hover:text-[#ff6369]"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
