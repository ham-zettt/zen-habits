import type { Metadata } from "next";

import { AndroidNotice } from "@/components/landing/android-notice";
import { Benefits } from "@/components/landing/benefits";
import { ClosingCta } from "@/components/landing/closing-cta";
import { Comparison } from "@/components/landing/comparison";
import { DefaultModules } from "@/components/landing/default-modules";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { ModulePreview } from "@/components/landing/module-preview";
import { Navbar } from "@/components/landing/navbar";

export const metadata: Metadata = {
	title: "ZenHabits — One app for everything you do every day",
	description:
		"Build your own modules for todos, study plans, job hunting, shopping lists, and more. One account, one place, free to use in your browser.",
	themeColor: "#19232b",
	openGraph: {
		title: "ZenHabits — One app for everything you do every day",
		description:
			"Build your own modules for todos, study plans, job hunting, shopping lists, and more.",
		type: "website",
	},
};

export default function LandingPage() {
	return (
		<div className="flex min-h-dvh flex-col bg-lp-bg font-inter text-lp-text">
			<a
				href="#main"
				className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-lp focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-lp-ink"
			>
				Skip to content
			</a>
			<Navbar />
			<main id="main" className="flex-1">
				<Hero />
				<Comparison />
				<ModulePreview />
				<DefaultModules />
				{/* <Benefits /> */}
				{/* <ClosingCta /> */}
				{/* <AndroidNotice /> */}
			</main>
			<Footer />
		</div>
	);
}
