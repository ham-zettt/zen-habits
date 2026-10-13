"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { FieldBuilder } from "@/components/modules/field-builder";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import type {
  FieldType,
  Module,
  ModuleField,
  ModuleFieldDraft,
} from "@/lib/types";

const FIELD_TYPES: { type: FieldType; label: string }[] = [
  { type: "text", label: "Text" },
  { type: "dropdown", label: "Dropdown" },
  { type: "subtask", label: "Subtask" },
  { type: "date", label: "Date" },
  { type: "link", label: "Link" },
];

export type ModuleFormValues = {
  title: string;
  description: string;
  fields: ModuleFieldDraft[];
};

function toDraft(field: ModuleField): ModuleFieldDraft {
  return {
    id: field.id,
    localKey: field.id,
    label: field.label,
    type: field.type,
    options: field.options ?? [],
  };
}

export function ModuleForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: Module;
  submitLabel: string;
  onSubmit: (values: ModuleFormValues) => Promise<void>;
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "New Module");
  const [description, setDescription] = useState(
    initial?.description ?? "Describe your module",
  );
  const [fields, setFields] = useState<ModuleFieldDraft[]>(
    (initial?.fields ?? []).map(toDraft),
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(index: number, patch: Partial<ModuleFieldDraft>) {
    setFields((prev) =>
      prev.map((field, i) => (i === index ? { ...field, ...patch } : field)),
    );
  }

  function addField(type: FieldType) {
    setFields((prev) => [
      ...prev,
      {
        localKey: crypto.randomUUID(),
        label: "",
        type,
        options: type === "dropdown" ? [""] : [],
      },
    ]);
    setMenuOpen(false);
  }

  function removeField(index: number) {
    setFields((prev) => prev.filter((_, i) => i !== index));
  }

  function validate(): string | null {
    if (!title.trim()) return "Module title is required.";
    for (let index = 0; index < fields.length; index++) {
      const field = fields[index];
      if (!field.label.trim()) return `Field ${index + 1} needs a label.`;
      if (
        field.type === "dropdown" &&
        field.options.map((option) => option.trim()).filter(Boolean).length === 0
      ) {
        return `Dropdown "${field.label || index + 1}" needs at least one option.`;
      }
    }
    return null;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        fields: fields.map((field) => ({
          id: field.id,
          localKey: field.localKey,
          label: field.label.trim(),
          type: field.type,
          options:
            field.type === "dropdown"
              ? field.options.map((option) => option.trim()).filter(Boolean)
              : [],
        })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save module");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <Field label="Module title" htmlFor="module-title">
        <Input
          id="module-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={255}
          required
        />
      </Field>

      <Field label="Description" htmlFor="module-description">
        <Textarea
          id="module-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={2000}
        />
      </Field>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-body font-medium text-ink">Structure</h2>
          <div className="relative">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <Plus className="size-4" />
              New field
            </Button>
            {menuOpen ? (
              <div className="absolute right-0 z-10 mt-2 w-40 overflow-hidden rounded-md border border-hairline bg-surface-2 py-1">
                {FIELD_TYPES.map((option) => (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => addField(option.type)}
                    className="block w-full px-3 py-2 text-left text-body-sm text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {fields.length === 0 ? (
          <p className="rounded-lg border border-dashed border-hairline px-4 py-6 text-center text-body-sm text-ink-subtle">
            No fields yet. Add one to define what each item can hold.
          </p>
        ) : (
          <div className={cn("flex flex-col gap-3")}>
            {fields.map((field, index) => (
              <FieldBuilder
                key={field.localKey}
                field={field}
                index={index}
                onChange={(patch) => updateField(index, patch)}
                onRemove={() => removeField(index)}
              />
            ))}
          </div>
        )}
      </div>

      {error ? (
        <p role="alert" className="text-body-sm text-[#ff6369]">
          {error}
        </p>
      ) : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="tertiary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
