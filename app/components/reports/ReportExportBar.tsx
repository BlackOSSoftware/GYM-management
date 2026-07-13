"use client";

import { Download, FileSpreadsheet, FileText, Printer } from "lucide-react";
import type { AnyDoc, AppData } from "../../lib/types";
import type { DateRange } from "../../lib/utils/reportRange";
import type { ReportAnalytics } from "../../lib/utils/reportAnalytics";
import {
  exportReportCsv,
  exportReportExcel,
  exportReportPdf,
  printReport
} from "../../lib/utils/reportExport";

type Props = {
  data: AppData;
  analytics: ReportAnalytics;
  range: DateRange;
};

const btn =
  "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[11px] border border-line/70 bg-panel px-2.5 text-[11px] font-semibold text-ink whitespace-nowrap shadow-sm min-[360px]:px-3 min-[360px]:text-xs";

export default function ReportExportBar({ data, analytics, range }: Props) {
  const bundles = [
    { name: "members", rows: data.members as AnyDoc[] },
    { name: "payments", rows: data.payments as AnyDoc[] },
    { name: "visitors", rows: data.visitors as AnyDoc[] }
  ];

  return (
    <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <button type="button" className={btn} onClick={() => exportReportPdf(analytics, range)}>
        <FileText size={15} /> Export PDF
      </button>
      <button type="button" className={btn} onClick={() => exportReportExcel(analytics, range)}>
        <FileSpreadsheet size={15} /> Export Excel
      </button>
      <button type="button" className={btn} onClick={() => exportReportCsv(analytics, range, bundles)}>
        <Download size={15} /> Export CSV
      </button>
      <button type="button" className={btn} onClick={() => printReport(analytics, range)}>
        <Printer size={15} /> Print Report
      </button>
    </div>
  );
}
