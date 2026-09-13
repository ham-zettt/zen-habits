"use client";

import { useState } from "react";
import { ListTodo, Plus, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckboxToggle } from "@/components/ui/checkbox-toggle";
import { Field, Input, Select } from "@/components/ui/input";
import {
  EmptyState,
  ErrorState,
  ListSkeleton,
} from "@/components/ui/states";
import { StatusBadge, type BadgeTone } from "@/components/ui/status-badge";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { Todo, TodoPriority } from "@/lib/types";
import { useApi } from "@/lib/use-api";

const PRIORITY_LABEL: Record<TodoPriority, string> = {
  urgent: "Urgent",
  normal: "Normal",
  low: "Low",
};

const PRIORITY_TONE: Record<TodoPriority, BadgeTone> = {
  urgent: "danger",
  normal: "neutral",
  low: "neutral",
};

export default function TodosPage() {
  const { data, loading, error, reload, setData } = useApi<Todo[]>("/api/todos");
  const todos = data ?? [];

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TodoPriority>("normal");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function createTodo(event: React.FormEvent) {
    event.preventDefault();
    const value = title.trim();
    if (!value) return;

    setSubmitting(true);
    setFormError(null);
    try {
      await apiFetch("/api/todos", {
        method: "POST",
        json: { title: value, priority },
      });
      setTitle("");
      setPriority("normal");
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to add task");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleTodo(todo: Todo) {
    setData((prev) =>
      prev
        ? prev.map((item) =>
            item.id === todo.id ? { ...item, isDone: !item.isDone } : item,
          )
        : prev,
    );
    try {
      await apiFetch(`/api/todos/${todo.id}/toggle`, { method: "PATCH" });
    } catch {
      // Reload to restore the true state on failure.
    }
    await reload();
  }

  async function deleteTodo(todo: Todo) {
    try {
      await apiFetch(`/api/todos/${todo.id}`, { method: "DELETE" });
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to delete task");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Todo List"
        title="Daily tasks"
        description="Urgent tasks rise to the top. Completed tasks always drop to the bottom, whatever their priority."
      />

      <Card>
        <form
          onSubmit={createTodo}
          className="flex flex-col gap-4 sm:flex-row sm:items-end"
        >
          <Field label="Task name" htmlFor="task" className="flex-1">
            <Input
              id="task"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What needs doing?"
              maxLength={255}
              required
            />
          </Field>

          <Field label="Priority" htmlFor="priority" className="sm:w-40">
            <Select
              id="priority"
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value as TodoPriority)
              }
            >
              <option value="urgent">Urgent</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </Select>
          </Field>

          <Button type="submit" disabled={submitting || !title.trim()}>
            <Plus className="size-4" />
            {submitting ? "Adding…" : "Add task"}
          </Button>
        </form>

        {formError ? (
          <p role="alert" className="mt-4 text-body-sm text-[#ff6369]">
            {formError}
          </p>
        ) : null}
      </Card>

      {loading ? (
        <ListSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : todos.length === 0 ? (
        <EmptyState
          icon={<ListTodo className="size-5" />}
          title="No tasks yet"
          description="Add your first task above and it will show up here."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-3 rounded-lg border border-hairline bg-surface-1 px-4 py-3"
            >
              <CheckboxToggle
                checked={todo.isDone}
                onChange={() => toggleTodo(todo)}
                label={`Mark "${todo.title}" as ${
                  todo.isDone ? "not done" : "done"
                }`}
              />
              <span
                className={cn(
                  "flex-1 text-body",
                  todo.isDone && "text-ink-tertiary line-through",
                )}
              >
                {todo.title}
              </span>
              <StatusBadge
                label={PRIORITY_LABEL[todo.priority]}
                tone={PRIORITY_TONE[todo.priority]}
              />
              <button
                type="button"
                onClick={() => deleteTodo(todo)}
                aria-label={`Delete "${todo.title}"`}
                className="flex size-8 items-center justify-center rounded-md text-ink-tertiary transition-colors hover:bg-surface-2 hover:text-[#ff6369]"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
