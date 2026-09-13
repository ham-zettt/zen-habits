import Link from "next/link";

import { Card } from "@/components/ui/card";
import { FEATURES } from "@/lib/features";

export default function OverviewPage() {
  return (
    <div>
      <header>
        <p className="text-eyebrow uppercase text-ink-subtle">Overview</p>
        <h1 className="mt-3 text-display-md text-ink">Your day, in one place</h1>
        <p className="mt-4 max-w-xl text-body-lg text-ink-subtle">
          Track tasks, study, reminders, job applications, work sessions, and
          money without switching between six different apps.
        </p>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link key={feature.href} href={feature.href} className="group">
              <Card className="h-full transition-colors group-hover:border-hairline-strong group-hover:bg-surface-2">
                <Icon className="size-5 text-ink-subtle" />
                <h2 className="mt-4 text-card-title text-ink">
                  {feature.title}
                </h2>
                <p className="mt-2 text-body-sm text-ink-subtle">
                  {feature.description}
                </p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
