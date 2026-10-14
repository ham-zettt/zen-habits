import Image from "next/image";
import Link from "next/link";

import { buttonClasses } from "@/components/ui/button";
import { NAV_LINKS } from "@/lib/landing-data";

export function Footer() {
	const year = new Date().getFullYear();
	return (
		<footer className="border-t border-lp-border">
			<div className="mx-auto w-full max-w-[1160px] px-4 py-10 sm:px-6">
				<div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
					<div>
						<p className="inline-flex items-center gap-2">
							<Image
								src="/logo.png"
								alt="ZenHabits logo"
								width={28}
								height={31}
								className="h-7 w-auto"
							/>
							<span className="text-base font-semibold text-lp-text">
								ZenHabits
							</span>
						</p>
						<p className="mt-2 max-w-xs text-sm text-lp-muted">
							One app for everything you do every day.
						</p>
					</div>
					<nav
						aria-label="Footer navigation"
						className="flex flex-wrap gap-x-8 gap-y-3"
					>
						{NAV_LINKS.map((l) => (
							<a
								key={l.href}
								href={l.href}
								className="text-sm text-lp-muted transition-colors hover:text-lp-text"
							>
								{l.label}
							</a>
						))}
					</nav>
					<div className="flex gap-2">
						<Link
							href="/login"
							className={buttonClasses("secondary", "sm")}
						>
							Login
						</Link>
						<Link
							href="/register"
							className={buttonClasses("primary", "sm")}
						>
							Register
						</Link>
					</div>
				</div>
				<p className="mt-8 border-t border-lp-border pt-6 text-xs text-lp-muted">
					© {year} ZenHabits. All rights reserved.
				</p>
			</div>
		</footer>
	);
}
