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

export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
