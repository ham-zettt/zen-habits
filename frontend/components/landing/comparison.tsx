import {
	ArrowRight,
	CalendarDays,
	Check,
	ListTodo,
	NotebookPen,
	Wallet,
	X,
	Gauge,
} from "lucide-react";

import { Reveal } from "@/components/landing/reveal";
import {
	COLLAPSE_ICONS,
	COMPARISON_LOSER,
	COMPARISON_LOSER_TITLE,
	COMPARISON_WINNER,
	COMPARISON_WINNER_TITLE,
} from "@/lib/landing-data";

const ICONS = [ListTodo, NotebookPen, CalendarDays, Gauge, Wallet];

export function Comparison() {
	return (
		<section
			id="why"
			aria-labelledby="why-heading"
			className="scroll-mt-20"
		>
			<div className="mx-auto w-full max-w-[1160px] px-4 py-16 sm:px-6 sm:py-24">
				<Reveal className="mx-auto max-w-2xl text-center">
					<p className="text-[13px] font-medium tracking-wide text-lp uppercase">
						Why ZenHabits
					</p>
					<h2
						id="why-heading"
						className="mt-3 text-3xl font-bold tracking-tight text-lp-text sm:text-5xl"
					>
						Tired of juggling{" "}
						<span className="text-lp">six apps</span> for one life?
					</h2>
					<p className="mt-4 text-lg text-lp-muted">
						One app for todos, one for study, one for job hunting,
						one for shopping lists. Your data ends up scattered
						everywhere.
					</p>
				</Reveal>

				<div className="mt-10 grid gap-5 md:grid-cols-2">
					<Reveal>
						<div className="h-full rounded-xl border border-lp-border bg-lp-surface p-6 sm:p-8">
							<h3 className="text-xl font-semibold text-lp-muted">
								{COMPARISON_LOSER_TITLE}
							</h3>
							<ul className="mt-6 space-y-4">
								{COMPARISON_LOSER.map((point) => (
									<li
										key={point}
										className="flex items-start gap-3 text-[15px] text-lp-muted"
									>
										<span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-lp-surface2">
											<X
												className="size-3.5 text-lp-danger"
												strokeWidth={3}
												aria-hidden
											/>
										</span>
										{point}
									</li>
								))}
							</ul>
						</div>
					</Reveal>
					<Reveal>
						<div className="relative h-full rounded-xl border border-lp/50 bg-lp-surface p-6 sm:p-8">
							<span className="absolute -top-3.5 left-6 rounded-xl bg-lp px-3 py-1 text-xs font-bold tracking-wide text-lp-ink uppercase">
								Winner
							</span>
							<h3 className="text-xl font-semibold text-lp-text">
								{COMPARISON_WINNER_TITLE}
							</h3>
							<ul className="mt-6 space-y-4">
								{COMPARISON_WINNER.map((point) => (
									<li
										key={point}
										className="flex items-start gap-3 text-[15px] font-medium text-lp-text"
									>
										<span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-xl bg-lp">
											<Check
												className="size-3.5 text-lp-ink"
												strokeWidth={3}
												aria-hidden
											/>
										</span>
										{point}
									</li>
								))}
							</ul>
						</div>
					</Reveal>
				</div>
			</div>
		</section>
	);
}
