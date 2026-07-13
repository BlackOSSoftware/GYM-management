/** Date range helpers for Reports analytics */

export type RangePreset =
  | "today"
  | "yesterday"
  | "last7"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "all"
  | "custom";

export type DateRange = {
  preset: RangePreset;
  start: Date | null; // inclusive local midnight
  end: Date | null; // inclusive end-of-day
  label: string;
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function parseDate(value?: string | Date | null): Date | null {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const raw = String(value).trim();
  if (!raw) return null;
  // dd/mm/yyyy
  const dmy = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmy) {
    const d = new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const d = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function inRange(value: string | Date | null | undefined, range: DateRange) {
  if (range.preset === "all" || !range.start || !range.end) return true;
  const d = parseDate(value);
  if (!d) return false;
  const t = d.getTime();
  return t >= range.start.getTime() && t <= range.end.getTime();
}

export function buildPresetRange(preset: RangePreset, customStart?: string, customEnd?: string): DateRange {
  const now = new Date();
  const today = startOfDay(now);

  if (preset === "today") {
    return { preset, start: today, end: endOfDay(today), label: "Today" };
  }
  if (preset === "yesterday") {
    const y = addDays(today, -1);
    return { preset, start: y, end: endOfDay(y), label: "Yesterday" };
  }
  if (preset === "last7") {
    return { preset, start: addDays(today, -6), end: endOfDay(today), label: "Last 7 Days" };
  }
  if (preset === "thisMonth") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return { preset, start, end: endOfDay(today), label: "This Month" };
  }
  if (preset === "lastMonth") {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const end = endOfDay(new Date(today.getFullYear(), today.getMonth(), 0));
    return { preset, start, end, label: "Last Month" };
  }
  if (preset === "thisYear") {
    const start = new Date(today.getFullYear(), 0, 1);
    return { preset, start, end: endOfDay(today), label: "This Year" };
  }
  if (preset === "custom") {
    const s = customStart ? startOfDay(parseDate(customStart) || today) : today;
    const e = customEnd ? endOfDay(parseDate(customEnd) || today) : endOfDay(today);
    return {
      preset,
      start: s.getTime() <= e.getTime() ? s : e,
      end: s.getTime() <= e.getTime() ? e : s,
      label: "Custom Range"
    };
  }
  return { preset: "all", start: null, end: null, label: "All Time" };
}

/** Previous period of equal length (for % comparison). */
export function previousRange(range: DateRange): DateRange {
  if (range.preset === "all" || !range.start || !range.end) {
    return { preset: "all", start: null, end: null, label: "Prior" };
  }
  const ms = range.end.getTime() - range.start.getTime();
  const end = new Date(range.start.getTime() - 1);
  const start = new Date(end.getTime() - ms);
  return { preset: "custom", start: startOfDay(start), end: endOfDay(end), label: "Previous period" };
}

export function daysBetween(start: Date, end: Date) {
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
}

export function eachDay(start: Date, end: Date, maxPoints = 31): Date[] {
  const total = daysBetween(start, end);
  const step = Math.max(1, Math.ceil(total / maxPoints));
  const out: Date[] = [];
  for (let d = startOfDay(start); d.getTime() <= end.getTime(); d = addDays(d, step)) {
    out.push(new Date(d));
  }
  if (out.length && out[out.length - 1].getTime() < startOfDay(end).getTime()) {
    out.push(startOfDay(end));
  }
  return out;
}

export function eachMonth(start: Date, end: Date): Date[] {
  const out: Date[] = [];
  let cur = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);
  while (cur.getTime() <= last.getTime()) {
    out.push(new Date(cur));
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }
  return out.length ? out : [new Date(start.getFullYear(), start.getMonth(), 1)];
}

export const RANGE_PRESETS: { key: RangePreset; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "last7", label: "Last 7 Days" },
  { key: "thisMonth", label: "This Month" },
  { key: "lastMonth", label: "Last Month" },
  { key: "thisYear", label: "This Year" },
  { key: "all", label: "All Time" },
  { key: "custom", label: "Custom" }
];
