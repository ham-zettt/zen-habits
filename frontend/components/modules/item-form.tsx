"use client";

import { useState } from "react";

import { FieldInput } from "@/components/modules/field-input";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import type { Module, ModuleItem } from "@/lib/types";

export type ItemFormValues = {
  title: string;
  values: Record<string, unknown>;
};

export function ItemForm({
  module,
  item,
  onSubmit,
  onCancel,
}: {
  module: Module;
  item?: ModuleItem | null;
  onSubmit: (values: ItemFormValues) => Promise<void>;
  onCancel?: () => void;
}) {
  const fields = module.fields ?? [];

  const [title, setTitle] = useState(item?.title ?? "");
  const [values, setValues] = useState<Record<string, unknown>>(
    item?.values ?? {},
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setValue(fieldId: string, value: unknown) {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setError("Item title is required.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSubmit({ title: title.trim(), values });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save item");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label="Title" htmlFor="item-title">
        <Input
          id="item-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Item title"
          maxLength={255}
          required
        />
      </Field>

      {fields.map((field) => (
        <FieldInput
          key={field.id}
          field={field}
          value={values[field.id]}
          onChange={(value) => setValue(field.id, value)}
        />
      ))}

      {error ? (
        <p role="alert" className="text-body-sm text-[#ff6369]">
          {error}
        </p>
      ) : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : item ? "Save changes" : "Add item"}
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
