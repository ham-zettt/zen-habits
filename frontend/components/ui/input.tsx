import type { ComponentPropsWithRef } from "react";

import { cn } from "@/lib/cn";

const FIELD_BASE =
  "w-full rounded-md border border-hairline bg-surface-1 px-3 text-body text-ink placeholder:text-ink-tertiary transition-colors focus:border-hairline-strong focus:outline-none disabled:opacity-50";

export function Input({
  className,
  ...props
}: ComponentPropsWithRef<"input">) {
  return <input className={cn(FIELD_BASE, "h-10", className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: ComponentPropsWithRef<"textarea">) {
  return (
    <textarea
      className={cn(FIELD_BASE, "min-h-20 py-2 leading-relaxed", className)}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: ComponentPropsWithRef<"select">) {
  return (
    <select
      className={cn(FIELD_BASE, "h-10 appearance-none pr-8", className)}
      {...props}
    >
      {children}
    </select>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label
        htmlFor={htmlFor}
        className="text-body-sm font-medium text-ink-muted"
      >
        {label}
      </label>
      {children}
      {hint ? <p className="text-caption text-ink-subtle">{hint}</p> : null}
    </div>
  );
}
