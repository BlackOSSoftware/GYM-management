"use client";

import { useMemo, useState } from "react";
import { CalendarRange, RotateCcw } from "lucide-react";
import {
  RANGE_PRESETS,
  buildPresetRange,
  type DateRange,
  type RangePreset
} from "../../lib/utils/reportRange";
import { cn } from "../../lib/utils/cn";

type Props = {
  range: DateRange;
  onChange: (range: DateRange) => void;
};

export default function DateFilterBar({ range, onChange }: Props) {
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const select = (preset: RangePreset) => {
    if (preset === "custom") {
      onChange(buildPresetRange("custom", customStart || undefined, customEnd || undefined));
      return;
    }
    onChange(buildPresetRange(preset));
  };

  const applyCustom = () => {
    if (!customStart || !customEnd) return;
    onChange(buildPresetRange("custom", customStart, customEnd));
  };

  const reset = () => {
    setCustomStart("");
    setCustomEnd("");
    onChange(buildPresetRange("thisMonth"));
  };

  const periodHint = useMemo(() => {
    if (!range.start || !range.end) return "Lifetime data";
    const fmt = (d: Date) =>
      `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    return `${fmt(range.start)} – ${fmt(range.end)}`;
  }, [range]);

  return (
    <div className="rounded-2xl border border-line/70 bg-panel p-3 shadow-[0_8px_24px_rgba(15,23,42,0.06)] min-[360px]:p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="m-0 text-lg font-semibold tracking-tight text-ink min-[360px]:text-xl min-[768px]:text-[28px]">
            Reports & Analytics
          </h2>
          <p className="mt-1.5 mb-0 flex flex-wrap items-center gap-1.5 text-xs text-muted min-[360px]:text-[13px]">
            <CalendarRange size={14} className="shrink-0" />
            <span>{range.label}</span>
            <span className="opacity-50">·</span>
            <span>{periodHint}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[10px] border border-line/70 bg-panel px-3 text-xs font-semibold text-ink"
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      <div className="-mx-0.5 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Date range">
        {RANGE_PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            role="tab"
            aria-selected={range.preset === p.key}
            onClick={() => select(p.key)}
            className={cn(
              "h-8 shrink-0 rounded-full border px-2.5 text-[11px] font-semibold whitespace-nowrap min-[360px]:px-3 min-[360px]:text-xs",
              range.preset === p.key
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-line/70 bg-bg/80 text-muted"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {range.preset === "custom" ? (
        <div className="mt-3 grid grid-cols-1 gap-2 min-[480px]:grid-cols-[1fr_1fr_auto] min-[480px]:items-end">
          <label className="grid gap-1 text-[11px] text-muted">
            <span>Start</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="h-10 rounded-[10px] border border-line/70 bg-panel px-2.5 text-sm text-ink"
            />
          </label>
          <label className="grid gap-1 text-[11px] text-muted">
            <span>End</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="h-10 rounded-[10px] border border-line/70 bg-panel px-2.5 text-sm text-ink"
            />
          </label>
          <button
            type="button"
            className="primary-btn h-10 w-full justify-center min-[480px]:w-auto"
            onClick={applyCustom}
            disabled={!customStart || !customEnd}
          >
            Apply
          </button>
        </div>
      ) : null}
    </div>
  );
}
