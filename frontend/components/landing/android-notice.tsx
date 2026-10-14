import { BellOff, Smartphone } from "lucide-react";

import { Reveal } from "@/components/landing/reveal";
import { Card } from "@/components/ui/card";

export function AndroidNotice() {
	return (
		<section aria-labelledby="android-heading">
			<div className="mx-auto w-full max-w-[1160px] px-4 pb-16 sm:px-6 sm:pb-20">
				<Reveal>
					<Card className="flex flex-col items-start gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
						<span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-lp/10 text-lp">
							<Smartphone className="size-7" aria-hidden />
						</span>
						<div className="min-w-0 flex-1">
							<h2
								id="android-heading"
								className="text-xl font-bold text-lp-text"
							>
								Android app coming soon
							</h2>
							<p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-lp-muted">
								ZenHabits is web-first for now and works in any
								mobile browser. A native Android app is planned
								next. Your data will be waiting when it arrives.
							</p>
							<div className="mt-4 flex flex-wrap items-center gap-3">
								<span
									aria-disabled="true"
									className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-lp-border bg-lp-surface2 px-4 py-2.5 opacity-60"
								>
									<BellOff
										className="size-4 text-lp-muted"
										aria-hidden
									/>
									<span className="text-left leading-tight">
										<span className="block text-[10px] tracking-wide text-lp-muted uppercase">
											Google Play
										</span>
										<span className="block text-sm font-semibold text-lp-text">
											Coming soon
										</span>
									</span>
								</span>
							</div>
						</div>
					</Card>
				</Reveal>
			</div>
		</section>
	);
}
