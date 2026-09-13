"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/cn";

export function CheckboxToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-sm border transition-colors",
        checked
          ? "border-primary bg-primary text-on-primary"
          : "border-hairline-strong bg-surface-2 text-transparent hover:border-primary",
      )}
    >
      <Check className="size-3.5" strokeWidth={3} />
    </button>
  );
}
