"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { login, logout, requireSession } from "./lib/auth";
import { deleteRecordService, loadAppDataService, saveRecordService, seedSampleDataService } from "./lib/services/records";

function valueFrom(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function objectFromForm(formData: FormData) {
  const out: Record<string, any> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("$") || key === "_id" || key === "collection") continue;
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (!trimmed) continue;
    out[key] = trimmed;
  }
  return out;
}

export async function loginAction(_prev: any, formData: FormData) {
  const result = await login(valueFrom(formData, "username"), valueFrom(formData, "password"));
  if (result.ok) redirect("/");
  return result;
}

export async function logoutAction() {
  await logout();
  redirect("/login");
}

export async function saveRecord(formData: FormData) {
  const session = await requireSession();
  const collection = valueFrom(formData, "collection");
  const id = valueFrom(formData, "_id");
  await saveRecordService(collection, objectFromForm(formData), id, session.name);
  revalidatePath("/");
}

export async function deleteRecord(collection: string, id: string) {
  const session = await requireSession();
  await deleteRecordService(collection, id, session.name);
  revalidatePath("/");
}

export async function seedSampleData() {
  const session = await requireSession();
  await seedSampleDataService(session.name);
  revalidatePath("/");
}

export async function loadAppData(session: any) {
  return loadAppDataService(session);
}
