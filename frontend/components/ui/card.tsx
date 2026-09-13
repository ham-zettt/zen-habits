import type { ComponentPropsWithRef } from "react";

import { cn } from "@/lib/cn";

export function Card({ className, ...props }: ComponentPropsWithRef<"div">) {
  return (
    <div
      className={cn(
        "rounded-lg border border-hairline bg-surface-1 p-6",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: ComponentPropsWithRef<"div">) {
  return (
    <div
      className={cn("flex items-start justify-between gap-4", className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: ComponentPropsWithRef<"h2">) {
  return (
    <h2 className={cn("text-card-title text-ink", className)} {...props} />
  );
}
