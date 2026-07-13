"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Apple,
  ChevronRight,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserX,
  Utensils,
  X
} from "lucide-react";
import type { AnyDoc } from "../../lib/types";
import DropUpMenu from "../ui/DropUpMenu";

type FilterKey = "all" | "active" | "inactive";
type SortKey = "newest" | "name";

type Props = {
  records: AnyDoc[];
  onAdd: () => void;
  onEdit: (record: AnyDoc) => void;
  onView: (record: AnyDoc) => void;
  onDelete: (id: string) => void;
};

export default function DietView({ records, onAdd, onEdit, onView, onDelete }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [moreFor, setMoreFor] = useState<string | null>(null);
  const [sheet, setSheet] = useState<AnyDoc | null>(null);
  const moreAnchorRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => {
    const active = records.filter((r) => String(r.status || "").toLowerCase() === "active").length;
    return {
      total: records.length,
      active,
      inactive: records.length - active,
      templates: new Set(records.map((r) => r.category).filter(Boolean)).size
    };
  }, [records]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = [...records];
    if (filter === "active") rows = rows.filter((r) => String(r.status || "").toLowerCase() === "active");
    if (filter === "inactive") rows = rows.filter((r) => String(r.status || "").toLowerCase() !== "active");
    if (q) {
      rows = rows.filter((r) =>
        [r.name, r.category, r.breakfast, r.lunch, r.dinner, r.snacks, r.status]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }
    rows.sort((a, b) => {
      if (sort === "name") return String(a.name || "").localeCompare(String(b.name || ""));
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
    return rows;
  }, [records, search, filter, sort]);

  const statusClass = (s?: string) => (String(s || "").toLowerCase() === "active" ? "on" : "off");

  return (
    <div className="content ops-page">
      <div className="ops-head">
        <div>
          <h2>Diet Plans</h2>
          <p>{filtered.length} of {records.length} plans</p>
        </div>
        <button type="button" className="primary-btn" onClick={onAdd}><Plus size={18} /> Add Diet Plan</button>
      </div>

      <div className="ops-stats">
        <article className="ops-stat"><div className="ops-ico total"><Utensils size={17} /></div><div><b>{stats.total}</b><span>Total</span></div></article>
        <article className="ops-stat"><div className="ops-ico on"><UserCheck size={17} /></div><div><b>{stats.active}</b><span>Active</span></div></article>
        <article className="ops-stat"><div className="ops-ico off"><UserX size={17} /></div><div><b>{stats.inactive}</b><span>Inactive</span></div></article>
        <article className="ops-stat"><div className="ops-ico cat"><Apple size={17} /></div><div><b>{stats.templates}</b><span>Templates</span></div></article>
      </div>

      <div className="ops-toolbar">
        <div className="ops-search">
          <Search size={17} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search diet, meals, template..." />
          {search ? <button type="button" onClick={() => setSearch("")} aria-label="Clear"><X size={14} /></button> : null}
        </div>
        <select className="ops-sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
          <option value="newest">Newest</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      <div className="ops-chips">
        {(["all", "active", "inactive"] as const).map((key) => (
          <button key={key} type="button" className={`ops-chip${filter === key ? " active" : ""}`} onClick={() => setFilter(key)}>
            {key === "all" ? "All" : key === "active" ? "Active" : "Inactive"}
          </button>
        ))}
      </div>

      <div className="ops-table-card ops-desktop">
        <div className="ops-table-scroll">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Diet Plan</th>
                <th>Template</th>
                <th>Breakfast</th>
                <th>Lunch</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const key = String(row._id || row.name);
                return (
                  <tr key={key} className="ops-row">
                    <td>
                      <div className="ops-person">
                        <div className="ops-avatar diet"><Apple size={16} /></div>
                        <div>
                          <b>{row.name || "—"}</b>
                          <span>{row.dinner ? `Dinner: ${String(row.dinner).slice(0, 24)}` : "No dinner noted"}</span>
                        </div>
                      </div>
                    </td>
                    <td>{row.category || "—"}</td>
                    <td className="ops-clamp">{row.breakfast || "—"}</td>
                    <td className="ops-clamp">{row.lunch || "—"}</td>
                    <td><span className={`ops-status ${statusClass(row.status)}`}>{row.status || "—"}</span></td>
                    <td>
                      <div className="ops-row-actions" ref={moreFor === key ? moreAnchorRef : undefined}>
                        <button type="button" className="ops-icon" onClick={() => onView(row)} aria-label="View"><Eye size={15} /></button>
                        <button type="button" className="ops-icon" onClick={() => setMoreFor(moreFor === key ? null : key)} aria-label="More"><MoreHorizontal size={15} /></button>
                        <DropUpMenu open={moreFor === key} onClose={() => setMoreFor(null)} anchorRef={moreAnchorRef} className="ops-menu" width={150}>
                          <button type="button" onClick={() => { onEdit(row); setMoreFor(null); }}><Pencil size={14} /> Edit</button>
                          <button type="button" className="danger" onClick={() => { onDelete(row._id!); setMoreFor(null); }}><Trash2 size={14} /> Delete</button>
                        </DropUpMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 ? <div className="ops-empty">No diet plans found.</div> : null}
      </div>

      <div className="ops-tiles ops-mobile">
        {filtered.map((row) => (
          <button key={row._id || row.name} type="button" className="ops-tile" onClick={() => setSheet(row)}>
            <div className="ops-avatar diet"><Apple size={18} /></div>
            <div className="ops-tile-body">
              <div className="ops-tile-top">
                <b>{row.name || "—"}</b>
                <span className={`ops-status ${statusClass(row.status)}`}>{row.status || "—"}</span>
              </div>
              <span>{row.category || "Template"}</span>
              <div className="ops-tile-bottom">
                <strong>Lunch</strong>
                <span>{row.lunch ? String(row.lunch).slice(0, 28) : "—"}</span>
              </div>
            </div>
            <ChevronRight size={16} />
          </button>
        ))}
        {filtered.length === 0 ? <div className="ops-empty">No diet plans found.</div> : null}
      </div>

      <AnimatePresence>
        {sheet ? (
          <motion.div className="ops-sheet-root" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" className="ops-sheet-backdrop" onClick={() => setSheet(null)} aria-label="Close" />
            <motion.div className="ops-sheet" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 320 }}>
              <div className="ops-sheet-handle" />
              <div className="ops-sheet-head">
                <div>
                  <h3>{sheet.name}</h3>
                  <p>{sheet.category || "Diet plan"}</p>
                </div>
                <button type="button" className="ops-icon" onClick={() => setSheet(null)}><X size={16} /></button>
              </div>
              <div className="ops-sheet-scroll">
                <div className="ops-sheet-grid">
                  <div className="full"><span>Breakfast</span><b>{sheet.breakfast || "—"}</b></div>
                  <div className="full"><span>Lunch</span><b>{sheet.lunch || "—"}</b></div>
                  <div className="full"><span>Dinner</span><b>{sheet.dinner || "—"}</b></div>
                  <div className="full"><span>Snacks</span><b>{sheet.snacks || "—"}</b></div>
                  <div className="full"><span>Notes</span><b>{sheet.notes || "—"}</b></div>
                </div>
              </div>
              <div className="ops-sheet-actions">
                <button type="button" className="soft" onClick={() => { onView(sheet); setSheet(null); }}><Eye size={14} /> View</button>
                <button type="button" onClick={() => { onEdit(sheet); setSheet(null); }}><Pencil size={14} /> Edit</button>
                <button type="button" className="danger" onClick={() => { onDelete(sheet._id!); setSheet(null); }}><Trash2 size={14} /> Delete</button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
