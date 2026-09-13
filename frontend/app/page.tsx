import Link from "next/link";
import { Smartphone } from "lucide-react";

import { AppPreview } from "@/components/landing/app-preview";
import { Brand } from "@/components/brand";
import { Card } from "@/components/ui/card";
import { buttonClasses } from "@/components/ui/button";
import { FEATURES } from "@/lib/features";

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-hairline bg-canvas/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="ZenHabits home">
            <Brand />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className={buttonClasses("secondary", "md")}
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className={buttonClasses("primary", "md")}
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto w-full max-w-6xl px-4 pt-16 pb-12 sm:px-6 sm:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-eyebrow uppercase text-ink-subtle">
                Personal habit management
              </p>
              <h1 className="mt-4 text-display-md text-ink sm:text-display-lg lg:text-display-xl">
                Everything you keep meaning to track.
              </h1>
              <p className="mt-6 max-w-lg text-body-lg text-ink-subtle">
                ZenHabits brings your tasks, study plans, calendar reminders,
                job applications, work sessions, and finances into one calm,
                focused workspace.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/register"
                  className={buttonClasses("primary", "md")}
                >
                  Create your account
                </Link>
                <Link
                  href="/login"
                  className={buttonClasses("tertiary", "md")}
                >
                  Sign in
                </Link>
              </div>
            </div>

            <AppPreview />
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="text-display-md text-ink">
            Six tools, one login
          </h2>
          <p className="mt-3 max-w-xl text-body-lg text-ink-subtle">
            Each feature is deliberately simple. No dashboards to configure, no
            settings to learn.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="h-full">
                  <Icon className="size-5 text-ink-subtle" />
                  <h3 className="mt-4 text-card-title text-ink">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-body-sm text-ink-subtle">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
          <Card className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-hairline bg-surface-2 text-ink-muted">
              <Smartphone className="size-5" />
            </div>
            <div>
              <h2 className="text-headline text-ink">
                Mobile app coming soon
              </h2>
              <p className="mt-2 max-w-2xl text-body-sm text-ink-subtle">
                ZenHabits is web-first for now. An Android app is planned for a
                later phase, so your data will be waiting when it arrives.
              </p>
            </div>
          </Card>
        </section>
      </main>

      <footer className="border-t border-hairline">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Brand />
          <p className="text-caption text-ink-tertiary">
            Built for one person who wants to stay on top of things.
          </p>
        </div>
      </footer>
    </div>
  );
}
