import type { ApiResult } from "@/types/app";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {})
    }
  });
  const payload = (await response.json().catch(() => ({}))) as ApiResult<T>;
  if (!response.ok) throw new Error(payload.error || response.statusText);
  return payload.data as T;
}
