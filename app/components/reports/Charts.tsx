"use client";

import type { ReactNode } from "react";
import type { ChartSeries } from "../../lib/utils/reportAnalytics";

const PALETTE = ["#4f46e5", "#20c67a", "#35a8f5", "#ff7b2c", "#ffb22e", "#ff4d5f", "#7047ff", "#94a3b8"];

function maxOf(data: ChartSeries[]) {
  return Math.max(1, ...data.map((d) => d.value));
}

function EmptyChart() {
  return <div className="py-8 text-center text-[13px] text-muted">No data in this period</div>;
}

export function LineChart({ data, area }: { data: ChartSeries[]; area?: boolean }) {
  const w = 320;
  const h = 140;
  const pad = 16;
  if (!data.length) return <EmptyChart />;
  const max = maxOf(data);
  const pts = data.map((d, i) => {
    const x = pad + (i * (w - pad * 2)) / Math.max(1, data.length - 1);
    const y = h - pad - (d.value / max) * (h - pad * 2);
    return { x, y, ...d };
  });
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ");
  const fill = `${line} L${pts[pts.length - 1].x},${h - pad} L${pts[0].x},${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="block h-[140px] w-full" role="img" aria-label="Trend chart">
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={pad}
          x2={w - pad}
          y1={pad + t * (h - pad * 2)}
          y2={pad + t * (h - pad * 2)}
          stroke="currentColor"
          className="text-line opacity-70"
          strokeWidth={1}
        />
      ))}
      {area ? <path d={fill} fill="rgba(79,70,229,0.18)" /> : null}
      <path d={line} fill="none" stroke="#4f46e5" strokeWidth={2.5} />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#4f46e5" />
      ))}
    </svg>
  );
}

export function BarChart({ data }: { data: ChartSeries[] }) {
  const max = maxOf(data);
  if (!data.length) return <EmptyChart />;
  return (
    <div className="flex h-[140px] items-end gap-2 pt-2" role="img" aria-label="Bar chart">
      {data.map((d, i) => (
        <div key={d.label + i} className="flex h-full min-w-0 flex-1 flex-col items-center gap-1.5">
          <div className="flex w-full flex-1 items-end justify-center">
            <div
              className="w-[70%] max-w-7 rounded-t-lg rounded-b-sm"
              style={{
                height: `${Math.max(4, (d.value / max) * 100)}%`,
                background: d.color || PALETTE[i % PALETTE.length],
                minHeight: 4
              }}
            />
          </div>
          <span className="max-w-full truncate text-[10px] text-muted">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function PieChart({ data, donut }: { data: ChartSeries[]; donut?: boolean }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  if (!data.length) return <EmptyChart />;
  let angle = -90;
  const slices = data.map((d, i) => {
    const sweep = (d.value / total) * 360;
    const start = angle;
    angle += sweep;
    return { ...d, start, sweep, color: d.color || PALETTE[i % PALETTE.length] };
  });

  const r = 42;
  const cx = 50;
  const cy = 50;
  const arc = (start: number, sweep: number) => {
    const toRad = (a: number) => (a * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(start));
    const y1 = cy + r * Math.sin(toRad(start));
    const x2 = cx + r * Math.cos(toRad(start + sweep));
    const y2 = cy + r * Math.sin(toRad(start + sweep));
    const large = sweep > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="grid grid-cols-1 items-center justify-items-center gap-2.5 min-[400px]:grid-cols-[120px_1fr] min-[400px]:justify-items-stretch">
      <svg viewBox="0 0 100 100" className="size-[120px]" role="img" aria-label="Pie chart">
        {slices.map((s, i) => (
          <path key={i} d={arc(s.start, Math.max(s.sweep, 0.01))} fill={s.color} />
        ))}
        {donut ? <circle cx={cx} cy={cy} r={22} className="fill-panel" /> : null}
      </svg>
      <ul className="m-0 w-full list-none space-y-1.5 p-0">
        {slices.map((s) => (
          <li key={s.label} className="grid grid-cols-[10px_1fr_auto] items-center gap-2 text-xs text-ink">
            <i className="size-2.5 rounded-sm" style={{ background: s.color }} />
            <span className="truncate">{s.label}</span>
            <b className="text-xs font-semibold">{s.value}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FunnelChart({ data }: { data: ChartSeries[] }) {
  const max = maxOf(data);
  if (!data.length) return <EmptyChart />;
  return (
    <div className="flex min-h-[140px] flex-col items-center justify-center gap-1.5" role="img" aria-label="Funnel chart">
      {data.map((d, i) => (
        <div
          key={d.label}
          className="flex min-h-9 items-center justify-between gap-2 rounded-[10px] px-3 py-2 text-xs font-semibold text-white"
          style={{
            width: `${Math.max(28, (d.value / max) * 100)}%`,
            background: d.color || PALETTE[i % PALETTE.length]
          }}
        >
          <span>{d.label}</span>
          <b>{d.value}</b>
        </div>
      ))}
    </div>
  );
}

export function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="min-h-[210px] w-[min(88vw,340px)] shrink-0 snap-start rounded-2xl border border-line/60 bg-panel p-3.5 shadow-[0_8px_22px_rgba(15,23,42,0.05)] min-[768px]:w-auto">
      <h3 className="mb-3 mt-0 text-sm font-semibold tracking-tight text-ink">{title}</h3>
      {children}
    </article>
  );
}
