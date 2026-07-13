"use client";

import type { ReactNode } from "react";
import { cn } from "../../lib/utils/cn";

type ChartCardProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Shared card chrome for dashboard panels. */
export function ChartCard({ title, action, children, className }: ChartCardProps) {
  return (
    <article
      className={cn(
        "flex h-full min-w-0 flex-col rounded-2xl border border-line/60 bg-panel p-2.5 shadow-[0_4px_14px_rgba(15,23,42,0.04)] min-[360px]:p-3",
        className
      )}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <h3 className="m-0 text-[13px] font-semibold tracking-tight text-ink min-[768px]:text-sm">{title}</h3>
        {action ? <div className="shrink-0 text-[11px] font-medium text-muted">{action}</div> : null}
      </div>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </article>
  );
}
