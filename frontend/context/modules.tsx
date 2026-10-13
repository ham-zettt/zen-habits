"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { apiFetch } from "@/lib/api";
import type { Module } from "@/lib/types";

type ModulesContextValue = {
  modules: Module[];
  loading: boolean;
  reload: () => Promise<void>;
};

const ModulesContext = createContext<ModulesContextValue | null>(null);

export function ModulesProvider({ children }: { children: React.ReactNode }) {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setModules(await apiFetch<Module[]>("/api/modules"));
    } catch {
      setModules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    apiFetch<Module[]>("/api/modules")
      .then((data) => {
        if (!cancelled) setModules(data);
      })
      .catch(() => {
        if (!cancelled) setModules([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({ modules, loading, reload }),
    [modules, loading, reload],
  );

  return (
    <ModulesContext.Provider value={value}>{children}</ModulesContext.Provider>
  );
}

export function useModules(): ModulesContextValue {
  const ctx = useContext(ModulesContext);
  if (!ctx) {
    throw new Error("useModules must be used within a ModulesProvider");
  }
  return ctx;
}
