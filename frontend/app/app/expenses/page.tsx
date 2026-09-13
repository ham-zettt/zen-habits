"use client";

import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Wallet,
} from "lucide-react";

import { WishlistPanel } from "@/components/finance/wishlist-panel";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/ui/states";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/cn";
import { addMonths, monthLabel, toDateKey, toMonthKey } from "@/lib/date";
import { formatDate, formatMoney } from "@/lib/format";
import type {
  Transaction,
  TransactionKind,
  TransactionSummary,
} from "@/lib/types";
import { useApi } from "@/lib/use-api";

function toCents(value: string): number {
  return Math.round(Number.parseFloat(value) * 100);
}

export default function ExpensesPage() {
  const [month, setMonth] = useState(() => new Date());
  const monthKey = toMonthKey(month);

  const summary = useApi<TransactionSummary>(
    `/api/transactions/summary?month=${monthKey}`,
  );
  const { data, loading, error, reload } = useApi<Transaction[]>(
    `/api/transactions?month=${monthKey}`,
  );
  const transactions = data ?? [];

  const [kind, setKind] = useState<TransactionKind>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [occurredOn, setOccurredOn] = useState(() => toDateKey(new Date()));
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function createTransaction(event: React.FormEvent) {
    event.preventDefault();
    const cents = toCents(amount);
    if (!Number.isFinite(cents) || cents <= 0) {
      setFormError("Enter a positive amount.");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      await apiFetch("/api/transactions", {
        method: "POST",
        json: {
          kind,
          amountCents: cents,
          category: category.trim(),
          occurredOn,
          note: note.trim(),
        },
      });
      setAmount("");
      setCategory("");
      setNote("");
      await Promise.all([reload(), summary.reload()]);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to add transaction",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteTransaction(transaction: Transaction) {
    try {
      await apiFetch(`/api/transactions/${transaction.id}`, {
        method: "DELETE",
      });
      await Promise.all([reload(), summary.reload()]);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to delete transaction",
      );
    }
  }

  const totals = summary.data;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Expenses"
        title="Monthly finances"
        description="Record income and spending, and keep a wishlist of planned purchases."
      />

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMonth((prev) => addMonths(prev, -1))}
            aria-label="Previous month"
            className="flex size-9 items-center justify-center rounded-md border border-hairline text-ink-subtle transition-colors hover:bg-surface-1 hover:text-ink"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setMonth((prev) => addMonths(prev, 1))}
            aria-label="Next month"
            className="flex size-9 items-center justify-center rounded-md border border-hairline text-ink-subtle transition-colors hover:bg-surface-1 hover:text-ink"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
        <h2 className="text-headline text-ink">{monthLabel(month)}</h2>
        <Button variant="secondary" size="sm" onClick={() => setMonth(new Date())}>
          This month
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Income"
          value={formatMoney(totals?.incomeCents ?? 0)}
          tone="income"
        />
        <SummaryCard
          label="Expenses"
          value={formatMoney(totals?.expenseCents ?? 0)}
          tone="expense"
        />
        <SummaryCard
          label="Balance"
          value={formatMoney(totals?.balanceCents ?? 0)}
          tone="neutral"
        />
      </div>

      <Card>
        <CardTitle className="mb-5">Add transaction</CardTitle>
        <form onSubmit={createTransaction} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Type" htmlFor="tx-kind">
              <Select
                id="tx-kind"
                value={kind}
                onChange={(event) =>
                  setKind(event.target.value as TransactionKind)
                }
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </Select>
            </Field>

            <Field label="Amount" htmlFor="tx-amount">
              <Input
                id="tx-amount"
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0"
                required
              />
            </Field>

            <Field label="Category" htmlFor="tx-category">
              <Input
                id="tx-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="e.g. Groceries"
                maxLength={100}
              />
            </Field>

            <Field label="Date" htmlFor="tx-date">
              <Input
                id="tx-date"
                type="date"
                value={occurredOn}
                onChange={(event) => setOccurredOn(event.target.value)}
                required
              />
            </Field>
          </div>

          <Field label="Note" htmlFor="tx-note">
            <Input
              id="tx-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional"
              maxLength={2000}
            />
          </Field>

          {formError ? (
            <p role="alert" className="text-body-sm text-[#ff6369]">
              {formError}
            </p>
          ) : null}

          <div>
            <Button type="submit" disabled={submitting}>
              <Plus className="size-4" />
              {submitting ? "Adding…" : "Add transaction"}
            </Button>
          </div>
        </form>
      </Card>

      <section className="flex flex-col gap-4">
        <h2 className="text-headline text-ink">Transactions</h2>

        {loading ? (
          <ListSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={<Wallet className="size-5" />}
            title="No transactions this month"
            description="Add income or an expense above and it will show up here."
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {transactions.map((transaction) => {
              const income = transaction.kind === "income";
              return (
                <li
                  key={transaction.id}
                  className="flex items-center gap-4 rounded-lg border border-hairline bg-surface-1 px-4 py-3"
                >
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-md border",
                      income
                        ? "border-success/30 text-success"
                        : "border-[#ff6369]/30 text-[#ff6369]",
                    )}
                  >
                    {income ? (
                      <ArrowDownLeft className="size-4" />
                    ) : (
                      <ArrowUpRight className="size-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body text-ink">
                      {transaction.category || (income ? "Income" : "Expense")}
                    </p>
                    <p className="mt-0.5 text-caption text-ink-subtle">
                      {formatDate(transaction.occurredOn)}
                      {transaction.note ? ` · ${transaction.note}` : ""}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-body font-medium",
                      income ? "text-success" : "text-ink",
                    )}
                  >
                    {income ? "+" : "−"}
                    {formatMoney(transaction.amountCents)}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteTransaction(transaction)}
                    aria-label="Delete transaction"
                    className="flex size-8 items-center justify-center rounded-md text-ink-tertiary transition-colors hover:bg-surface-2 hover:text-[#ff6369]"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <WishlistPanel />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "income" | "expense" | "neutral";
}) {
  return (
    <Card className="p-5">
      <p className="text-caption uppercase tracking-wide text-ink-subtle">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-headline",
          tone === "income"
            ? "text-success"
            : tone === "expense"
              ? "text-ink"
              : "text-ink",
        )}
      >
        {value}
      </p>
    </Card>
  );
}
