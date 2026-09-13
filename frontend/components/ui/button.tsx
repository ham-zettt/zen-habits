import type { ComponentPropsWithRef } from "react";

import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "tertiary" | "inverse" | "danger";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-focus",
  secondary:
    "border border-hairline bg-surface-1 text-ink hover:border-hairline-strong hover:bg-surface-2",
  tertiary: "bg-transparent text-ink hover:bg-surface-1",
  inverse: "bg-inverse-canvas text-inverse-ink hover:bg-inverse-surface-2",
  danger:
    "border border-hairline bg-surface-1 text-ink hover:border-[#e5484d] hover:text-[#ff6369]",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-caption",
  md: "h-9 px-3.5 text-button",
};

export type ButtonProps = ComponentPropsWithRef<"button"> & {
  variant?: Variant;
  size?: Size;
};

export function buttonClasses(
  variant: Variant = "primary",
  size: Size = "md",
  className?: string,
) {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition-colors",
    "disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, size, className)}
      {...props}
    />
  );
}
