import { z } from "zod";

const baseUrlSchema = z.string().url();

export const API_BASE_URL = (() => {
  const raw = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;

  if (!raw) {
    throw new Error("VITE_API_BASE_URL is not set. Please configure it in your env.");
  }

  const parsed = baseUrlSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("VITE_API_BASE_URL is invalid. It must be a valid URL.");
  }

  return parsed.data;
})();

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Request failed with status ${response.status}`);
  }
  if (response.status === 204) {
    // No content
    return undefined as unknown as T;
  }
  return (await response.json()) as T;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return handleResponse<T>(response);
}

export async function apiGet<T>(
  path: string,
): Promise<T> {
  return apiRequest<T>(path, { method: "GET" });
}

export async function apiPut<TReq, TRes = void>(
  path: string,
  body: TReq,
): Promise<TRes> {
  return apiRequest<TRes>(path, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function apiPost<TReq, TRes = void>(
  path: string,
  body: TReq,
): Promise<TRes> {
  return apiRequest<TRes>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
