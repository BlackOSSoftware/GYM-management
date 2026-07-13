"use client";

import type { AnyDoc, AppData } from "../../lib/types";
import { currency, download } from "../../lib/utils/format";
import { buildStats } from "../../lib/utils/stats";
import Panel from "../ui/Panel";

export default function Reports({ data }: { data: AppData }) {
  const stats = buildStats(data);

  const exportCsv = (name: string, rows: AnyDoc[]) => {
    const cols = Array.from(new Set(rows.flatMap((r) => Object.keys(r).filter((k) => k !== "passwordHash"))));
    const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => JSON.stringify(r[c] ?? "")).join(","))].join("\n");
    download(`${name}.csv`, csv);
  };

  return (
    <div className="content">
      <section className="report-grid">
        <Panel title="Membership Reports">
          <p>Active: {stats.activeMembers}</p>
          <p>Inactive: {stats.inactiveMembers}</p>
          <p>Expired: {stats.expiredMemberships}</p>
          <p>Upcoming Renewal: {stats.expiring30}</p>
          <button type="button" onClick={() => exportCsv("members-report", data.members)}>CSV Export</button>
        </Panel>
        <Panel title="Visitor Reports">
          <p>Total Visitors: {data.visitors.length}</p>
          <p>Follow Ups: {data.visitors.filter((v) => v.status === "Follow Up" || v.followUpDate).length}</p>
          <p>Converted: {data.visitors.filter((v) => v.status === "Converted").length}</p>
          <button type="button" onClick={() => exportCsv("visitors-report", data.visitors)}>CSV Export</button>
        </Panel>
        <Panel title="Revenue Reports">
          <p>Daily Revenue: {currency(stats.todayRevenue)}</p>
          <p>Monthly Revenue: {currency(stats.monthRevenue)}</p>
          <p>Outstanding Dues: {currency(stats.pendingRevenue)}</p>
          <button type="button" onClick={() => exportCsv("payments-report", data.payments)}>Excel/CSV Export</button>
        </Panel>
        <Panel title="Trainer Reports">
          <p>Total Trainers: {data.trainers.length}</p>
          <p>Assignments: {data.members.filter((m) => m.assignedTrainer).length}</p>
          <button type="button" onClick={() => exportCsv("trainer-report", data.trainers)}>CSV Export</button>
        </Panel>
        <Panel title="Equipment Reports">
          <p>Inventory: {data.equipment.length}</p>
          <p>Maintenance: {data.equipment.filter((e) => e.availability === "Under Maintenance").length}</p>
          <button type="button" onClick={() => exportCsv("equipment-report", data.equipment)}>CSV Export</button>
        </Panel>
      </section>
    </div>
  );
}
