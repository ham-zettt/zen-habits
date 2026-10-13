"use client";

import { Pencil, Trash2 } from "lucide-react";

import { FieldDisplay } from "@/components/modules/field-display";
import { CheckboxToggle } from "@/components/ui/checkbox-toggle";
import { cn } from "@/lib/cn";
import type { Module, ModuleItem } from "@/lib/types";

export function ItemCard({
  module,
  item,
  onToggle,
  onEdit,
  onDelete,
}: {
  module: Module;
  item: ModuleItem;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const fields = module.fields ?? [];

  return (
    <li className="rounded-lg border border-hairline bg-surface-1 p-4">
      <div className="flex items-start gap-3">
        <CheckboxToggle
          checked={item.isDone}
          onChange={onToggle}
          label={`Mark "${item.title}" as ${item.isDone ? "not done" : "done"}`}
        />

        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              "text-body font-medium text-ink",
              item.isDone && "text-ink-tertiary line-through",
            )}
          >
            {item.title}
          </h3>

          {fields.length > 0 ? (
            <div className="mt-2 flex flex-col gap-1.5">
              {fields.map((field) => (
                <FieldDisplay
                  key={field.id}
                  field={field}
                  value={item.values?.[field.id]}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit "${item.title}"`}
            className="flex size-8 items-center justify-center rounded-md text-ink-tertiary transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete "${item.title}"`}
            className="flex size-8 items-center justify-center rounded-md text-ink-tertiary transition-colors hover:bg-surface-2 hover:text-[#ff6369]"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
    </li>
  );
}
