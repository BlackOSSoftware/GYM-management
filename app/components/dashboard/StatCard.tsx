"use client";

import type { ModuleKey } from "../../lib/config/nav";
import { cn } from "../../lib/utils/cn";

const TONE: Record<string, string> = {
  purple: "bg-indigo-50 text-indigo-600",
  green: "bg-emerald-50 text-emerald-600",
  blue: "bg-sky-50 text-sky-600",
  orange: "bg-orange-50 text-orange-600",
  red: "bg-rose-50 text-rose-600",
  yellow: "bg-amber-50 text-amber-600"
};

export type StatCardData = {
  label: string;
  value: string | number;
  sub: string;
  icon: any;
  color: string;
  target: ModuleKey;
  filter: string;
};

type Props = StatCardData & {
  onClick: () => void;
};

export default function StatCard({ label, value, sub, icon: Icon, color, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-full min-w-0 flex-col gap-2 rounded-2xl border border-line/60 bg-panel p-2.5 text-left shadow-[0_4px_14px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)] min-[360px]:p-3"
    >
      <div className="flex items-center justify-between gap-2">
        <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl", TONE[color] || TONE.purple)}>
          <Icon size={17} strokeWidth={2.2} />
        </span>
        <span className="truncate text-[10px] font-medium text-muted">{sub}</span>
      </div>
      <div className="min-w-0">
        <b className="block truncate text-lg font-semibold leading-none tracking-tight text-ink min-[360px]:text-xl min-[1280px]:text-[22px]">
          {value}
        </b>
        <p className="mt-1 mb-0 truncate text-[11px] font-medium leading-tight text-ink/80 min-[768px]:text-xs">
          {label}
        </p>
      </div>
    </button>
  );
}
