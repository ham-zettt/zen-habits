"use client";

import Link from "next/link";
import { Layers, Plus } from "lucide-react";

import { Card } from "@/components/ui/card";
import { useModules } from "@/context/modules";
import { FIXED_FEATURES } from "@/lib/features";

export default function OverviewPage() {
  const { modules, loading } = useModules();

  return (
    <div className="flex flex-col gap-10">
      <header>
        <p className="text-eyebrow uppercase text-ink-subtle">Overview</p>
        <h1 className="mt-3 text-display-md text-ink">Your workspace</h1>
        <p className="mt-4 max-w-xl text-body-lg text-ink-subtle">
          Build your own modules with the fields you need, and keep the fixed
          tools within reach.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-headline text-ink">Your modules</h2>

        {loading ? (
          <p className="text-body-sm text-ink-subtle">Loading modules…</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <Link
                key={module.id}
                href={`/app/modules/${module.id}`}
                className="group"
              >
                <Card className="h-full transition-colors group-hover:border-hairline-strong group-hover:bg-surface-2">
                  <Layers className="size-5 text-ink-subtle" />
                  <h3 className="mt-4 text-card-title text-ink">
                    {module.title}
                  </h3>
                  <p className="mt-2 text-body-sm text-ink-subtle">
                    {module.description || "No description"}
                  </p>
                </Card>
              </Link>
            ))}

            <Link href="/app/modules/new" className="group">
              <Card className="flex h-full min-h-32 flex-col items-center justify-center border-dashed text-center transition-colors group-hover:border-hairline-strong group-hover:bg-surface-2">
                <Plus className="size-5 text-ink-subtle" />
                <span className="mt-3 text-body-sm text-ink-muted">
                  New module
                </span>
              </Card>
            </Link>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-headline text-ink">Tools</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FIXED_FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.title}
                href={feature.href ?? "#"}
                className="group"
              >
                <Card className="h-full transition-colors group-hover:border-hairline-strong group-hover:bg-surface-2">
                  <Icon className="size-5 text-ink-subtle" />
                  <h3 className="mt-4 text-card-title text-ink">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-body-sm text-ink-subtle">
                    {feature.description}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
