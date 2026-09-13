import type { ApiEnvelope } from "./types";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Auth routes that must not trigger the refresh-and-retry cycle.
const SKIP_REFRESH = [
  "/api/auth/refresh",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
];

let refreshInFlight: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

type FetchOptions = RequestInit & { json?: unknown };

/**
 * Calls the API with cookies attached. On a 401 it attempts one silent
 * refresh and replays the request, so an expired access token is transparent
 * to the caller.
 */
export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { json, headers, ...rest } = options;

  const init: RequestInit = {
    ...rest,
    credentials: "include",
    headers: {
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(headers as Record<string, string> | undefined),
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  };

  let res = await fetch(path, init);

  if (res.status === 401 && !SKIP_REFRESH.some((p) => path.startsWith(p))) {
    const refreshed = await refreshSession();
    if (refreshed) {
      res = await fetch(path, init);
    }
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as ApiEnvelope<unknown>;
      if (body?.message) message = body.message;
    } catch {
      // Non-JSON error body; keep the default message.
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const body = (await res.json()) as ApiEnvelope<T>;
  return body.data;
}
