import Link from "next/link";
import {
	ArrowRight,
	Briefcase,
	CalendarDays,
	GraduationCap,
	ListTodo,
	Timer,
	Wallet,
} from "lucide-react";

import { Reveal } from "@/components/landing/reveal";
import { Card } from "@/components/ui/card";
import { buttonClasses } from "@/components/ui/button";
import { BUILT_IN_TOOLS, DEFAULT_MODULES } from "@/lib/landing-data";

const MODULE_ICONS = [ListTodo, GraduationCap, Briefcase];
const TOOL_ICONS = [CalendarDays, Timer, Wallet];

export function DefaultModules() {
	return (
		<section
			id="modules"
			aria-labelledby="modules-heading"
			className="scroll-mt-20"
		>
			<div className="mx-auto w-full max-w-[1160px] px-4 py-16 sm:px-6 sm:py-24">
				<Reveal className="mx-auto max-w-2xl text-center">
					<p className="text-[13px] font-medium tracking-wide text-lp uppercase">
						Ready on day one
					</p>
					<h2
						id="modules-heading"
						className="mt-3 text-3xl font-bold tracking-tight text-lp-text sm:text-5xl"
					>
						Ready to use{" "}
						<span className="text-lp">from day one.</span>
					</h2>
					<p className="mt-4 text-lg text-lp-muted">
						Every new account starts with these modules. Edit them,
						delete them, or create your own.
					</p>
				</Reveal>

				<div className="mt-10 grid gap-5 md:grid-cols-3">
					{DEFAULT_MODULES.map((m, i) => {
						const Icon = MODULE_ICONS[i % MODULE_ICONS.length];
						return (
							<Reveal key={m.name}>
								<article className="flex h-full flex-col rounded-xl border border-lp-border bg-lp-surface p-6 transition-transform hover:-translate-y-1">
									<span className="flex size-11 items-center justify-center rounded-xl bg-lp/10 text-lp">
										<Icon className="size-5" aria-hidden />
									</span>
									<h3 className="mt-4 text-lg font-semibold text-lp-text">
										{m.name}
									</h3>
									<p className="mt-1 text-sm text-lp-muted">
										{m.description}
									</p>
									<div
										className="mt-4 flex flex-wrap gap-2"
										aria-label={`${m.name} fields`}
									>
										{m.fields.map((f) => (
											<span
												key={f}
												className="rounded-full border border-lp-border bg-lp-surface2 px-3 py-1 text-xs text-lp-text"
											>
												{f}
											</span>
										))}
									</div>
								</article>
							</Reveal>
						);
					})}
				</div>

				<div className="mt-5 grid gap-5 sm:grid-cols-3">
					{BUILT_IN_TOOLS.map((t, i) => {
						const Icon = TOOL_ICONS[i % TOOL_ICONS.length];
						return (
							<Reveal key={t.name}>
								<article className="flex h-full items-start gap-4 rounded-xl border border-lp-border bg-lp-surface p-5">
									<span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-lp-surface2 text-lp">
										<Icon className="size-5" aria-hidden />
									</span>
									<div>
										<h3 className="font-semibold text-lp-text">
											{t.name}
										</h3>
										<p className="mt-1 text-sm text-lp-muted">
											{t.description}
										</p>
									</div>
								</article>
							</Reveal>
						);
					})}
				</div>

				<Reveal>
					<Card className="mt-8 flex flex-col items-start justify-between gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
						<div>
							<h3 className="text-xl font-bold text-lp-text">
								Need something else? Create your own module.
							</h3>
							<p className="mt-1 text-sm text-lp-muted">
								Groceries, workouts, bills, trips. If you can
								list it, you can build it.
							</p>
						</div>
						<Link
							href="/register"
							className={buttonClasses(
								"primary",
								"md",
								"h-11 shrink-0 px-6",
							)}
						>
							Start building
							<ArrowRight className="size-4" aria-hidden />
						</Link>
					</Card>
				</Reveal>
			</div>
		</section>
	);
}
