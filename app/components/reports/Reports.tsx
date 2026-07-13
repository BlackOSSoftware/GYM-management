"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { AppData } from "../../lib/types";
import { buildPresetRange } from "../../lib/utils/reportRange";
import { buildReportAnalytics } from "../../lib/utils/reportAnalytics";
import DateFilterBar from "./DateFilterBar";
import KpiStrip from "./KpiStrip";
import AnalyticsPanels from "./AnalyticsPanels";
import ReportTables from "./ReportTables";
import ReportExportBar from "./ReportExportBar";
import { BarChart, ChartCard, FunnelChart, LineChart, PieChart } from "./Charts";

export default function Reports({ data }: { data: AppData }) {
  const [range, setRange] = useState(() => buildPresetRange("thisMonth"));
  const analytics = useMemo(() => buildReportAnalytics(data, range), [data, range]);

  return (
    <div className="content flex w-full min-w-0 flex-col gap-3 pb-7 min-[768px]:gap-3.5">
      <DateFilterBar range={range} onChange={setRange} />
      <ReportExportBar data={data} analytics={analytics} range={range} />

      <AnimatePresence mode="wait">
        <motion.div
          key={range.preset + (range.start?.getTime() || 0) + (range.end?.getTime() || 0)}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.22 }}
          className="flex min-w-0 flex-col gap-3.5"
        >
          <KpiStrip kpis={analytics.kpis} />
          <AnalyticsPanels a={analytics} />

          <div className="flex gap-3 overflow-x-auto pb-1.5 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden min-[768px]:grid min-[768px]:grid-cols-2 min-[768px]:overflow-visible min-[1280px]:grid-cols-4">
            <ChartCard title="Revenue Trend">
              <LineChart data={analytics.charts.revenueTrend} area />
            </ChartCard>
            <ChartCard title="Membership Growth">
              <LineChart data={analytics.charts.membershipGrowth} area />
            </ChartCard>
            <ChartCard title="Revenue Sources">
              <PieChart data={analytics.charts.revenueSources} />
            </ChartCard>
            <ChartCard title="Monthly Joinings">
              <BarChart data={analytics.charts.monthlyJoinings} />
            </ChartCard>
            <ChartCard title="Expense Breakdown">
              <PieChart data={analytics.charts.expenseBreakdown} donut />
            </ChartCard>
            <ChartCard title="Trainer Assignments">
              <BarChart data={analytics.charts.trainerAssignments} />
            </ChartCard>
            <ChartCard title="Visitor Conversion">
              <FunnelChart data={analytics.charts.visitorFunnel} />
            </ChartCard>
            <ChartCard title="Membership Status">
              <PieChart data={analytics.charts.membershipStatus} />
            </ChartCard>
          </div>

          <ReportTables tables={analytics.tables} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
