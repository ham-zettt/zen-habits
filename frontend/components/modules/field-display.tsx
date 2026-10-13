import { Check, ExternalLink } from "lucide-react";

import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { coerceSubtasks } from "@/lib/module-values";
import type { ModuleField } from "@/lib/types";

/** One generic display that switches on the field type. Vacuity renders nothing. */
export function FieldDisplay({
  field,
  value,
}: {
  field: ModuleField;
  value: unknown;
}) {
  switch (field.type) {
    case "text":
    case "dropdown": {
      const text = typeof value === "string" ? value : "";
      if (!text) return null;
      return <Row label={field.label}>{text}</Row>;
    }

    case "date": {
      const text = typeof value === "string" ? value : "";
      if (!text) return null;
      return <Row label={field.label}>{formatDate(text)}</Row>;
    }

    case "link": {
      const text = typeof value === "string" ? value : "";
      if (!text) return null;
      return (
        <Row label={field.label}>
          <a
            href={text}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-w-0 items-center gap-1.5 text-ink-muted hover:text-primary-hover"
          >
            <span className="truncate">{text}</span>
            <ExternalLink className="size-3 shrink-0" />
          </a>
        </Row>
      );
    }

    case "subtask": {
      const subtasks = coerceSubtasks(value);
      if (subtasks.length === 0) return null;
      return (
        <div className="flex flex-col gap-1.5">
          <span className="text-caption text-ink-tertiary">{field.label}</span>
          <ul className="flex flex-col gap-1">
            {subtasks.map((subtask) => (
              <li key={subtask.id} className="flex items-center gap-2 text-body-sm">
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-sm border",
                    subtask.done
                      ? "border-primary bg-primary text-on-primary"
                      : "border-hairline-strong text-transparent",
                  )}
                >
                  <Check className="size-3" strokeWidth={3} />
                </span>
                <span
                  className={cn(
                    subtask.done
                      ? "text-ink-tertiary line-through"
                      : "text-ink-muted",
                  )}
                >
                  {subtask.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    default:
      return null;
  }
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 text-body-sm">
      <span className="text-caption text-ink-tertiary">{label}:</span>
      <span className="min-w-0 text-ink-muted">{children}</span>
    </div>
  );
}
