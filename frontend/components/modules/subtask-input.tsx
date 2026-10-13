"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CheckboxToggle } from "@/components/ui/checkbox-toggle";
import { Input } from "@/components/ui/input";
import { newSubtask } from "@/lib/module-values";
import type { SubtaskValue } from "@/lib/types";

export function SubtaskInput({
  value,
  onChange,
}: {
  value: SubtaskValue[];
  onChange: (value: SubtaskValue[]) => void;
}) {
  function update(index: number, patch: Partial<SubtaskValue>) {
    onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      {value.map((subtask, index) => (
        <div key={subtask.id} className="flex items-center gap-2">
          <CheckboxToggle
            checked={subtask.done}
            onChange={() => update(index, { done: !subtask.done })}
            label={`Subtask ${index + 1} done`}
          />
          <Input
            value={subtask.text}
            onChange={(event) => update(index, { text: event.target.value })}
            placeholder="Subtask"
            aria-label={`Subtask ${index + 1}`}
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => remove(index)}
            aria-label={`Remove subtask ${index + 1}`}
            className="flex size-9 shrink-0 items-center justify-center rounded-md border border-hairline text-ink-tertiary transition-colors hover:text-[#ff6369]"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      <div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onChange([...value, newSubtask()])}
        >
          <Plus className="size-4" />
          Add subtask
        </Button>
      </div>
    </div>
  );
}
