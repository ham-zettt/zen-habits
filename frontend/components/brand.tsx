import { cn } from "@/lib/cn";

export function Brand({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span aria-hidden className="size-4 rounded-sm bg-primary" />
      <span className="text-body font-semibold tracking-tight text-ink">
        ZenHabits
      </span>
    </span>
  );
}
