"use client";

import { useState } from "react";
import { BookOpen, ExternalLink, Link2, Plus, Trash2, X } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckboxToggle } from "@/components/ui/checkbox-toggle";
import { Field, Input } from "@/components/ui/input";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/ui/states";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { StudyPlan } from "@/lib/types";
import { useApi } from "@/lib/use-api";

type LinkDraft = { label: string; url: string };

const EMPTY_LINK: LinkDraft = { label: "", url: "" };

export default function StudyPage() {
  const { data, loading, error, reload, setData } =
    useApi<StudyPlan[]>("/api/study-plans");
  const plans = data ?? [];

  const [title, setTitle] = useState("");
  const [links, setLinks] = useState<LinkDraft[]>([{ ...EMPTY_LINK }]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function updateLink(index: number, field: keyof LinkDraft, value: string) {
    setLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, [field]: value } : link)),
    );
  }

  async function createPlan(event: React.FormEvent) {
    event.preventDefault();
    const value = title.trim();
    if (!value) return;

    const payloadLinks = links
      .filter((link) => link.url.trim())
      .map((link) => ({ label: link.label.trim(), url: link.url.trim() }));

    setSubmitting(true);
    setFormError(null);
    try {
      await apiFetch("/api/study-plans", {
        method: "POST",
        json: { title: value, links: payloadLinks },
      });
      setTitle("");
      setLinks([{ ...EMPTY_LINK }]);
      await reload();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to create study plan",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function togglePlan(plan: StudyPlan) {
    setData((prev) =>
      prev
        ? prev.map((item) =>
            item.id === plan.id ? { ...item, isDone: !item.isDone } : item,
          )
        : prev,
    );
    try {
      await apiFetch(`/api/study-plans/${plan.id}/toggle`, { method: "PATCH" });
    } catch {
      // Reload to restore the true state on failure.
    }
    await reload();
  }

  async function deletePlan(plan: StudyPlan) {
    try {
      await apiFetch(`/api/study-plans/${plan.id}`, { method: "DELETE" });
      await reload();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to delete study plan",
      );
    }
  }

  async function deleteLink(linkId: string) {
    try {
      await apiFetch(`/api/study-links/${linkId}`, { method: "DELETE" });
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to remove link");
    }
  }

  async function addLink(plan: StudyPlan, draft: LinkDraft) {
    if (!draft.url.trim()) return;
    try {
      await apiFetch(`/api/study-plans/${plan.id}/links`, {
        method: "POST",
        json: { label: draft.label.trim(), url: draft.url.trim() },
      });
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to add link");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Study Plan"
        title="What you are learning"
        description="Give each topic a name and attach the references you want to work through. Check it off when you are done."
      />

      <Card>
        <form onSubmit={createPlan} className="flex flex-col gap-4">
          <Field label="Study plan name" htmlFor="plan-title">
            <Input
              id="plan-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Go concurrency patterns"
              maxLength={255}
              required
            />
          </Field>

          <div className="flex flex-col gap-3">
            <p className="text-body-sm font-medium text-ink-muted">
              Reference links
            </p>
            {links.map((link, index) => (
              <div key={index} className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={link.label}
                  onChange={(event) =>
                    updateLink(index, "label", event.target.value)
                  }
                  placeholder="Label (optional)"
                  maxLength={255}
                  aria-label={`Link ${index + 1} label`}
                  className="sm:w-48"
                />
                <Input
                  type="url"
                  value={link.url}
                  onChange={(event) =>
                    updateLink(index, "url", event.target.value)
                  }
                  placeholder="https://…"
                  aria-label={`Link ${index + 1} URL`}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() =>
                    setLinks((prev) => prev.filter((_, i) => i !== index))
                  }
                  disabled={links.length === 1}
                  aria-label={`Remove link ${index + 1}`}
                  className="flex size-10 shrink-0 items-center justify-center rounded-md border border-hairline text-ink-tertiary transition-colors hover:text-[#ff6369] disabled:opacity-40"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
            <div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setLinks((prev) => [...prev, { ...EMPTY_LINK }])}
              >
                <Plus className="size-4" />
                Add another link
              </Button>
            </div>
          </div>

          {formError ? (
            <p role="alert" className="text-body-sm text-[#ff6369]">
              {formError}
            </p>
          ) : null}

          <div>
            <Button type="submit" disabled={submitting || !title.trim()}>
              {submitting ? "Saving…" : "Save study plan"}
            </Button>
          </div>
        </form>
      </Card>

      {loading ? (
        <ListSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : plans.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="size-5" />}
          title="No study plans yet"
          description="Add a topic and a few reference links to get started."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {plans.map((plan) => (
            <StudyPlanCard
              key={plan.id}
              plan={plan}
              onToggle={() => togglePlan(plan)}
              onDelete={() => deletePlan(plan)}
              onDeleteLink={deleteLink}
              onAddLink={(draft) => addLink(plan, draft)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function StudyPlanCard({
  plan,
  onToggle,
  onDelete,
  onDeleteLink,
  onAddLink,
}: {
  plan: StudyPlan;
  onToggle: () => void;
  onDelete: () => void;
  onDeleteLink: (id: string) => void;
  onAddLink: (draft: LinkDraft) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<LinkDraft>({ ...EMPTY_LINK });
  const links = plan.links ?? [];

  return (
    <li className="rounded-lg border border-hairline bg-surface-1 p-5">
      <div className="flex items-start gap-3">
        <CheckboxToggle
          checked={plan.isDone}
          onChange={onToggle}
          label={`Mark "${plan.title}" as ${plan.isDone ? "not done" : "done"}`}
        />
        <div className="flex-1">
          <h2
            className={cn(
              "text-body font-medium text-ink",
              plan.isDone && "text-ink-tertiary line-through",
            )}
          >
            {plan.title}
          </h2>

          {links.length > 0 ? (
            <ul className="mt-3 flex flex-col gap-2">
              {links.map((link) => (
                <li key={link.id} className="group flex items-center gap-2">
                  <Link2 className="size-3.5 shrink-0 text-ink-tertiary" />
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-w-0 items-center gap-1.5 text-body-sm text-ink-muted hover:text-primary-hover"
                  >
                    <span className="truncate">
                      {link.label || link.url}
                    </span>
                    <ExternalLink className="size-3 shrink-0" />
                  </a>
                  <button
                    type="button"
                    onClick={() => onDeleteLink(link.id)}
                    aria-label={`Remove link ${link.label || link.url}`}
                    className="flex size-6 items-center justify-center rounded text-ink-tertiary opacity-0 transition-opacity hover:text-[#ff6369] focus-visible:opacity-100 group-hover:opacity-100"
                  >
                    <X className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-body-sm text-ink-tertiary">
              No reference links yet.
            </p>
          )}

          {adding ? (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Input
                value={draft.label}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, label: event.target.value }))
                }
                placeholder="Label"
                aria-label="New link label"
                className="sm:w-40"
              />
              <Input
                type="url"
                value={draft.url}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, url: event.target.value }))
                }
                placeholder="https://…"
                aria-label="New link URL"
                className="flex-1"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    onAddLink(draft);
                    setDraft({ ...EMPTY_LINK });
                    setAdding(false);
                  }}
                  disabled={!draft.url.trim()}
                >
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="tertiary"
                  onClick={() => {
                    setAdding(false);
                    setDraft({ ...EMPTY_LINK });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="mt-3 inline-flex items-center gap-1.5 text-caption text-ink-subtle transition-colors hover:text-ink"
            >
              <Plus className="size-3.5" />
              Add link
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete "${plan.title}"`}
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-ink-tertiary transition-colors hover:bg-surface-2 hover:text-[#ff6369]"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </li>
  );
}
