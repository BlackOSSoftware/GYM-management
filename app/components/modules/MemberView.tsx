"use client";

import { useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { moduleTitles } from "../../lib/config/nav";
import { tableColumns } from "../../lib/config/fields";
import type { AnyDoc } from "../../lib/types";
import { formatValue, label } from "../../lib/utils/format";
import {
  daysUntilExpiry,
  filterMembersByExpiry,
  memberExpiryStatus,
  memberSearchText,
  sortMembersNewestFirst
} from "../../lib/utils/memberExpiry";
import WhatsAppMenu from "./WhatsAppMenu";

type ExpiryFilter = "all" | "active" | "expired" | "expiring";

const filters: { key: ExpiryFilter; label: string; short: string }[] = [
  { key: "all", label: "All Members", short: "All" },
  { key: "active", label: "Active", short: "Active" },
  { key: "expiring", label: "Expiring Soon", short: "≤10 days" },
  { key: "expired", label: "Expired", short: "Expired" }
];

type Props = {
  records: AnyDoc[];
  onAdd: () => void;
  onEdit: (record: AnyDoc) => void;
  onView: (record: AnyDoc) => void;
  onDelete: (id: string) => void;
};

export default function MemberView({ records, onAdd, onEdit, onView, onDelete }: Props) {
  const [localSearch, setLocalSearch] = useState("");
  const [expiryFilter, setExpiryFilter] = useState<ExpiryFilter>("all");

  const columns = tableColumns.members;

  const filtered = useMemo(() => {
    const q = localSearch.trim().toLowerCase();
    let rows = sortMembersNewestFirst(records);
    rows = filterMembersByExpiry(rows, expiryFilter);
    if (q) rows = rows.filter((r) => memberSearchText(r).includes(q));
    return rows;
  }, [records, localSearch, expiryFilter]);

  const counts = useMemo(() => ({
    all: records.length,
    active: filterMembersByExpiry(records, "active").length,
    expired: filterMembersByExpiry(records, "expired").length,
    expiring: filterMembersByExpiry(records, "expiring").length
  }), [records]);

  const rowClass = (member: AnyDoc) => {
    const status = memberExpiryStatus(member);
    if (status === "expired") return "member-row row-expired";
    if (status === "expiring") return "member-row row-expiring";
    return "member-row";
  };

  const expiryBadge = (member: AnyDoc) => {
    const days = daysUntilExpiry(member.expiryDate);
    const status = memberExpiryStatus(member);
    if (status === "expired") return <span className="expiry-badge expired">Expired</span>;
    if (status === "expiring" && days !== null) {
      return (
        <span className="expiry-badge expiring">
          {days === 0 ? "Expires today" : `${days} day${days === 1 ? "" : "s"} left`}
        </span>
      );
    }
    return <span className="expiry-badge active">Active</span>;
  };

  const statusPill = (status?: string) => {
    const s = (status || "").toLowerCase();
    const cls = s === "active" ? "status-pill status-active" : s === "frozen" ? "status-pill status-frozen" : "status-pill status-inactive";
    return <span className={cls}>{status || "—"}</span>;
  };

  const renderCell = (row: AnyDoc, col: string) => {
    if (col === "name") {
      return (
        <div className="member-name-cell">
          <span className="member-name">{row.name || "—"}</span>
          {row.email ? <span className="member-sub">{row.email}</span> : null}
        </div>
      );
    }
    if (col === "status") return statusPill(row.status);
    return formatValue(row[col], col);
  };

  return (
    <div className="content member-page">
      <div className="module-head member-head">
        <div>
          <h2>{moduleTitles.members}</h2>
          <p className="member-subtitle">
            <Users size={14} />
            {filtered.length} of {records.length} members · Newest first
          </p>
        </div>
        <button type="button" className="primary-btn" onClick={onAdd}>
          <Plus size={18} /> Add Member
        </button>
      </div>

      <div className="member-controls">
        <div className="member-search">
          <Search size={17} strokeWidth={2} />
          <input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search name, mobile, ID, plan..."
            aria-label="Search members"
          />
        </div>
        <div className="member-filters" role="tablist" aria-label="Filter members">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={expiryFilter === f.key}
              className={`filter-chip${expiryFilter === f.key ? " active" : ""}${f.key === "expired" ? " chip-danger" : ""}${f.key === "expiring" ? " chip-warning" : ""}`}
              onClick={() => setExpiryFilter(f.key)}
            >
              <span className="chip-label-full">{f.label}</span>
              <span className="chip-label-short">{f.short}</span>
              <span className="chip-count">{counts[f.key]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="table-card member-table-card">
        <div className="member-table-scroll">
          <table className="member-table">
            <thead>
              <tr>
                {columns.map((c) => <th key={c}>{label(c)}</th>)}
                <th>Membership</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row._id} className={rowClass(row)}>
                  {columns.map((c) => (
                    <td key={c} data-label={label(c)}>{renderCell(row, c)}</td>
                  ))}
                  <td data-label="Membership">{expiryBadge(row)}</td>
                  <td className="actions member-actions" data-label="Actions">
                    <div className="member-action-group">
                      <button type="button" className="action-icon" onClick={() => onView(row)} title="View">
                        <Eye size={15} />
                      </button>
                      <button type="button" className="action-icon" onClick={() => onEdit(row)} title="Edit">
                        <Pencil size={15} />
                      </button>
                      <button type="button" className="action-icon action-danger" onClick={() => onDelete(row._id!)} title="Delete">
                        <Trash2 size={15} />
                      </button>
                      <WhatsAppMenu member={row} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 ? (
          <div className="member-empty">
            <Users size={28} strokeWidth={1.5} />
            <p>No members match your search or filter.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
