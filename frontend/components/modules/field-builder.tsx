"use client";

import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ModuleFieldDraft } from "@/lib/types";

const TYPE_LABEL: Record<string, string> = {
  text: "Text",
  dropdown: "Dropdown",
  subtask: "Subtask",
  date: "Date",
  link: "Link",
};

/** One editable field row in the module structure builder. */
export function FieldBuilder({
  field,
  index,
  onChange,
  onRemove,
}: {
  field: ModuleFieldDraft;
  index: number;
  onChange: (patch: Partial<ModuleFieldDraft>) => void;
  onRemove: () => void;
}) {
  function updateOption(optionIndex: number, value: string) {
    onChange({
      options: field.options.map((option, i) => (i === optionIndex ? value : option)),
    });
  }

  function removeOption(optionIndex: number) {
    onChange({ options: field.options.filter((_, i) => i !== optionIndex) });
  }

  return (
    <div className="rounded-lg border border-hairline bg-surface-1 p-4">
      <div className="flex items-center gap-2">
        <Input
          value={field.label}
          onChange={(event) => onChange({ label: event.target.value })}
          placeholder="Field label"
          aria-label={`Field ${index + 1} label`}
          maxLength={255}
          className="flex-1"
        />
        <span className="shrink-0 rounded-md border border-hairline bg-surface-2 px-2.5 py-1 text-caption text-ink-subtle">
          {TYPE_LABEL[field.type] ?? field.type}
        </span>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove field ${index + 1}`}
          className="flex size-9 shrink-0 items-center justify-center rounded-md border border-hairline text-ink-tertiary transition-colors hover:text-[#ff6369]"
        >
          <X className="size-4" />
        </button>
      </div>

      {field.type === "dropdown" ? (
        <div className="mt-3 flex flex-col gap-2">
          <span className="text-caption text-ink-subtle">Options</span>
          {field.options.map((option, optionIndex) => (
            <div key={optionIndex} className="flex items-center gap-2">
              <Input
                value={option}
                onChange={(event) => updateOption(optionIndex, event.target.value)}
                placeholder={`Option ${optionIndex + 1}`}
                aria-label={`Option ${optionIndex + 1}`}
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => removeOption(optionIndex)}
                disabled={field.options.length === 1}
                aria-label={`Remove option ${optionIndex + 1}`}
                className="flex size-9 shrink-0 items-center justify-center rounded-md border border-hairline text-ink-tertiary transition-colors hover:text-[#ff6369] disabled:opacity-40"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
          <div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onChange({ options: [...field.options, ""] })}
            >
              <Plus className="size-4" />
              Add option
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
