import type { AnyDoc } from "../types";
import { download } from "./format";
import type { DateRange } from "./reportRange";
import type { ReportAnalytics } from "./reportAnalytics";

function esc(v: unknown) {
  return JSON.stringify(v ?? "");
}

export function rowsToCsv(rows: AnyDoc[]) {
  if (!rows.length) return "No data\n";
  const cols = Array.from(new Set(rows.flatMap((r) => Object.keys(r).filter((k) => !k.startsWith("password")))));
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

export function buildSummaryCsv(a: ReportAnalytics, range: DateRange) {
  const lines = [
    ["Metric", "Value"].join(","),
    ...a.kpis.map((k) => [esc(k.label), esc(k.value)].join(",")),
    "",
    "Section,Key,Value",
    ...Object.entries(a.revenue).map(([k, v]) => ["Revenue", esc(k), esc(v)].join(",")),
    ...Object.entries(a.membership).map(([k, v]) => ["Membership", esc(k), esc(v)].join(",")),
    ...Object.entries(a.salary).map(([k, v]) => ["Salary", esc(k), esc(v)].join(","))
  ];
  return `Period,${esc(range.label)}\n${lines.join("\n")}`;
}

export function exportReportCsv(a: ReportAnalytics, range: DateRange, dataBundles: { name: string; rows: AnyDoc[] }[]) {
  download(`gym-report-${range.preset}.csv`, buildSummaryCsv(a, range));
  dataBundles.forEach((b) => {
    if (b.rows.length) download(`${b.name}-${range.preset}.csv`, rowsToCsv(b.rows));
  });
}

/** Excel-friendly Unicode CSV (opens in Excel). */
export function exportReportExcel(a: ReportAnalytics, range: DateRange) {
  const bom = "\uFEFF";
  download(`gym-report-${range.preset}.xls`, bom + buildSummaryCsv(a, range));
}

export function printReport(a: ReportAnalytics, range: DateRange) {
  const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
  if (!w) return;
  const rows = a.kpis
    .map((k) => `<tr><td>${k.label}</td><td>${k.value}</td><td>${k.group}</td></tr>`)
    .join("");
  w.document.write(`<!doctype html><html><head><title>Gym Report — ${range.label}</title>
    <style>
      body{font-family:system-ui,sans-serif;padding:24px;color:#0f172a}
      h1{margin:0 0 4px;font-size:22px} p{color:#64748b;margin:0 0 16px}
      table{width:100%;border-collapse:collapse;font-size:13px}
      th,td{border-bottom:1px solid #e2e8f0;padding:8px;text-align:left}
      th{background:#f8fafc}
    </style></head><body>
    <h1>Reports & Analytics</h1>
    <p>${range.label}</p>
    <table><thead><tr><th>KPI</th><th>Value</th><th>Group</th></tr></thead><tbody>${rows}</tbody></table>
    <script>window.onload=()=>{window.print();}</script>
    </body></html>`);
  w.document.close();
}

/** Lightweight printable HTML saved as .pdf via browser print dialog. */
export function exportReportPdf(a: ReportAnalytics, range: DateRange) {
  printReport(a, range);
}
