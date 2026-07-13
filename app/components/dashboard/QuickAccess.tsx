"use client";

import { quickActions, type ModuleKey } from "../../lib/config/nav";
import { ChartCard } from "./ChartCard";

type Props = {
  onNavigate: (key: ModuleKey, filter?: string) => void;
  onEdit: (collection: string) => void;
};

export function QuickActionButton({
  label,
  icon: Icon,
  onClick
}: {
  label: string;
  icon: any;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-full min-h-[64px] flex-col items-center justify-center gap-1 rounded-xl border border-line/55 bg-bg/50 px-1 py-2 text-center transition hover:border-indigo-200 hover:bg-indigo-50/50"
    >
      <span className="grid size-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
        <Icon size={16} />
      </span>
      <span className="text-[10px] font-semibold leading-tight text-ink min-[360px]:text-[11px]">{label}</span>
    </button>
  );
}

export default function QuickAccess({ onNavigate, onEdit }: Props) {
  return (
    <ChartCard title="Quick Access">
      <div className="grid h-full grid-cols-3 gap-1.5 min-[360px]:gap-2">
        {quickActions.map(([key, label, Icon]) => (
          <QuickActionButton
            key={label}
            label={label}
            icon={Icon}
            onClick={() => (key === "reports" ? onNavigate("reports") : onEdit(key))}
          />
        ))}
      </div>
    </ChartCard>
  );
}
