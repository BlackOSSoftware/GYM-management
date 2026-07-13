"use client";

import { TrendingUp } from "lucide-react";
import { currency } from "../../lib/utils/format";
import { ChartCard } from "./ChartCard";

type Props = {
  monthRevenue: number;
  revenueBars: number[];
};

export default function RevenueCard({ monthRevenue, revenueBars }: Props) {
  return (
    <ChartCard
      title="Revenue Overview"
      action={
        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
          This Month
        </span>
      }
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="m-0 text-[22px] font-semibold tracking-tight text-ink min-[768px]:text-[26px]">
          {currency(monthRevenue)}
        </h2>
        <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600">
          <TrendingUp size={11} />
          +18.6% vs Last Month
        </span>
      </div>

      <div className="mt-2 flex min-h-[88px] flex-1 items-end gap-1 rounded-lg bg-gradient-to-t from-indigo-50/90 to-transparent px-0.5 pb-0.5 pt-2">
        {revenueBars.map((n, i) => {
          const h = Math.max(18, n);
          return (
            <div key={i} className="flex h-full min-w-0 flex-1 items-end justify-center">
              <span
                className="block w-full max-w-[16px] rounded-t-md bg-gradient-to-t from-indigo-600 to-indigo-400"
                style={{ height: `${h}%` }}
              />
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}
