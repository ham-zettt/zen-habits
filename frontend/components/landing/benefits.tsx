import { Bell, Blocks, Crosshair, Globe, LayoutGrid, TrendingUp } from "lucide-react";

import { Reveal } from "@/components/landing/reveal";
import { BENEFITS, USE_CASES } from "@/lib/landing-data";

const ICONS = [LayoutGrid, Blocks, Crosshair, Globe, Bell, TrendingUp];

export function Benefits() {
  return (
    <section id="benefits" aria-labelledby="benefits-heading" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-[1160px] px-4 py-16 sm:px-6 sm:py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-[13px] font-medium tracking-wide text-lp uppercase">
            Benefits
          </p>
          <h2 id="benefits-heading" className="mt-3 text-3xl font-bold tracking-tight text-lp-text sm:text-5xl">
            Less app-switching. <span className="text-lp">More getting things done.</span>
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <Reveal key={b.title}>
                <article className="h-full rounded-3xl border border-lp-border bg-lp-surface p-6 transition-all hover:-translate-y-1 hover:border-lp/40">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-lp/10 text-lp">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-semibold text-lp-text">{b.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-lp-muted">{b.text}</p>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal>
          <div className="relative mt-8 overflow-hidden" aria-label="Example use cases">
            <div className="flex w-max animate-[lp-marquee_28s_linear_infinite] gap-3 motion-reduce:animate-none">
              {[...USE_CASES, ...USE_CASES].map((u, i) => (
                <span
                  key={`${u}-${i}`}
                  aria-hidden={i >= USE_CASES.length}
                  className="shrink-0 rounded-full border border-lp-border bg-lp-surface px-4 py-2 text-sm text-lp-muted"
                >
                  {u}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
