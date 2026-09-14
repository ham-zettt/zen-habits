import { Check } from "lucide-react";

import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";

const DELAYS = [
	"[animation-delay:0ms]",
	"[animation-delay:150ms]",
	"[animation-delay:300ms]",
];

function PreviewCard({
	label,
	title,
	chip,
	children,
}: {
	label: string;
	title: string;
	chip?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<div className="rounded-xl border border-hairline bg-surface-1 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
			<div className="flex items-center justify-between gap-4 border-b border-hairline pb-3">
				<div>
					<p className="text-caption text-ink-tertiary">{label}</p>
					<p className="text-body-sm font-medium text-ink">{title}</p>
				</div>
				{chip}
			</div>
			<div className="mt-1">{children}</div>
		</div>
	);
}

const TODO_ROWS = [
	{ title: "Finish quarterly report", priority: "Urgent", done: false },
	{ title: "Morning standup", priority: "Normal", done: true },
];

const PRIORITY_TONE: Record<string, string> = {
	Urgent: "text-[#ff6369]",
	Normal: "text-ink-subtle",
	Low: "text-ink-tertiary",
};

function TodoPreview() {
	return (
		<PreviewCard
			label="Todo List"
			title="Today"
			chip={
				<span className="rounded-md bg-primary px-2.5 py-1 text-caption font-medium text-on-primary">
					New task
				</span>
			}
		>
			<ul className="divide-y divide-hairline">
				{TODO_ROWS.map((row) => (
					<li
						key={row.title}
						className="flex items-center gap-3 py-2.5"
					>
						<span
							className={cn(
								"flex size-4 items-center justify-center rounded-sm border",
								row.done
									? "border-primary bg-primary text-on-primary"
									: "border-hairline-strong bg-surface-2 text-transparent",
							)}
						>
							<Check className="size-3" strokeWidth={3} />
						</span>
						<span
							className={cn(
								"flex-1 truncate text-caption",
								row.done
									? "text-ink-tertiary line-through"
									: "text-ink",
							)}
						>
							{row.title}
						</span>
						<span
							className={cn(
								"text-caption",
								PRIORITY_TONE[row.priority] ??
									"text-ink-subtle",
							)}
						>
							{row.priority}
						</span>
					</li>
				))}
			</ul>
		</PreviewCard>
	);
}

const JOB_ROWS = [
	{ position: "Backend Engineer", company: "Acme", status: "Applied" },
	{
		position: "Platform Engineer",
		company: "Northwind",
		status: "In Process",
	},
	{ position: "Go Developer", company: "Globex", status: "Planning" },
];

const JOB_STATUS_TONE: Record<string, string> = {
	Applied: "text-primary-hover",
	"In Process": "text-[#ffb224]",
	Planning: "text-ink-subtle",
	Rejected: "text-[#ff6369]",
};

function JobsPreview() {
	return (
		<PreviewCard label="Job Tracker" title="Applications">
			<ul className="divide-y divide-hairline">
				{JOB_ROWS.map((row) => (
					<li
						key={row.position}
						className="flex items-center gap-3 py-2.5"
					>
						<span className="flex-1 truncate">
							<span className="text-caption text-ink">
								{row.position}
							</span>
							<span className="text-caption text-ink-tertiary">
								{" · "}
								{row.company}
							</span>
						</span>
						<span
							className={cn(
								"flex items-center gap-1.5 text-caption",
								JOB_STATUS_TONE[row.status] ??
									"text-ink-subtle",
							)}
						>
							<span
								aria-hidden
								className="size-1.5 rounded-full bg-current"
							/>
							{row.status}
						</span>
					</li>
				))}
			</ul>
		</PreviewCard>
	);
}

const EXPENSE_ROWS = [
	{ label: "Salary", cents: 1200000000, income: true },
	{ label: "Transport", cents: 4500000, income: false },
];

function ExpensesPreview() {
	return (
		<PreviewCard
			label="Expenses"
			title="September"
			chip={
				<span className="text-caption font-medium text-success">
					+ {formatMoney(1110500000)}
				</span>
			}
		>
			<ul className="divide-y divide-hairline">
				{EXPENSE_ROWS.map((row) => (
					<li
						key={row.label}
						className="flex items-center gap-3 py-2.5"
					>
						<span className="flex-1 truncate text-caption text-ink">
							{row.label}
						</span>
						<span
							className={cn(
								"text-caption",
								row.income ? "text-success" : "text-ink-muted",
							)}
						>
							{row.income ? "+" : "−"} {formatMoney(row.cents)}
						</span>
					</li>
				))}
			</ul>
		</PreviewCard>
	);
}

const PREVIEWS = [TodoPreview, JobsPreview, ExpensesPreview];

export function AppPreview() {
	return (
		<div aria-hidden className="flex flex-col gap-4">
			{PREVIEWS.map((Preview, index) => (
				<div
					key={index}
					className={cn(
						"animate-pop-in motion-reduce:animate-none",
						DELAYS[index],
					)}
				>
					<Preview />
				</div>
			))}
		</div>
	);
}
