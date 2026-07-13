"use client";

import { useEffect, useState } from "react";
import { Check, KeyRound, Save } from "lucide-react";
import { changePasswordApi } from "../../lib/api/client";
import { useGymProfile } from "../../hooks/useGymName";

export default function SettingsView() {
  const { profile, saveProfile } = useGymProfile();
  const [draft, setDraft] = useState(profile);
  const [saved, setSaved] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwMsg, setPwMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [pwBusy, setPwBusy] = useState(false);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  const handleSaveProfile = () => {
    saveProfile(draft);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  };

  const handlePassword = async () => {
    setPwMsg(null);
    if (!oldPassword || !newPassword) {
      setPwMsg({ type: "err", text: "Enter old and new password" });
      return;
    }
    setPwBusy(true);
    try {
      await changePasswordApi(oldPassword, newPassword);
      setOldPassword("");
      setNewPassword("");
      setPwMsg({ type: "ok", text: "Password updated successfully" });
    } catch (e) {
      setPwMsg({ type: "err", text: e instanceof Error ? e.message : "Failed to change password" });
    } finally {
      setPwBusy(false);
    }
  };

  const field =
    "h-10 w-full rounded-xl border border-line/70 bg-panel px-3 text-sm text-ink outline-none focus:border-indigo-400";
  const labelCls = "mb-1 block text-[11px] font-medium text-muted";

  return (
    <div className="content flex w-full min-w-0 flex-col gap-2.5 pb-6 min-[768px]:gap-3">
      <div>
        <h2 className="m-0 text-xl font-semibold tracking-tight text-ink min-[768px]:text-2xl">Settings</h2>
        <p className="mt-1 mb-0 text-xs text-muted">Gym profile and password</p>
      </div>

      <div className="grid grid-cols-1 gap-2.5 min-[900px]:grid-cols-2 min-[900px]:gap-3">
        <article className="rounded-2xl border border-line/60 bg-panel p-3 shadow-[0_4px_14px_rgba(15,23,42,0.04)] min-[360px]:p-3.5">
          <h3 className="mb-2.5 mt-0 text-sm font-semibold text-ink">Gym Profile</h3>
          <div className="grid gap-2.5">
            <label>
              <span className={labelCls}>Gym Name</span>
              <input
                className={field}
                value={draft.gymName}
                onChange={(e) => { setDraft((d) => ({ ...d, gymName: e.target.value })); setSaved(false); }}
                placeholder="Your gym name"
                maxLength={60}
              />
            </label>
            <label>
              <span className={labelCls}>Phone Number</span>
              <input
                className={field}
                type="tel"
                value={draft.phone}
                onChange={(e) => { setDraft((d) => ({ ...d, phone: e.target.value })); setSaved(false); }}
                placeholder="e.g. 9876543210"
                maxLength={20}
              />
            </label>
            <label>
              <span className={labelCls}>Email</span>
              <input
                className={field}
                type="email"
                value={draft.email}
                onChange={(e) => { setDraft((d) => ({ ...d, email: e.target.value })); setSaved(false); }}
                placeholder="gym@example.com"
                maxLength={80}
              />
            </label>
            <p className="m-0 text-[11px] text-muted">Name, phone & email show on invoices when you print.</p>
            <button type="button" className="primary-btn h-10 w-full justify-center min-[400px]:w-auto" onClick={handleSaveProfile}>
              {saved ? <><Check size={16} /> Saved</> : <><Save size={16} /> Save Profile</>}
            </button>
          </div>
        </article>

        <article className="rounded-2xl border border-line/60 bg-panel p-3 shadow-[0_4px_14px_rgba(15,23,42,0.04)] min-[360px]:p-3.5">
          <h3 className="mb-2.5 mt-0 flex items-center gap-2 text-sm font-semibold text-ink">
            <KeyRound size={16} className="text-indigo-600" /> Change Password
          </h3>
          <div className="grid gap-2.5">
            <label>
              <span className={labelCls}>Old Password</span>
              <input
                className={field}
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Current password"
              />
            </label>
            <label>
              <span className={labelCls}>New Password</span>
              <input
                className={field}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="New password"
              />
            </label>
            {pwMsg ? (
              <p className={`m-0 text-xs font-medium ${pwMsg.type === "ok" ? "text-emerald-600" : "text-rose-600"}`}>
                {pwMsg.text}
              </p>
            ) : null}
            <button
              type="button"
              className="primary-btn h-10 w-full justify-center min-[400px]:w-auto"
              onClick={handlePassword}
              disabled={pwBusy}
            >
              {pwBusy ? "Updating..." : "Update Password"}
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
