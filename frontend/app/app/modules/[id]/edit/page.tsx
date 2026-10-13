"use client";

import { useParams, useRouter } from "next/navigation";

import { ModuleForm, type ModuleFormValues } from "@/components/modules/module-form";
import { PageHeader } from "@/components/page-header";
import { ErrorState, PageLoader } from "@/components/ui/states";
import { useModules } from "@/context/modules";
import { apiFetch } from "@/lib/api";
import type { Module } from "@/lib/types";
import { useApi } from "@/lib/use-api";

export default function EditModulePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { reload } = useModules();
  const { data: module, loading, error, reload: reloadModule } = useApi<Module>(
    `/api/modules/${id}`,
  );

  async function update(values: ModuleFormValues) {
    await apiFetch(`/api/modules/${id}`, { method: "PUT", json: values });
    await reload();
    router.push(`/app/modules/${id}`);
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Edit Module"
        title={module?.title ?? "Edit module"}
        description="Rename fields, add new fields, edit dropdown options, or remove fields. Field types cannot be changed."
      />
      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={reloadModule} />
      ) : module ? (
        <ModuleForm
          initial={module}
          submitLabel="Save changes"
          onSubmit={update}
          onCancel={() => router.push(`/app/modules/${id}`)}
        />
      ) : null}
    </div>
  );
}
