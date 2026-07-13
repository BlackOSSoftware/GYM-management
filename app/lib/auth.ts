import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { getDb, seedDefaultAdmin } from "./db";
import type { Role } from "./types";

const cookieName = "gym_session";

type Session = { id: string; name: string; email: string; role: Role };

export async function login(username: string, password: string) {
  await seedDefaultAdmin();
  const db = await getDb();
  const user = await db.collection("staff").findOne({ username, status: "Active" });
  if (!user || !(await bcrypt.compare(password, user.passwordHash || ""))) {
    return { ok: false, message: "Invalid username or password" };
  }

  const session: Session = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role
  };

  const store = await cookies();
  store.set(cookieName, Buffer.from(JSON.stringify(session)).toString("base64url"), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
    path: "/"
  });
  return { ok: true };
}

export async function logout() {
  const store = await cookies();
  store.delete(cookieName);
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const raw = store.get(cookieName)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export async function changePassword(oldPassword: string, newPassword: string) {
  const session = await getSession();
  if (!session) return { ok: false as const, message: "Unauthorized" };

  const oldPw = String(oldPassword || "");
  const newPw = String(newPassword || "");
  if (!oldPw || !newPw) return { ok: false as const, message: "Old and new password are required" };
  if (newPw.length < 4) return { ok: false as const, message: "New password must be at least 4 characters" };

  const { ObjectId } = await import("mongodb");
  const db = await getDb();
  const user = await db.collection("staff").findOne({ _id: new ObjectId(session.id) });
  if (!user) return { ok: false as const, message: "User not found" };

  const match = await bcrypt.compare(oldPw, user.passwordHash || "");
  if (!match) return { ok: false as const, message: "Current password is incorrect" };

  const passwordHash = await bcrypt.hash(newPw, 10);
  await db.collection("staff").updateOne({ _id: user._id }, { $set: { passwordHash, updatedAt: new Date().toISOString() } });
  return { ok: true as const };
}

export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
