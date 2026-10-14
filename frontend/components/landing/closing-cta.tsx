import Link from "next/link";

import { Reveal } from "@/components/landing/reveal";
import { buttonClasses } from "@/components/ui/button";

export function ClosingCta() {
	return (
		<section aria-labelledby="closing-heading">
			<div className="mx-auto w-full max-w-[1160px] px-4 pb-16 sm:px-6 sm:pb-24">
				<Reveal>
					<div className="relative overflow-hidden rounded-[28px] border border-lp/40 bg-lp-surface px-6 py-14 text-center sm:px-12 sm:py-20">
						<h2
							id="closing-heading"
							className="relative text-3xl font-bold tracking-tight text-lp-text sm:text-5xl"
						>
							Stop juggling apps.{" "}
							<span className="text-lp">Start doing.</span>
						</h2>
						<p className="relative mx-auto mt-4 max-w-xl text-lg text-lp-muted">
							One account. Your modules. Everything you do every
							day, in one calm place.
						</p>
						<div className="relative mt-8 flex flex-col items-center gap-3">
							<Link
								href="/register"
								className={buttonClasses(
									"primary",
									"md",
									"h-13 px-9 py-3.5 text-base",
								)}
							>
								Get Started Free
							</Link>
							<p className="text-sm text-lp-muted">
								Already have an account?{" "}
								<Link
									href="/login"
									className="font-medium text-primary hover:underline"
								>
									Login
								</Link>
							</p>
						</div>
					</div>
				</Reveal>
			</div>
		</section>
	);
}
