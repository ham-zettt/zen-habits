import Link from "next/link";
import Image from "next/image";
import { Check } from "lucide-react";

import { Reveal } from "@/components/landing/reveal";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function HeroMockup() {
	return (
		<Card className="text-center rounded-xl p-5 sm:p-6">
			<div className="space-y-4">
				<div>
					<p className="text-[13px] font-bold tracking-wide text-lp-muted uppercase">
						Separated Apps
					</p>
					<p className="mt-1 text-sm text-lp-muted">
						Six apps spread one routine across separate places.
					</p>
					<div className="mt-4 grid grid-cols-6 gap-2">
						{[
							"Todo",
							"Tracker",
							"Mail",
							"Calendar",
							"Job",
							"Notes",
						].map((label) => (
							<div
								key={label}
								className="aspect-square rounded-lg border border-lp-border bg-lp-surface2 text-lp-muted"
							>
								<div className="flex h-full flex-col items-center justify-center gap-1 text-center">
									<div className="size-4 rounded bg-lp-muted/30" />
									<span className="text-[7px] sm:text-[10px] font-medium uppercase tracking-wide">
										{label}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="flex items-center gap-3">
					<div className="h-px flex-1 bg-hairline" />
					<div className="rounded-full border border-hairline bg-surface-2 px-2.5 py-1 text-caption text-ink-muted">
						vs
					</div>
					<div className="h-px flex-1 bg-primary/30" />
				</div>

				<div>
					<p className="text-[13px] font-bold tracking-wide text-lp uppercase">
						ZenHabits
					</p>
					<p className="mt-1 text-sm text-lp-muted">
						One app for everything you do every day.
					</p>
					<div className="mx-auto mt-4 flex size-20 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 p-4 sm:size-24">
						<div className="relative size-full">
							<Image
								src="/logo.png"
								alt="ZenHabits logo"
								fill
								sizes="(max-width: 640px) 48px, 64px"
								className="object-contain"
							/>
						</div>
					</div>
				</div>
			</div>
			<p className="mt-4 text-center text-xs text-lp-muted">
				Six separate apps become one calm system.
			</p>
		</Card>
	);
}

export function Hero() {
	return (
		<section
			aria-labelledby="hero-heading"
			className="relative overflow-hidden"
		>
			<div className="relative mx-auto grid w-full max-w-[1160px] items-center gap-12 px-4 pt-16 pb-16 sm:px-6 sm:pt-24 sm:pb-20 lg:grid-cols-2">
				<Reveal>
					<p className="text-[13px] font-medium tracking-wide text-lp uppercase">
						Custom modules for daily life
					</p>
					<h1
						id="hero-heading"
						className="mt-4 text-4xl leading-[1.08] font-semibold tracking-tight text-lp-text sm:text-6xl"
					>
						One app for everything you do every day.
					</h1>
					<p className="mt-6 max-w-lg text-lg leading-relaxed text-lp-muted">
						Build your own modules: todo lists, trackers, study
						plans, shopping lists, anything. Stop installing a new
						app for every part of your life.
					</p>
					<div className="mt-4 flex flex-wrap items-center gap-3">
						<Link
							href="/register"
							className={buttonClasses("primary", "md")}
						>
							Get Started Free
						</Link>
						<Link
							href="/login"
							className={buttonClasses("secondary", "md")}
						>
							Login
						</Link>
					</div>
				</Reveal>
				<Reveal>
					<HeroMockup />
				</Reveal>
			</div>
		</section>
	);
}
