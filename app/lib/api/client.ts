import type { AppData } from "../types";

async function parseJson<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

export async function fetchNextMemberId(): Promise<string> {
  const response = await fetch("/api/members/next-id", { cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to get member ID");
  return data.memberId;
}

export async function fetchAppData(): Promise<AppData> {
  const response = await fetch("/api/data", { cache: "no-store" });
  return parseJson<AppData>(response);
}

export async function saveRecordApi(payload: Record<string, any>) {
  const response = await fetch("/api/records", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseJson<{ ok: boolean; id?: string }>(response);
}

export async function deleteRecordApi(collection: string, id: string) {
  const response = await fetch(`/api/records/${collection}/${id}`, { method: "DELETE" });
  return parseJson<{ ok: boolean }>(response);
}

export async function seedSampleDataApi() {
  const response = await fetch("/api/seed", { method: "POST" });
  return parseJson<{ ok: boolean; seeded?: boolean }>(response);
}

export async function loginApi(username: string, password: string) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.message || data.error || "Login failed");
  return data;
}

export async function logoutApi() {
  const response = await fetch("/api/auth/logout", { method: "POST" });
  return parseJson<{ ok: boolean }>(response);
}
