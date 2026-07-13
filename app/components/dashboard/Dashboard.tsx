"use client";

import { quickActions, type ModuleKey } from "../../lib/config/nav";
import type { AnyDoc, AppData } from "../../lib/types";
import { currency, formatValue } from "../../lib/utils/format";
import { seedSampleDataApi } from "../../lib/api/client";
import Panel from "../ui/Panel";
import GlobalSearchResults from "./GlobalSearchResults";
import StatGrid from "./StatGrid";

type Props = {
  data: AppData;
  stats: ReturnType<typeof import("../../lib/utils/stats").buildStats>;
  query: string;
  results: { key: ModuleKey; row: AnyDoc }[];
  onNavigate: (key: ModuleKey, filter?: string) => void;
  onEdit: (collection: string) => void;
  onView: (key: ModuleKey, row: AnyDoc) => void;
  onRefresh: () => Promise<void>;
};

function MiniList({ title, rows, columns }: { title: string; rows: AnyDoc[]; columns: string[] }) {
  return (
    <Panel title={title}>
      <div className="mini-list">
        {rows.map((r) => (
          <div key={r._id}>
            {columns.map((c, i) => (
              <span key={c} className={i === 0 ? "main-text" : ""}>{formatValue(r[c], c)}</span>
            ))}
          </div>
        ))}
      </div>
    </Panel>
  );
}

export default function Dashboard({ data, stats, query, results, onNavigate, onEdit, onView, onRefresh }: Props) {
  const handleSeed = async () => {
    await seedSampleDataApi();
    await onRefresh();
  };

  return (
    <div className="content">
      {query.trim() ? <GlobalSearchResults results={results} onOpen={onView} /> : null}
      <StatGrid cards={stats.cards} onCardClick={(target, filter) => onNavigate(target, filter)} />
      <section className="dashboard-grid">
        <Panel title="Revenue Overview" action="This Month">
          <h2>{currency(stats.monthRevenue)}</h2>
          <small className="green">+18.6% vs Last Month</small>
          <div className="bar-chart">{stats.revenueBars.map((n, i) => <i key={i} style={{ height: `${Math.max(12, n)}%` }} />)}</div>
        </Panel>
        <Panel title="Membership Expiry Overview">
          <div className="donut" style={{ background: `conic-gradient(#20c67a 0 ${stats.activePct}%, #ffc247 ${stats.activePct}% ${stats.activePct + stats.expiringPct}%, #ff8730 ${stats.activePct + stats.expiringPct}% ${stats.activePct + stats.expiringPct + 8}%, #ff4545 0)` }} />
          <ul className="legend">
            <li><b className="green-dot" />Active <span>{stats.activeMemberships}</span></li>
            <li><b className="yellow-dot" />Expiring in 30 Days <span>{stats.expiring30}</span></li>
            <li><b className="red-dot" />Expired <span>{stats.expiredMemberships}</span></li>
          </ul>
        </Panel>
        <Panel title="Quick Access">
          <div className="quick-grid">
            {quickActions.map(([key, label, Icon]) => (
              <button key={label} type="button" onClick={() => key === "reports" ? onNavigate("reports") : onEdit(key)}>
                <Icon size={22} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </Panel>
      </section>
      <section className="triple-grid">
        <MiniList title="Recent Member Registrations" rows={data.members.slice(0, 5)} columns={["name", "memberId", "status"]} />
        <MiniList title="Recent Payments" rows={data.payments.slice(0, 5)} columns={["memberName", "amount", "method"]} />
        <MiniList title="Upcoming Membership Expiries" rows={stats.upcoming} columns={["name", "membershipPlan", "expiryDate"]} />
      </section>
      {data.members.length === 0 ? (
        <div className="empty-seed">
          <button type="button" className="primary-btn" onClick={handleSeed}>Load Sample Data</button>
        </div>
      ) : null}
    </div>
  );
}
