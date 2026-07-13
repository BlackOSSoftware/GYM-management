"use client";

import { useMemo, useState } from "react";
import { Eye, Plus, Search, Trash2, UserPlus, Users } from "lucide-react";
import { moduleTitles } from "../../lib/config/nav";
import { tableColumns } from "../../lib/config/fields";
import type { AnyDoc } from "../../lib/types";
import { formatValue, label } from "../../lib/utils/format";
import { searchableText } from "../../lib/utils/search";

type VisitorFilter = "all" | "new" | "interested" | "followup" | "trial" | "converted" | "not_interested";

const filters: { key: VisitorFilter; label: string; match?: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "New", match: "New" },
  { key: "interested", label: "Interested", match: "Interested" },
  { key: "followup", label: "Follow Up", match: "Follow Up" },
  { key: "trial", label: "Trial", match: "Trial Booked" },
  { key: "converted", label: "Converted", match: "Converted" },
  { key: "not_interested", label: "Not Interested", match: "Not Interested" }
];

type Props = {
  records: AnyDoc[];
  members?: AnyDoc[];
  onAdd: () => void;
  onEdit: (record: AnyDoc) => void;
  onView: (record: AnyDoc) => void;
  onConvert: (record: AnyDoc) => void;
  onDelete: (id: string) => void;
};

function statusClass(status?: string) {
  const s = String(status || "").toLowerCase();
  if (s === "converted") return "converted";
  if (s === "not interested") return "cold";
  if (s === "interested" || s === "trial booked") return "hot";
  if (s === "follow up") return "warm";
  return "new";
}

function phoneDigits(value?: string) {
  return String(value || "").replace(/\D/g, "");
}

function isVisitorConverted(visitor: AnyDoc, members: AnyDoc[]) {
  if (String(visitor.status || "") === "Converted") return true;
  const vPhone = phoneDigits(visitor.mobile);
  if (!vPhone) return false;
  return members.some((m) => {
    const mPhone = phoneDigits(m.mobile);
    return mPhone && mPhone === vPhone;
  });
}

export default function VisitorView({
  records,
  members = [],
  onAdd,
  onEdit,
  onView,
  onConvert,
  onDelete
}: Props) {
  const [localSearch, setLocalSearch] = useState("");
  const [filter, setFilter] = useState<VisitorFilter>("all");
  const columns = tableColumns.visitors;

  const enriched = useMemo(() => {
    return records.map((visitor) => {
      const converted = isVisitorConverted(visitor, members);
      if (!converted) return visitor;
      return { ...visitor, status: "Converted" };
    });
  }, [records, members]);

  const counts = useMemo(() => {
    const out: Record<string, number> = { all: enriched.length };
    for (const f of filters) {
      if (f.key === "all") continue;
      out[f.key] = enriched.filter((r) => String(r.status || "") === f.match).length;
    }
    return out;
  }, [enriched]);

  const filtered = useMemo(() => {
    const q = localSearch.trim().toLowerCase();
    let rows = [...enriched].sort((a, b) => {
      const aTime = new Date(a.createdAt || a.visitDate || 0).getTime();
      const bTime = new Date(b.createdAt || b.visitDate || 0).getTime();
      return bTime - aTime;
    });
    const selected = filters.find((f) => f.key === filter);
    if (selected?.match) rows = rows.filter((r) => String(r.status || "") === selected.match);
    if (q) rows = rows.filter((r) => searchableText(r).includes(q));
    return rows;
  }, [enriched, localSearch, filter]);

  return (
    <div className="content visitor-page">
      <div className="module-head member-head">
        <div>
          <h2>{moduleTitles.visitors}</h2>
          <p>{filtered.length} of {enriched.length} visitors · newest first</p>
        </div>
        <button type="button" className="primary-btn" onClick={onAdd}><Plus size={18} /> Add Visitor</button>
      </div>

      <div className="member-controls visitor-controls">
        <div className="member-search">
          <Search size={17} />
          <input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search name, mobile, visitor ID, source..."
            aria-label="Search visitors"
          />
        </div>
        <div className="member-filters visitor-filters" role="tablist" aria-label="Filter visitors">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              className={`filter-chip${filter === f.key ? " active" : ""}${f.key === "converted" ? " chip-success" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              <span className="chip-count">{counts[f.key] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="table-card visitor-table-card">
        <div className="member-table-scroll">
          <table className="member-table visitor-table">
            <thead>
              <tr>
                {columns.map((c) => <th key={c}>{label(c)}</th>)}
                <th>Lead</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const converted = String(row.status || "") === "Converted";
                return (
                  <tr key={row._id} className={converted ? "visitor-row converted" : "visitor-row"}>
                    {columns.map((c) => (
                      <td key={c}>
                        {c === "status" ? (
                          <span className={`visitor-status ${statusClass(row.status)}`}>
                            {converted ? "Converted" : (row.status || "—")}
                          </span>
                        ) : (
                          formatValue(row[c], c)
                        )}
                      </td>
                    ))}
                    <td>
                      {converted ? (
                        <span className="visitor-converted-tag">Converted · Member</span>
                      ) : (
                        <span className="visitor-lead-tag">Lead</span>
                      )}
                    </td>
                    <td className="actions">
                      <button type="button" onClick={() => onView(row)} title="View"><Eye size={15} /> View</button>
                      <button type="button" onClick={() => onEdit(row)}>Edit</button>
                      {!converted ? (
                        <button type="button" onClick={() => onConvert(row)}><UserPlus size={15} /> Convert</button>
                      ) : null}
                      <button type="button" className="danger" onClick={() => onDelete(row._id!)}><Trash2 size={15} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 ? (
          <div className="member-empty">
            <Users size={28} strokeWidth={1.5} />
            <p>No visitors match your search or filter.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
