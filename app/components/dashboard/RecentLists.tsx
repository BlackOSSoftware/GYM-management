"use client";

import type { AnyDoc } from "../../lib/types";
import { formatValue } from "../../lib/utils/format";
import { avatarInitials } from "../../lib/utils/memberExpiry";
import { ChartCard } from "./ChartCard";
import { cn } from "../../lib/utils/cn";

function StatusBadge({ status }: { status?: string }) {
  const s = String(status || "").toLowerCase();
  const tone =
    s === "active"
      ? "bg-emerald-50 text-emerald-700"
      : s === "inactive" || s === "frozen"
        ? "bg-rose-50 text-rose-700"
        : "bg-slate-100 text-slate-600";
  return (
    <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold", tone)}>
      {status || "—"}
    </span>
  );
}

export function RecentMembers({ rows }: { rows: AnyDoc[] }) {
  return (
    <ChartCard title="Recent Member Registrations">
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {rows.map((m) => (
          <li
            key={m._id || m.memberId}
            className="flex items-center gap-2 rounded-xl border border-line/45 bg-bg/40 px-2 py-2"
          >
            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
              {avatarInitials(m.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <b className="truncate text-xs font-semibold text-ink">{formatValue(m.name, "name")}</b>
                <StatusBadge status={m.status} />
              </div>
              <span className="block truncate text-[11px] text-muted">{formatValue(m.memberId, "memberId")}</span>
            </div>
          </li>
        ))}
        {!rows.length ? <li className="py-4 text-center text-xs text-muted">No records</li> : null}
      </ul>
    </ChartCard>
  );
}

export function RecentPayments({ rows }: { rows: AnyDoc[] }) {
  return (
    <ChartCard title="Recent Payments">
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {rows.map((p) => (
          <li
            key={p._id || p.invoiceNo}
            className="flex items-center gap-2 rounded-xl border border-line/45 bg-bg/40 px-2 py-2"
          >
            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
              {avatarInitials(p.memberName)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <b className="truncate text-xs font-semibold text-ink">{formatValue(p.memberName, "memberName")}</b>
                <b className="shrink-0 text-xs font-semibold text-ink">{formatValue(p.amount, "amount")}</b>
              </div>
              <span className="block truncate text-[11px] text-muted">{formatValue(p.method, "method")}</span>
            </div>
          </li>
        ))}
        {!rows.length ? <li className="py-4 text-center text-xs text-muted">No records</li> : null}
      </ul>
    </ChartCard>
  );
}

export function UpcomingExpiries({ rows }: { rows: AnyDoc[] }) {
  return (
    <ChartCard title="Upcoming Membership Expiries">
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {rows.map((m) => (
          <li
            key={m._id || m.memberId}
            className="flex items-center gap-2 rounded-xl border border-line/45 bg-bg/40 px-2 py-2"
          >
            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700">
              {avatarInitials(m.name)}
            </div>
            <div className="min-w-0 flex-1">
              <b className="block truncate text-xs font-semibold text-ink">{formatValue(m.name, "name")}</b>
              <span className="block truncate text-[11px] text-muted">
                {formatValue(m.membershipPlan, "membershipPlan")} · {formatValue(m.expiryDate, "expiryDate")}
              </span>
            </div>
          </li>
        ))}
        {!rows.length ? <li className="py-4 text-center text-xs text-muted">No records</li> : null}
      </ul>
    </ChartCard>
  );
}
