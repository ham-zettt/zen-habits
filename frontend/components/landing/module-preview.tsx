"use client";

import { useMemo, useState } from "react";
import { Check, ExternalLink } from "lucide-react";

import { Reveal } from "@/components/landing/reveal";
import { DEMO_MODULES, STEPS, type DemoItem } from "@/lib/landing-data";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/cn";

function cloneItems(items: DemoItem[]): DemoItem[] {
	return items.map((item) => ({
		...item,
		subtasks: item.subtasks.map((s) => ({ ...s })),
	}));
}

function DemoCheckbox({
	checked,
	label,
	onToggle,
	size = "md",
}: {
	checked: boolean;
	label: string;
	onToggle: () => void;
	size?: "md" | "sm";
}) {
	return (
		<button
			type="button"
			role="checkbox"
			aria-checked={checked}
			aria-label={label}
			onClick={onToggle}
			className={cn(
				"flex shrink-0 items-center justify-center rounded-md border transition-all",
				size === "md" ? "mt-0.5 size-5" : "size-4",
				checked
					? "border-lp bg-lp text-lp-ink"
					: "border-lp-border bg-lp-surface2 text-transparent hover:border-lp/60",
			)}
		>
			<Check
				className={size === "md" ? "size-3.5" : "size-3"}
				strokeWidth={3}
				aria-hidden
			/>
		</button>
	);
}

export function ModulePreview() {
	const [activeId, setActiveId] = useState(DEMO_MODULES[0].id);
	const [itemsByModule, setItemsByModule] = useState<
		Record<string, DemoItem[]>
	>(() =>
		Object.fromEntries(
			DEMO_MODULES.map((m) => [m.id, cloneItems(m.items)]),
		),
	);

	const active =
		DEMO_MODULES.find((m) => m.id === activeId) ?? DEMO_MODULES[0];
	const items = useMemo(() => {
		const list = itemsByModule[active.id] ?? [];
		return [...list].sort((a, b) => Number(a.done) - Number(b.done));
	}, [itemsByModule, active.id]);

	const toggleItem = (itemId: string) =>
		setItemsByModule((prev) => ({
			...prev,
			[active.id]: (prev[active.id] ?? []).map((item) =>
				item.id === itemId ? { ...item, done: !item.done } : item,
			),
		}));

	const toggleSubtask = (itemId: string, subtaskId: string) =>
		setItemsByModule((prev) => ({
			...prev,
			[active.id]: (prev[active.id] ?? []).map((item) =>
				item.id === itemId
					? {
							...item,
							subtasks: item.subtasks.map((s) =>
								s.id === subtaskId
									? { ...s, done: !s.done }
									: s,
							),
						}
					: item,
			),
		}));

	const reset = () =>
		setItemsByModule((prev) => ({
			...prev,
			[active.id]: cloneItems(active.items),
		}));

	return (
		<section
			id="preview"
			aria-labelledby="preview-heading"
			className="scroll-mt-20"
		>
			<div className="mx-auto w-full max-w-[1160px] px-4 py-16 sm:px-6 sm:py-24">
				<Reveal className="mx-auto max-w-2xl text-center">
					<p className="text-[13px] font-medium tracking-wide text-lp uppercase">
						Interactive preview
					</p>
					<h2
						id="preview-heading"
						className="mt-3 text-3xl font-bold tracking-tight text-lp-text sm:text-5xl"
					>
						Build it <span className="text-lp">your way.</span>
					</h2>
					<p className="mt-4 text-lg text-lp-muted">
						Try it right here. Tick boxes, no login needed. Done
						items sink to the bottom, just like in the real app.
					</p>
				</Reveal>

				<Reveal>
					<ol className="mt-10 grid gap-4 sm:grid-cols-3">
						{STEPS.map((step) => (
							<li
								key={step.n}
								className="rounded-xl border border-lp-border bg-lp-surface p-5"
							>
								<span className="flex size-8 items-center justify-center rounded-full bg-lp text-sm font-bold text-lp-ink">
									{step.n}
								</span>
								<p className="mt-3 font-semibold text-lp-text">
									{step.title}
								</p>
								<p className="mt-1 text-sm text-lp-muted">
									{step.text}
								</p>
							</li>
						))}
					</ol>
				</Reveal>

				<Reveal>
					<div className="mt-8 overflow-hidden rounded-xl border border-lp-border bg-lp-surface">
						<div
							role="tablist"
							aria-label="Example modules"
							className="flex gap-2 overflow-x-auto border-b border-lp-border p-3"
						>
							{DEMO_MODULES.map((m) => (
								<button
									key={m.id}
									role="tab"
									aria-selected={m.id === activeId}
									onClick={() => setActiveId(m.id)}
									className={cn(
										buttonClasses(
											m.id === activeId
												? "primary"
												: "secondary",
											"sm",
										),
										"shrink-0 rounded-full px-4 py-2 text-sm font-medium",
										m.id === activeId ? "" : "",
									)}
								>
									{m.tab}
								</button>
							))}
						</div>

						<div className="p-4 sm:p-6">
							<div className="flex flex-wrap items-start justify-between gap-3">
								<div>
									<h3 className="text-lg font-semibold text-lp-text">
										{active.name}
									</h3>
									<p className="mt-0.5 text-sm text-lp-muted">
										{active.description}
									</p>
								</div>
								<button
									type="button"
									onClick={reset}
									className={buttonClasses(
										"secondary",
										"sm",
										"rounded-full px-3.5 py-1.5 text-xs",
									)}
								>
									Reset demo
								</button>
							</div>

							<ul className="mt-4 space-y-3">
								{items.map((item) => (
									<li
										key={item.id}
										className={cn(
											"rounded-2xl border p-4 transition-all duration-300",
											item.done
												? "border-lp-border bg-lp-bg opacity-70"
												: "border-lp-border bg-lp-bg",
										)}
									>
										<div className="flex items-start gap-3">
											<DemoCheckbox
												checked={item.done}
												label={`Mark "${item.title}" as ${item.done ? "not done" : "done"}`}
												onToggle={() =>
													toggleItem(item.id)
												}
											/>
											<div className="min-w-0 flex-1">
												<p
													className={cn(
														"text-[15px] font-semibold",
														item.done
															? "text-lp-muted line-through"
															: "text-lp-text",
													)}
												>
													{item.title}
												</p>
												<dl className="mt-2.5 space-y-1.5 text-[13px]">
													<div className="flex gap-2">
														<dt className="shrink-0 text-lp-muted">
															{item.textLabel}:
														</dt>
														<dd className="text-lp-text">
															{item.textValue}
														</dd>
													</div>
													<div className="flex gap-2">
														<dt className="shrink-0 text-lp-muted">
															{item.dropdownLabel}
															:
														</dt>
														<dd>
															<span className="rounded-full border border-lp/40 bg-lp/10 px-2 py-0.5 text-xs font-medium text-lp">
																{
																	item.dropdownValue
																}
															</span>
														</dd>
													</div>
													<div className="flex gap-2">
														<dt className="shrink-0 text-lp-muted">
															{item.dateLabel}:
														</dt>
														<dd className="text-lp-text">
															{item.dateValue}
														</dd>
													</div>
													<div>
														<dt className="text-lp-muted">
															{item.subtaskLabel}:
														</dt>
														<dd>
															<ul className="mt-1 space-y-1">
																{item.subtasks.map(
																	(s) => (
																		<li
																			key={
																				s.id
																			}
																			className="flex items-center gap-2"
																		>
																			<DemoCheckbox
																				size="sm"
																				checked={
																					s.done
																				}
																				label={`Mark subtask "${s.text}" as ${s.done ? "not done" : "done"}`}
																				onToggle={() =>
																					toggleSubtask(
																						item.id,
																						s.id,
																					)
																				}
																			/>
																			<span
																				className={cn(
																					s.done
																						? "text-lp-muted line-through"
																						: "text-lp-text",
																				)}
																			>
																				{
																					s.text
																				}
																			</span>
																		</li>
																	),
																)}
															</ul>
														</dd>
													</div>
													<div className="flex min-w-0 gap-2">
														<dt className="shrink-0 text-lp-muted">
															{item.linkLabel}:
														</dt>
														<dd className="min-w-0">
															<span className="inline-flex max-w-full items-center gap-1 text-lp">
																<span className="truncate">
																	{
																		item.linkValue
																	}
																</span>
																<ExternalLink
																	className="size-3 shrink-0"
																	aria-hidden
																/>
															</span>
														</dd>
													</div>
												</dl>
											</div>
										</div>
									</li>
								))}
							</ul>
						</div>
					</div>
				</Reveal>
			</div>
		</section>
	);
}
