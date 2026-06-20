"use client";

import { useActionState } from "react";
import { Dumbbell } from "lucide-react";
import { loginAction } from "../actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="brand-mark">
          <Dumbbell size={30} />
        </div>
        <h1>Gym Management</h1>
        <p>Sign in to manage members, payments, plans and operations.</p>
        <form action={action} className="login-form">
          <label>
            Username
            <input name="username" defaultValue="admin" autoComplete="username" required />
          </label>
          <label>
            Password
            <input name="password" type="password" defaultValue="admin" autoComplete="current-password" required />
          </label>
          {state?.message ? <div className="form-error">{state.message}</div> : null}
          <button className="primary-btn" disabled={pending}>{pending ? "Signing in..." : "Login"}</button>
        </form>
        <span className="hint">Default login: admin / admin</span>
      </section>
    </main>
  );
}
