"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

import { useAuth } from "@/context/auth";
import { buttonClasses } from "@/components/ui/button";
import { NAV_LINKS } from "@/lib/landing-data";
import { cn } from "@/lib/cn";

export function Navbar() {
	const { user, loading } = useAuth();
	const [open, setOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 8);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	const loggedIn = !loading && !!user;

	return (
		<header
			className={cn(
				"sticky top-0 z-40 border-b transition-colors",
				scrolled
					? "border-lp-border bg-lp-bg/85 backdrop-blur-md"
					: "border-transparent bg-lp-bg",
			)}
			style={{ borderColor: scrolled ? undefined : "transparent" }}
		>
			<nav
				aria-label="Main navigation"
				className="mx-auto flex h-16 w-full max-w-[1160px] items-center justify-between px-4 sm:px-6"
			>
				<Link
					href="/"
					aria-label="ZenHabits home"
					className="inline-flex items-center gap-2"
				>
					<Image
						src="/logo.png"
						alt="ZenHabits logo"
						width={28}
						height={31}
						className="h-7 w-auto"
					/>
					<span className="text-base font-semibold tracking-tight text-lp-text">
						ZenHabits
					</span>
				</Link>

				<div className="hidden items-center gap-7 md:flex">
					{NAV_LINKS.map((l) => (
						<a
							key={l.href}
							href={l.href}
							className="text-sm text-lp-muted transition-colors hover:text-lp-text focus-visible:outline-2 focus-visible:outline-lp"
						>
							{l.label}
						</a>
					))}
				</div>

				<div className="hidden items-center gap-2 md:flex">
					{loggedIn ? (
						<Link
							href="/app"
							className={buttonClasses("primary", "sm")}
						>
							Go to App
						</Link>
					) : (
						<>
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
								Get Started
							</Link>
						</>
					)}
				</div>

				<button
					type="button"
					className="inline-flex size-10 items-center justify-center rounded-xl border border-lp-border text-lp-text md:hidden"
					aria-expanded={open}
					aria-label={open ? "Close menu" : "Open menu"}
					onClick={() => setOpen((v) => !v)}
				>
					{open ? (
						<X className="size-5" />
					) : (
						<Menu className="size-5" />
					)}
				</button>
			</nav>

			{open && (
				<div className="border-t border-lp-border bg-lp-bg px-4 pt-2 pb-5 md:hidden">
					<div className="flex flex-col gap-1">
						{NAV_LINKS.map((l) => (
							<a
								key={l.href}
								href={l.href}
								onClick={() => setOpen(false)}
								className="rounded-lg px-3 py-2.5 text-sm text-lp-muted hover:bg-lp-surface hover:text-lp-text"
							>
								{l.label}
							</a>
						))}
					</div>
					<div className="mt-3 flex gap-2">
						{loggedIn ? (
							<Link
								href="/app"
								className={buttonClasses(
									"primary",
									"sm",
									"flex-1",
								)}
							>
								Go to App
							</Link>
						) : (
							<>
								<Link
									href="/login"
									className={buttonClasses(
										"secondary",
										"sm",
										"flex-1",
									)}
								>
									Login
								</Link>
								<Link
									href="/register"
									className={buttonClasses(
										"primary",
										"sm",
										"flex-1",
									)}
								>
									Get Started
								</Link>
							</>
						)}
					</div>
				</div>
			)}
		</header>
	);
}
