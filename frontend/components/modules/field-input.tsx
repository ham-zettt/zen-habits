"use client";

import { Field, Input, Select } from "@/components/ui/input";
import { SubtaskInput } from "@/components/modules/subtask-input";
import { coerceSubtasks } from "@/lib/module-values";
import type { ModuleField } from "@/lib/types";

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** One generic input that switches on the field type. */
export function FieldInput({
  field,
  value,
  onChange,
}: {
  field: ModuleField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const id = `field-${field.id}`;

  switch (field.type) {
    case "text":
      return (
        <Field label={field.label} htmlFor={id}>
          <Input
            id={id}
            value={asString(value)}
            onChange={(event) => onChange(event.target.value)}
            maxLength={1000}
          />
        </Field>
      );

    case "date":
      return (
        <Field label={field.label} htmlFor={id}>
          <Input
            id={id}
            type="date"
            value={asString(value)}
            onChange={(event) => onChange(event.target.value)}
          />
        </Field>
      );

    case "link":
      return (
        <Field label={field.label} htmlFor={id}>
          <Input
            id={id}
            type="url"
            value={asString(value)}
            onChange={(event) => onChange(event.target.value)}
            placeholder="https://…"
            maxLength={2048}
          />
        </Field>
      );

    case "dropdown":
      return (
        <Field label={field.label} htmlFor={id}>
          <Select
            id={id}
            value={asString(value)}
            onChange={(event) => onChange(event.target.value)}
          >
            <option value="">—</option>
            {(field.options ?? []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>
      );

    case "subtask":
      return (
        <div className="flex flex-col gap-2">
          <span className="text-body-sm font-medium text-ink-muted">
            {field.label}
          </span>
          <SubtaskInput
            value={coerceSubtasks(value)}
            onChange={(next) => onChange(next)}
          />
        </div>
      );

    default:
      return null;
  }
}
