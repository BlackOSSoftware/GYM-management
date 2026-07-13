"use client";

import { currency } from "../../lib/utils/format";
import type { ReportAnalytics } from "../../lib/utils/reportAnalytics";

function MetricGrid({ items }: { items: { label: string; value: string | number }[] }) {
  return (
    <div className="grid grid-cols-2 gap-1.5 min-[480px]:gap-2">
      {items.map((m) => (
        <div
          key={m.label}
          className="min-w-0 rounded-lg border border-line/50 bg-bg/70 p-2 min-[360px]:rounded-xl min-[360px]:p-2.5"
        >
          <span className="mb-0.5 block truncate text-[10px] text-muted min-[360px]:text-[11px]">{m.label}</span>
          <b className="break-words text-[12px] font-semibold text-ink min-[360px]:text-[13px]">{m.value}</b>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPanels({ a }: { a: ReportAnalytics }) {
  const c = currency;
  const sections = [
    {
      title: "Revenue Analytics",
      items: [
        { label: "Total Revenue", value: c(a.revenue.total) },
        { label: "Cash", value: c(a.revenue.cash) },
        { label: "UPI", value: c(a.revenue.upi) },
        { label: "Card", value: c(a.revenue.card) },
        { label: "Bank Transfer", value: c(a.revenue.bank) },
        { label: "Pending", value: c(a.revenue.pending) },
        { label: "Refunds", value: c(a.revenue.refunds) },
        { label: "Net Revenue", value: c(a.revenue.net) }
      ]
    },
    {
      title: "Membership Analytics",
      items: [
        { label: "Total Members", value: a.membership.total },
        { label: "New Joinings", value: a.membership.newJoinings },
        { label: "Renewals", value: a.membership.renewals },
        { label: "Expired", value: a.membership.expired },
        { label: "Expiring in 7 Days", value: a.membership.expiring7 },
        { label: "Cancelled", value: a.membership.cancelled },
        { label: "Avg Membership Value", value: c(a.membership.avgValue) }
      ]
    },
    {
      title: "Salary Analytics",
      items: [
        { label: "Trainer Salary", value: c(a.salary.trainer) },
        { label: "Staff Salary", value: c(a.salary.staff) },
        { label: "Total Salary Expense", value: c(a.salary.total) },
        { label: "Pending Salary", value: c(a.salary.pending) },
        { label: "Paid Salary", value: c(a.salary.paid) }
      ]
    },
    {
      title: "Visitor Analytics",
      items: [
        { label: "Walk-in Visitors", value: a.visitors.walkIns },
        { label: "Trial Members", value: a.visitors.trials },
        { label: "Converted", value: a.visitors.converted },
        { label: "Conversion Rate", value: `${Math.round(a.visitors.conversionRate * 10) / 10}%` },
        { label: "Follow Ups Pending", value: a.visitors.followUps }
      ]
    },
    {
      title: "Trainer Analytics",
      items: [
        { label: "Total Trainers", value: a.trainers.total },
        { label: "Active Trainers", value: a.trainers.active },
        { label: "Assigned Members", value: a.trainers.assigned },
        { label: "Workout Plans", value: a.trainers.workouts },
        { label: "Diet Plans", value: a.trainers.diets }
      ]
    },
    {
      title: "Equipment Analytics",
      items: [
        { label: "Total Equipment", value: a.equipment.total },
        { label: "Available", value: a.equipment.available },
        { label: "Maintenance", value: a.equipment.maintenance },
        { label: "Damaged", value: a.equipment.damaged },
        { label: "Purchase Cost", value: c(a.equipment.purchaseCost) },
        { label: "Maintenance Cost", value: c(a.equipment.maintenanceCost) }
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-3 min-[768px]:grid-cols-2 min-[1280px]:grid-cols-3">
      {sections.map((s) => (
        <article
          key={s.title}
          className="min-w-0 rounded-2xl border border-line/60 bg-panel p-3.5 shadow-[0_8px_22px_rgba(15,23,42,0.05)]"
        >
          <h3 className="mb-3 mt-0 text-sm font-semibold tracking-tight text-ink">{s.title}</h3>
          <MetricGrid items={s.items} />
        </article>
      ))}
    </div>
  );
}
