"use client";

import { ChartCard } from "./ChartCard";

type Props = {
  activePct: number;
  expiringPct: number;
  activeMemberships: number;
  expiring30: number;
  expiredMemberships: number;
};

export default function ExpiryCard({
  activeMemberships,
  expiring30,
  expiredMemberships
}: Props) {
  const sum = Math.max(1, activeMemberships + expiring30 + expiredMemberships);
  const a = (activeMemberships / sum) * 100;
  const e = (expiring30 / sum) * 100;
  const x = (expiredMemberships / sum) * 100;
  const total = activeMemberships + expiring30 + expiredMemberships;

  const legend = [
    { label: "Active", value: activeMemberships, color: "#10b981", bg: "bg-emerald-50" },
    { label: "Expiring in 30 Days", value: expiring30, color: "#f59e0b", bg: "bg-amber-50" },
    { label: "Expired", value: expiredMemberships, color: "#f43f5e", bg: "bg-rose-50" }
  ];

  return (
    <ChartCard title="Membership Expiry Overview">
      <div className="flex min-h-0 flex-1 items-center gap-3">
        <div className="relative size-[96px] shrink-0 min-[768px]:size-[108px]">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(${legend[0].color} 0 ${a}%, ${legend[1].color} ${a}% ${a + e}%, ${legend[2].color} ${a + e}% ${a + e + x}%)`
            }}
            aria-hidden
          />
          <div className="absolute inset-[20%] flex flex-col items-center justify-center rounded-full bg-panel">
            <b className="text-lg font-semibold leading-none tracking-tight text-ink">{total}</b>
            <span className="mt-0.5 text-[9px] font-medium text-muted">Total</span>
          </div>
        </div>

        <ul className="m-0 flex min-h-0 w-full flex-1 list-none flex-col justify-center gap-1.5 p-0">
          {legend.map((item) => (
            <li
              key={item.label}
              className={`flex min-h-[36px] flex-1 items-center justify-between gap-2 rounded-lg px-2 py-1.5 ${item.bg}`}
            >
              <span className="inline-flex min-w-0 items-center gap-1.5 text-[11px] font-medium text-ink">
                <i className="size-2 shrink-0 rounded-full not-italic" style={{ background: item.color }} />
                <span className="truncate">{item.label}</span>
              </span>
              <b className="shrink-0 text-[13px] font-semibold text-ink">{item.value}</b>
            </li>
          ))}
        </ul>
      </div>
    </ChartCard>
  );
}
