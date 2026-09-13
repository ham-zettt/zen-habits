"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Briefcase,
  CalendarDays,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  Timer,
  Wallet,
  X,
} from "lucide-react";

import { Brand } from "@/components/brand";
import { useAuth } from "@/context/auth";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/app", label: "Overview", icon: LayoutDashboard },
  { href: "/app/todos", label: "Todo List", icon: ListTodo },
  { href: "/app/study", label: "Study Plan", icon: BookOpen },
  { href: "/app/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/app/jobs", label: "Job Tracker", icon: Briefcase },
  { href: "/app/timer", label: "Work Timer", icon: Timer },
  { href: "/app/expenses", label: "Expenses", icon: Wallet },
];

function isActive(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1" aria-label="Main">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-body-sm transition-colors",
              active
                ? "bg-surface-2 text-ink"
                : "text-ink-subtle hover:bg-surface-1 hover:text-ink",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const account = (
    <div className="border-t border-hairline pt-4">
      <p className="truncate text-body-sm text-ink">{user?.name}</p>
      <p className="truncate text-caption text-ink-tertiary">{user?.email}</p>
      <button
        type="button"
        onClick={logout}
        className="mt-3 flex items-center gap-2 rounded-md px-3 py-2 text-body-sm text-ink-subtle transition-colors hover:bg-surface-1 hover:text-ink"
      >
        <LogOut className="size-4" />
        Sign out
      </button>
    </div>
  );

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-hairline p-4 lg:flex">
        <Link href="/" className="mb-6 px-3" aria-label="ZenHabits home">
          <Brand />
        </Link>
        <div className="flex-1">
          <NavLinks />
        </div>
        <div className="mt-6">{account}</div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-hairline bg-canvas px-4 lg:hidden">
        <Link href="/" aria-label="ZenHabits home">
          <Brand />
        </Link>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="flex size-9 items-center justify-center rounded-md text-ink-subtle hover:bg-surface-1 hover:text-ink"
        >
          <Menu className="size-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-overlay/70"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-hairline bg-canvas p-4">
            <div className="mb-6 flex items-center justify-between px-3">
              <Brand />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="flex size-8 items-center justify-center rounded-md text-ink-subtle hover:bg-surface-1 hover:text-ink"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="flex-1">
              <NavLinks onNavigate={() => setDrawerOpen(false)} />
            </div>
            <div className="mt-6">{account}</div>
          </div>
        </div>
      ) : null}

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
