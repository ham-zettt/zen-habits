import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Poppins } from "next/font/google";

import { AuthProvider } from "@/context/auth";

import "./globals.css";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-jetbrains-mono",
	subsets: ["latin"],
});

const poppins = Poppins({
	variable: "--font-poppins",
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	display: "swap",
});

export const metadata: Metadata = {
	title: {
		default: "ZenHabits",
		template: "%s · ZenHabits",
	},
	description:
		"Organize your tasks, study plans, reminders, job applications, work sessions, and finances in one place.",
	icons: {
		icon: "/logo.png",
		apple: "/logo.png",
	},
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html
			lang="en"
			className={`${inter.variable} ${jetbrainsMono.variable} ${poppins.variable} h-full antialiased`}
		>
			<body className="flex min-h-full flex-col bg-canvas text-ink">
				<AuthProvider>{children}</AuthProvider>
			</body>
		</html>
	);
}
