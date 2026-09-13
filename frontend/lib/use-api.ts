"use client";

import { useCallback, useEffect, useState } from "react";

import { apiFetch } from "./api";

function toMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong";
}

/** Loads a GET endpoint and exposes reload + local mutation helpers. */
export function useApi<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await apiFetch<T>(path));
    } catch (err) {
      setError(toMessage(err));
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await apiFetch<T>(path);
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(toMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [path]);

  return { data, loading, error, reload, setData };
}
