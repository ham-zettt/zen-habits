"use client";

import { useRouter } from "next/navigation";

import { ModuleForm, type ModuleFormValues } from "@/components/modules/module-form";
import { PageHeader } from "@/components/page-header";
import { useModules } from "@/context/modules";
import { apiFetch } from "@/lib/api";
import type { Module } from "@/lib/types";

export default function NewModulePage() {
  const router = useRouter();
  const { reload } = useModules();

  async function create(values: ModuleFormValues) {
    const created = await apiFetch<Module>("/api/modules", {
      method: "POST",
      json: values,
    });
    await reload();
    router.push(`/app/modules/${created.id}`);
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="New Module"
        title="Create a module"
        description="Give it a title and description, then define the fields each item will hold."
      />
      <ModuleForm
        submitLabel="Save module"
        onSubmit={create}
        onCancel={() => router.push("/app")}
      />
    </div>
  );
}
