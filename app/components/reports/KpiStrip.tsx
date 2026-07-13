"use client";

import {
  Activity,
  Briefcase,
  Dumbbell,
  TrendingDown,
  TrendingUp,
  Users,
  UserPlus,
  Wallet,
  Wrench
} from "lucide-react";
import type { Kpi } from "../../lib/utils/reportAnalytics";
import { currency } from "../../lib/utils/format";
import { cn } from "../../lib/utils/cn";

const ICONS: Record<string, typeof Users> = {
  Members: Users,
  Finance: Wallet,
  Expenses: Activity,
  Visitors: UserPlus,
  Trainers: Dumbbell,
  Staff: Briefcase,
  Equipment: Wrench
};

const TONE: Record<string, string> = {
  purple: "bg-indigo-50 text-indigo-600",
  green: "bg-emerald-50 text-emerald-600",
  blue: "bg-sky-50 text-sky-600",
  orange: "bg-orange-50 text-orange-600",
  red: "bg-rose-50 text-rose-600",
  yellow: "bg-amber-50 text-amber-600"
};

function formatValue(kpi: Kpi) {
  if (kpi.format === "currency") return currency(Number(kpi.value));
  if (kpi.format === "percent") return `${kpi.value}%`;
  return String(kpi.value);
}

export default function KpiStrip({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className="grid grid-cols-3 gap-1.5 min-[480px]:gap-2 min-[768px]:grid-cols-3 min-[1024px]:grid-cols-4 min-[1280px]:gap-2.5">
      {kpis.map((kpi) => {
        const Icon = ICONS[kpi.group] || Activity;
        const up = (kpi.delta ?? 0) >= 0;
        return (
          <article
            key={kpi.id}
            className="flex min-w-0 flex-col gap-1 rounded-xl border border-line/60 bg-panel p-1.5 shadow-[0_6px_16px_rgba(15,23,42,0.04)] min-[360px]:gap-1.5 min-[360px]:rounded-2xl min-[360px]:p-2 min-[480px]:p-2.5 min-[768px]:flex-row min-[768px]:items-start min-[768px]:gap-2.5 min-[768px]:p-3.5"
          >
            <div
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-lg min-[360px]:size-7 min-[360px]:rounded-[10px] min-[768px]:size-9 min-[768px]:rounded-[11px]",
                TONE[kpi.tone || "purple"]
              )}
            >
              <Icon className="size-3 min-[360px]:size-3.5 min-[768px]:size-[18px]" />
            </div>
            <div className="min-w-0 flex flex-1 flex-col gap-0.5">
              <span className="truncate text-[9px] leading-tight text-muted min-[360px]:text-[10px] min-[768px]:text-[11px]">
                {kpi.label}
              </span>
              <b className="truncate text-[11px] font-semibold leading-tight tracking-tight text-ink min-[360px]:text-xs min-[480px]:text-sm min-[768px]:text-base min-[1024px]:text-lg">
                {formatValue(kpi)}
              </b>
              {kpi.delta != null ? (
                <small
                  className={cn(
                    "inline-flex items-center gap-0.5 text-[9px] font-semibold min-[768px]:text-[11px]",
                    up ? "text-emerald-600" : "text-rose-600"
                  )}
                >
                  <span className="hidden min-[360px]:inline">
                    {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  </span>
                  {up ? "↑" : "↓"} {Math.abs(kpi.delta)}%
                </small>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
