"use client";

import { useState } from "react";
import { Briefcase, ExternalLink, Plus, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/ui/states";
import { StatusBadge, type BadgeTone } from "@/components/ui/status-badge";
import { apiFetch } from "@/lib/api";
import type { Job, JobStatus } from "@/lib/types";
import { useApi } from "@/lib/use-api";

const STATUSES: JobStatus[] = ["Planning", "Applied", "In Process", "Rejected"];

const STATUS_TONE: Record<JobStatus, BadgeTone> = {
  Planning: "neutral",
  Applied: "primary",
  "In Process": "warning",
  Rejected: "danger",
};

function formatDeadline(deadline: string | null) {
  if (!deadline) return "No deadline";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${deadline.slice(0, 10)}T00:00:00`));
}

export default function JobsPage() {
  const { data, loading, error, reload } = useApi<Job[]>("/api/jobs");
  const jobs = data ?? [];

  const [position, setPosition] = useState("");
  const [company, setCompany] = useState("");
  const [deadline, setDeadline] = useState("");
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<JobStatus>("Planning");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function createJob(event: React.FormEvent) {
    event.preventDefault();
    if (!position.trim() || !company.trim()) return;

    setSubmitting(true);
    setFormError(null);
    try {
      await apiFetch("/api/jobs", {
        method: "POST",
        json: {
          position: position.trim(),
          company: company.trim(),
          deadline,
          url: url.trim(),
          status,
        },
      });
      setPosition("");
      setCompany("");
      setDeadline("");
      setUrl("");
      setStatus("Planning");
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to add job");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(job: Job, next: JobStatus) {
    try {
      await apiFetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        json: { status: next },
      });
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to update job");
    }
  }

  async function deleteJob(job: Job) {
    try {
      await apiFetch(`/api/jobs/${job.id}`, { method: "DELETE" });
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to delete job");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Job Tracker"
        title="Applications"
        description="Save the listings you find and move each one along as it progresses."
      />

      <Card>
        <form onSubmit={createJob} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Position" htmlFor="position">
              <Input
                id="position"
                value={position}
                onChange={(event) => setPosition(event.target.value)}
                placeholder="e.g. Backend Engineer"
                maxLength={255}
                required
              />
            </Field>

            <Field label="Company" htmlFor="company">
              <Input
                id="company"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                placeholder="e.g. Acme"
                maxLength={255}
                required
              />
            </Field>

            <Field label="Deadline" htmlFor="deadline">
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
              />
            </Field>

            <Field label="Status" htmlFor="status">
              <Select
                id="status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as JobStatus)
                }
              >
                {STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Listing URL" htmlFor="url">
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://…"
            />
          </Field>

          {formError ? (
            <p role="alert" className="text-body-sm text-[#ff6369]">
              {formError}
            </p>
          ) : null}

          <div>
            <Button
              type="submit"
              disabled={submitting || !position.trim() || !company.trim()}
            >
              <Plus className="size-4" />
              {submitting ? "Adding…" : "Add job"}
            </Button>
          </div>
        </form>
      </Card>

      {loading ? (
        <ListSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="size-5" />}
          title="No job entries yet"
          description="Add a listing above to start tracking your applications."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {jobs.map((job) => (
            <li
              key={job.id}
              className="flex flex-col gap-3 rounded-lg border border-hairline bg-surface-1 p-4 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-body font-medium text-ink">
                    {job.position}
                  </h2>
                  <StatusBadge
                    label={job.status}
                    tone={STATUS_TONE[job.status]}
                  />
                </div>
                <p className="mt-1 text-body-sm text-ink-subtle">
                  {job.company} · {formatDeadline(job.deadline)}
                </p>
                {job.url ? (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1.5 text-body-sm text-ink-muted hover:text-primary-hover"
                  >
                    <ExternalLink className="size-3.5" />
                    View listing
                  </a>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                <label className="sr-only" htmlFor={`status-${job.id}`}>
                  Change status for {job.position}
                </label>
                <Select
                  id={`status-${job.id}`}
                  value={job.status}
                  onChange={(event) =>
                    updateStatus(job, event.target.value as JobStatus)
                  }
                  className="h-9 w-36"
                >
                  {STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </Select>
                <button
                  type="button"
                  onClick={() => deleteJob(job)}
                  aria-label={`Delete ${job.position} at ${job.company}`}
                  className="flex size-9 items-center justify-center rounded-md text-ink-tertiary transition-colors hover:bg-surface-2 hover:text-[#ff6369]"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
