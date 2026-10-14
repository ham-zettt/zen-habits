import Image from "next/image";

import { cn } from "@/lib/cn";

export function Brand({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/logo.png"
        alt="ZenHabits logo"
        width={28}
        height={31}
        className="h-7 w-auto"
      />
      <span className="text-body font-semibold tracking-tight text-ink">
        ZenHabits
      </span>
    </span>
  );
}
