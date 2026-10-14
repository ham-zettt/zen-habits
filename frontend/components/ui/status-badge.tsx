import { cn } from "@/lib/cn";

const TONES = {
  neutral: "text-ink-muted",
  primary: "text-primary-hover",
  success: "text-success",
  danger: "text-danger",
  warning: "text-warning",
} as const;

export type BadgeTone = keyof typeof TONES;

export function StatusBadge({
  label,
  tone = "neutral",
  className,
}: {
  label: string;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface-2 px-2.5 py-1 text-caption",
        TONES[tone],
        className,
      )}
    >
      <span
        aria-hidden
        className="size-1.5 rounded-full bg-current"
      />
      {label}
    </span>
  );
}
