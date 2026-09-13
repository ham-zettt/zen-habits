import { Check } from "lucide-react";

import { cn } from "@/lib/cn";

const ROWS = [
  { title: "Finish quarterly report", priority: "Urgent", done: false },
  { title: "Review pull requests", priority: "Normal", done: false },
  { title: "Read one chapter", priority: "Low", done: false },
  { title: "Morning standup", priority: "Normal", done: true },
];

const PRIORITY_TONE: Record<string, string> = {
  Urgent: "text-[#ff6369]",
  Normal: "text-ink-subtle",
  Low: "text-ink-tertiary",
};

export function AppPreview() {
  return (
    <div
      aria-hidden
      className="rounded-xl border border-hairline bg-surface-1 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] sm:p-6"
    >
      <div className="flex items-center justify-between border-b border-hairline pb-4">
        <div>
          <p className="text-caption text-ink-tertiary">Todo List</p>
          <p className="text-body font-medium text-ink">Today</p>
        </div>
        <span className="rounded-md bg-primary px-3 py-1.5 text-caption font-medium text-on-primary">
          New task
        </span>
      </div>

      <ul className="mt-1 divide-y divide-hairline">
        {ROWS.map((row) => (
          <li key={row.title} className="flex items-center gap-3 py-3">
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-sm border",
                row.done
                  ? "border-primary bg-primary text-on-primary"
                  : "border-hairline-strong bg-surface-2 text-transparent",
              )}
            >
              <Check className="size-3.5" strokeWidth={3} />
            </span>
            <span
              className={cn(
                "flex-1 truncate text-body-sm",
                row.done ? "text-ink-tertiary line-through" : "text-ink",
              )}
            >
              {row.title}
            </span>
            <span
              className={cn(
                "text-caption",
                PRIORITY_TONE[row.priority] ?? "text-ink-subtle",
              )}
            >
              {row.priority}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
