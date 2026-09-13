import Link from "next/link";

import { Brand } from "@/components/brand";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-14 items-center px-6">
        <Link href="/" aria-label="ZenHabits home">
          <Brand />
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 pb-20">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
