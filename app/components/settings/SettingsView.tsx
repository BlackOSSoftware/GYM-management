"use client";

import type { AppData } from "../../lib/types";
import Panel from "../ui/Panel";

export default function SettingsView({ data }: { data: AppData }) {
  return (
    <div className="content">
      <section className="settings-grid">
        <Panel title="Access Control">
          <p>Role based staff accounts are managed from Staff module.</p>
          <p>Current role: {data.session.role}</p>
          <p>Session: Secure HTTP-only cookie</p>
        </Panel>
        <Panel title="Audit Logs">
          <div className="log-list">
            {data.logs.map((log) => (
              <div key={log._id}>
                <b>{log.action}</b>
                <span>{log.entity}</span>
                <small>{log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}</small>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  );
}
