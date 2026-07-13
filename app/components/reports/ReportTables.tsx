"use client";

import type { AnyDoc } from "../../lib/types";
import { currency, formatDate } from "../../lib/utils/format";
import type { ReportTables } from "../../lib/utils/reportAnalytics";

function TableCard({
  title,
  rows,
  empty,
  columns
}: {
  title: string;
  rows: AnyDoc[];
  empty: string;
  columns: { key: string; label: string; render?: (r: AnyDoc) => string }[];
}) {
  return (
    <article className="min-w-0 rounded-2xl border border-line/60 bg-panel p-3.5 shadow-[0_8px_22px_rgba(15,23,42,0.05)]">
      <h3 className="mb-3 mt-0 text-sm font-semibold tracking-tight text-ink">{title}</h3>
      {rows.length === 0 ? (
        <p className="my-6 text-center text-[13px] text-muted">{empty}</p>
      ) : (
        <>
          <div className="hidden overflow-x-auto min-[768px]:block">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c.key} className="border-b border-line/55 px-1.5 py-2 text-left text-[11px] font-semibold text-muted whitespace-nowrap">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r._id || r.invoiceNo || r.name || i}>
                    {columns.map((c) => (
                      <td key={c.key} className="border-b border-line/55 px-1.5 py-2 text-ink whitespace-nowrap">
                        {c.render ? c.render(r) : String(r[c.key] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="block min-[768px]:hidden">
            {rows.map((r, i) => (
              <div key={r._id || r.name || i} className="grid gap-1.5 border-b border-line/50 py-2.5 last:border-0">
                {columns.map((c) => (
                  <div key={c.key} className="flex justify-between gap-2 text-xs">
                    <span className="text-muted">{c.label}</span>
                    <b className="text-right font-semibold text-ink">
                      {c.render ? c.render(r) : String(r[c.key] ?? "—")}
                    </b>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </article>
  );
}

export default function ReportTables({ tables }: { tables: ReportTables }) {
  return (
    <div className="grid grid-cols-1 gap-3 min-[768px]:grid-cols-2">
      <TableCard
        title="Latest Membership Renewals"
        rows={tables.renewals}
        empty="No renewals in this period"
        columns={[
          { key: "memberName", label: "Member" },
          { key: "amount", label: "Amount", render: (r) => currency(Number(r.amount || 0)) },
          { key: "paymentDate", label: "Paid", render: (r) => formatDate(r.paymentDate) },
          { key: "method", label: "Method" }
        ]}
      />
      <TableCard
        title="Latest New Members"
        rows={tables.newMembers}
        empty="No new members in this period"
        columns={[
          { key: "name", label: "Name" },
          { key: "membershipPlan", label: "Plan" },
          { key: "joiningDate", label: "Joined", render: (r) => formatDate(r.joiningDate || r.createdAt) },
          { key: "status", label: "Status" }
        ]}
      />
      <TableCard
        title="Upcoming Expiry"
        rows={tables.upcomingExpiry}
        empty="No upcoming expiries"
        columns={[
          { key: "name", label: "Member" },
          { key: "membershipPlan", label: "Plan" },
          { key: "expiryDate", label: "Expires", render: (r) => formatDate(r.expiryDate) },
          { key: "status", label: "Status" }
        ]}
      />
      <TableCard
        title="Pending Payments"
        rows={tables.pendingPayments}
        empty="No pending payments"
        columns={[
          { key: "memberName", label: "Member" },
          { key: "amount", label: "Amount", render: (r) => currency(Number(r.amount || 0)) },
          { key: "type", label: "Type" },
          { key: "paymentDate", label: "Date", render: (r) => formatDate(r.paymentDate) }
        ]}
      />
      <TableCard
        title="Salary Payments"
        rows={tables.salaryRows}
        empty="No salary rows"
        columns={[
          { key: "name", label: "Name" },
          { key: "_kind", label: "Role" },
          { key: "_paid", label: "Salary", render: (r) => currency(Number(r._paid || r.salary || 0)) },
          { key: "status", label: "Status" }
        ]}
      />
      <TableCard
        title="Recent Visitors"
        rows={tables.recentVisitors}
        empty="No visitors in this period"
        columns={[
          { key: "name", label: "Name" },
          { key: "source", label: "Source" },
          { key: "visitDate", label: "Visited", render: (r) => formatDate(r.visitDate) },
          { key: "status", label: "Status" }
        ]}
      />
      <TableCard
        title="Equipment Maintenance Schedule"
        rows={tables.maintenance}
        empty="No maintenance scheduled"
        columns={[
          { key: "name", label: "Equipment" },
          { key: "availability", label: "Availability" },
          { key: "condition", label: "Condition" },
          { key: "maintenanceDate", label: "Next Service", render: (r) => formatDate(r.maintenanceDate) }
        ]}
      />
    </div>
  );
}
