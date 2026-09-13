"use client";

import { useState } from "react";
import { Heart, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { CheckboxToggle } from "@/components/ui/checkbox-toggle";
import { Field, Input } from "@/components/ui/input";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/ui/states";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";
import type { WishlistItem } from "@/lib/types";
import { useApi } from "@/lib/use-api";

function toCents(value: string): number {
  return Math.round(Number.parseFloat(value) * 100);
}

export function WishlistPanel() {
  const { data, loading, error, reload, setData } = useApi<WishlistItem[]>(
    "/api/wishlist",
  );
  const items = data ?? [];

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function createItem(event: React.FormEvent) {
    event.preventDefault();
    const cents = toCents(amount);
    if (!name.trim() || !Number.isFinite(cents) || cents <= 0) {
      setFormError("Enter a name and a positive amount.");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      await apiFetch("/api/wishlist", {
        method: "POST",
        json: { name: name.trim(), plannedAmountCents: cents },
      });
      setName("");
      setAmount("");
      await reload();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to add wishlist item",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleBought(item: WishlistItem) {
    setData((prev) =>
      prev
        ? prev.map((entry) =>
            entry.id === item.id
              ? { ...entry, isBought: !entry.isBought }
              : entry,
          )
        : prev,
    );
    try {
      await apiFetch(`/api/wishlist/${item.id}`, {
        method: "PATCH",
        json: { isBought: !item.isBought },
      });
    } catch {
      // Reload to restore the true state on failure.
    }
    await reload();
  }

  async function deleteItem(item: WishlistItem) {
    try {
      await apiFetch(`/api/wishlist/${item.id}`, { method: "DELETE" });
      await reload();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to delete wishlist item",
      );
    }
  }

  return (
    <Card className="flex flex-col gap-5">
      <CardTitle>Wishlist</CardTitle>

      <form onSubmit={createItem} className="flex flex-col gap-3 sm:flex-row">
        <Field label="Item" htmlFor="wishlist-name" className="flex-1">
          <Input
            id="wishlist-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Mechanical keyboard"
            maxLength={255}
          />
        </Field>
        <Field label="Planned amount" htmlFor="wishlist-amount" className="sm:w-40">
          <Input
            id="wishlist-amount"
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0"
          />
        </Field>
        <div className="sm:pb-0.5">
          <Button type="submit" disabled={submitting}>
            <Plus className="size-4" />
            Add
          </Button>
        </div>
      </form>

      {formError ? (
        <p role="alert" className="text-body-sm text-[#ff6369]">
          {formError}
        </p>
      ) : null}

      {loading ? (
        <ListSkeleton rows={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Heart className="size-5" />}
          title="Nothing on the wishlist"
          description="Add something you plan to buy and the budget you have in mind."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-md border border-hairline bg-surface-2 px-3 py-2"
            >
              <CheckboxToggle
                checked={item.isBought}
                onChange={() => toggleBought(item)}
                label={`Mark ${item.name} as ${
                  item.isBought ? "not bought" : "bought"
                }`}
              />
              <span
                className={cn(
                  "flex-1 text-body-sm",
                  item.isBought
                    ? "text-ink-tertiary line-through"
                    : "text-ink",
                )}
              >
                {item.name}
              </span>
              <span className="text-body-sm text-ink-muted">
                {formatMoney(item.plannedAmountCents)}
              </span>
              <button
                type="button"
                onClick={() => deleteItem(item)}
                aria-label={`Delete ${item.name}`}
                className="flex size-7 items-center justify-center rounded text-ink-tertiary transition-colors hover:text-[#ff6369]"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
