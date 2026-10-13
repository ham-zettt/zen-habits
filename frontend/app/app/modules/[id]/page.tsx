"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ListChecks, Plus, Settings, Trash2 } from "lucide-react";

import { ItemCard } from "@/components/modules/item-card";
import { ItemForm, type ItemFormValues } from "@/components/modules/item-form";
import { PageHeader } from "@/components/page-header";
import { Button, buttonClasses } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  EmptyState,
  ErrorState,
  ListSkeleton,
  PageLoader,
} from "@/components/ui/states";
import { useModules } from "@/context/modules";
import { apiFetch } from "@/lib/api";
import type { Module, ModuleItem } from "@/lib/types";
import { useApi } from "@/lib/use-api";

export default function ModulePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { reload: reloadModules } = useModules();

  const { data: module, loading, error } = useApi<Module>(`/api/modules/${id}`);
  const {
    data: itemsData,
    loading: itemsLoading,
    error: itemsError,
    reload: reloadItems,
    setData: setItems,
  } = useApi<ModuleItem[]>(`/api/modules/${id}/items`);
  const items = itemsData ?? [];

  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<ModuleItem | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function createItem(values: ItemFormValues) {
    await apiFetch(`/api/modules/${id}/items`, { method: "POST", json: values });
    setAddOpen(false);
    await reloadItems();
  }

  async function updateItem(values: ItemFormValues) {
    if (!editing) return;
    await apiFetch(`/api/modules/${id}/items/${editing.id}`, {
      method: "PUT",
      json: values,
    });
    setEditing(null);
    await reloadItems();
  }

  async function toggleItem(item: ModuleItem) {
    setItems((prev) =>
      prev
        ? prev.map((entry) =>
            entry.id === item.id ? { ...entry, isDone: !entry.isDone } : entry,
          )
        : prev,
    );
    try {
      await apiFetch(`/api/modules/${id}/items/${item.id}/done`, {
        method: "PATCH",
      });
    } catch {
      // Reload to restore the true state on failure.
    }
    await reloadItems();
  }

  async function deleteItem(item: ModuleItem) {
    try {
      await apiFetch(`/api/modules/${id}/items/${item.id}`, { method: "DELETE" });
      await reloadItems();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to delete item",
      );
    }
  }

  async function deleteModule() {
    setBusy(true);
    try {
      await apiFetch(`/api/modules/${id}`, { method: "DELETE" });
      await reloadModules();
      router.push("/app");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to delete module",
      );
      setBusy(false);
      setDeleteOpen(false);
    }
  }

  if (error) {
    return <ErrorState message={error} />;
  }
  if (loading || !module) {
    return <PageLoader />;
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Module"
        title={module.title}
        description={module.description || undefined}
        action={
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/app/modules/${id}/edit`}
              className={buttonClasses("secondary", "md")}
            >
              <Settings className="size-4" />
              Edit module
            </Link>
            <Button variant="danger" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="size-4" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="flex items-center justify-between gap-4">
        <p className="text-body-sm text-ink-subtle">
          {items.length} item{items.length === 1 ? "" : "s"}
        </p>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />
          Add item
        </Button>
      </div>

      {actionError ? (
        <p role="alert" className="text-body-sm text-[#ff6369]">
          {actionError}
        </p>
      ) : null}

      {itemsLoading ? (
        <ListSkeleton />
      ) : itemsError ? (
        <ErrorState message={itemsError} onRetry={reloadItems} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="size-5" />}
          title="No items yet"
          description="Add your first item to this module."
          action={
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="size-4" />
              Add item
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              module={module}
              item={item}
              onToggle={() => toggleItem(item)}
              onEdit={() => setEditing(item)}
              onDelete={() => deleteItem(item)}
            />
          ))}
        </ul>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add item">
        <ItemForm
          module={module}
          onSubmit={createItem}
          onCancel={() => setAddOpen(false)}
        />
      </Modal>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Edit item"
      >
        {editing ? (
          <ItemForm
            key={editing.id}
            module={module}
            item={editing}
            onSubmit={updateItem}
            onCancel={() => setEditing(null)}
          />
        ) : null}
      </Modal>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete module"
      >
        <p className="text-body-sm text-ink-subtle">
          This deletes the module and all of its items. This cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="tertiary" onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteModule} disabled={busy}>
            {busy ? "Deleting…" : "Delete module"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
