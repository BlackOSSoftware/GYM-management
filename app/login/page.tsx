"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell } from "lucide-react";
import { loginApi } from "../lib/api/client";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      await loginApi(String(form.get("username")), String(form.get("password")));
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="brand-mark">
          <Dumbbell size={30} />
        </div>
        <h1>Gym Management</h1>
        <p>Sign in to manage members, payments, plans and operations.</p>
        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Username
            <input name="username" defaultValue="admin" autoComplete="username" required />
          </label>
          <label>
            Password
            <input name="password" type="password" defaultValue="admin" autoComplete="current-password" required />
          </label>
          {error ? <div className="form-error">{error}</div> : null}
          <button className="primary-btn" disabled={pending}>{pending ? "Signing in..." : "Login"}</button>
        </form>
        <span className="hint">Default login: admin / admin</span>
      </section>
    </main>
  );
}
