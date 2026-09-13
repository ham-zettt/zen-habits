import { Loader2 } from "lucide-react";

import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-surface-2", className)}
      aria-hidden
    />
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-14 w-full" />
      ))}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2
      className={cn("size-5 animate-spin text-ink-subtle", className)}
      aria-hidden
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner className="size-6" />
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center rounded-lg border border-dashed border-hairline px-6 py-14 text-center"
    >
      {icon ? (
        <div className="mb-4 flex size-11 items-center justify-center rounded-lg border border-hairline bg-surface-1 text-ink-subtle">
          {icon}
        </div>
      ) : null}
      <h3 className="text-body font-medium text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-body-sm text-ink-subtle">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-lg border border-hairline bg-surface-1 px-6 py-12 text-center"
    >
      <h3 className="text-body font-medium text-ink">
        Something went wrong
      </h3>
      <p className="mt-1 max-w-sm text-body-sm text-ink-subtle">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-md border border-hairline bg-surface-2 px-3.5 py-2 text-button text-ink transition-colors hover:border-hairline-strong"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}
