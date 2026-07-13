"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wrench,
  X
} from "lucide-react";
import type { AnyDoc } from "../../lib/types";
import { currency, formatDate } from "../../lib/utils/format";
import DropUpMenu from "../ui/DropUpMenu";

type FilterKey = "all" | "available" | "inuse" | "maintenance" | "damaged";
type SortKey = "newest" | "name" | "costDesc";

type Props = {
  records: AnyDoc[];
  onAdd: () => void;
  onEdit: (record: AnyDoc) => void;
  onView: (record: AnyDoc) => void;
  onDelete: (id: string) => void;
};

export default function EquipmentView({ records, onAdd, onEdit, onView, onDelete }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [moreFor, setMoreFor] = useState<string | null>(null);
  const [sheet, setSheet] = useState<AnyDoc | null>(null);
  const moreAnchorRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => {
    const available = records.filter((r) => String(r.availability || "").toLowerCase() === "available").length;
    const maintenance = records.filter((r) => String(r.availability || "").toLowerCase().includes("maintenance")).length;
    const damaged = records.filter((r) => String(r.condition || "").toLowerCase() === "damaged").length;
    return { total: records.length, available, maintenance, damaged };
  }, [records]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = [...records];
    if (filter === "available") rows = rows.filter((r) => String(r.availability || "").toLowerCase() === "available");
    if (filter === "inuse") rows = rows.filter((r) => String(r.availability || "").toLowerCase() === "in use");
    if (filter === "maintenance") rows = rows.filter((r) => String(r.availability || "").toLowerCase().includes("maintenance"));
    if (filter === "damaged") rows = rows.filter((r) => String(r.condition || "").toLowerCase() === "damaged");
    if (q) {
      rows = rows.filter((r) =>
        [r.name, r.category, r.vendor, r.condition, r.availability, r.status]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }
    rows.sort((a, b) => {
      if (sort === "name") return String(a.name || "").localeCompare(String(b.name || ""));
      if (sort === "costDesc") return Number(b.purchaseCost || 0) - Number(a.purchaseCost || 0);
      return new Date(b.createdAt || b.purchaseDate || 0).getTime() - new Date(a.createdAt || a.purchaseDate || 0).getTime();
    });
    return rows;
  }, [records, search, filter, sort]);

  const availClass = (a?: string) => {
    const s = String(a || "").toLowerCase();
    if (s === "available") return "on";
    if (s.includes("maintenance")) return "warn";
    if (s === "in use") return "info";
    return "off";
  };

  return (
    <div className="content ops-page">
      <div className="ops-head">
        <div>
          <h2>Equipment</h2>
          <p>{filtered.length} of {records.length} items</p>
        </div>
        <button type="button" className="primary-btn" onClick={onAdd}><Plus size={18} /> Add Equipment</button>
      </div>

      <div className="ops-stats">
        <article className="ops-stat"><div className="ops-ico total"><Wrench size={17} /></div><div><b>{stats.total}</b><span>Total</span></div></article>
        <article className="ops-stat"><div className="ops-ico on"><CheckCircle2 size={17} /></div><div><b>{stats.available}</b><span>Available</span></div></article>
        <article className="ops-stat"><div className="ops-ico warn"><AlertTriangle size={17} /></div><div><b>{stats.maintenance}</b><span>Maintenance</span></div></article>
        <article className="ops-stat"><div className="ops-ico off"><AlertTriangle size={17} /></div><div><b>{stats.damaged}</b><span>Damaged</span></div></article>
      </div>

      <div className="ops-toolbar">
        <div className="ops-search">
          <Search size={17} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search equipment, vendor, category..." />
          {search ? <button type="button" onClick={() => setSearch("")} aria-label="Clear"><X size={14} /></button> : null}
        </div>
        <select className="ops-sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
          <option value="newest">Newest</option>
          <option value="name">Name A–Z</option>
          <option value="costDesc">Cost high–low</option>
        </select>
      </div>

      <div className="ops-chips">
        {([
          ["all", "All"],
          ["available", "Available"],
          ["inuse", "In Use"],
          ["maintenance", "Maintenance"],
          ["damaged", "Damaged"]
        ] as const).map(([key, label]) => (
          <button key={key} type="button" className={`ops-chip${filter === key ? " active" : ""}`} onClick={() => setFilter(key)}>{label}</button>
        ))}
      </div>

      <div className="ops-table-card ops-desktop">
        <div className="ops-table-scroll">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Category</th>
                <th>Condition</th>
                <th>Availability</th>
                <th>Next Service</th>
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
                        <div className="ops-avatar equip"><Wrench size={16} /></div>
                        <div>
                          <b>{row.name || "—"}</b>
                          <span>{row.vendor || "No vendor"}{row.purchaseCost ? ` · ${currency(Number(row.purchaseCost))}` : ""}</span>
                        </div>
                      </div>
                    </td>
                    <td>{row.category || "—"}</td>
                    <td>{row.condition || "—"}</td>
                    <td><span className={`ops-status ${availClass(row.availability)}`}>{row.availability || "—"}</span></td>
                    <td>{formatDate(row.maintenanceDate)}</td>
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
        {filtered.length === 0 ? <div className="ops-empty">No equipment found.</div> : null}
      </div>

      <div className="ops-tiles ops-mobile">
        {filtered.map((row) => (
          <button key={row._id || row.name} type="button" className="ops-tile" onClick={() => setSheet(row)}>
            <div className="ops-avatar equip"><Wrench size={18} /></div>
            <div className="ops-tile-body">
              <div className="ops-tile-top">
                <b>{row.name || "—"}</b>
                <span className={`ops-status ${availClass(row.availability)}`}>{row.availability || "—"}</span>
              </div>
              <span>{row.category || "—"} · {row.condition || "—"}</span>
              <div className="ops-tile-bottom">
                <strong>{row.purchaseCost ? currency(Number(row.purchaseCost)) : "—"}</strong>
                <span>Service {formatDate(row.maintenanceDate)}</span>
              </div>
            </div>
            <ChevronRight size={16} />
          </button>
        ))}
        {filtered.length === 0 ? <div className="ops-empty">No equipment found.</div> : null}
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
                  <p>{sheet.category} · {sheet.condition}</p>
                </div>
                <button type="button" className="ops-icon" onClick={() => setSheet(null)}><X size={16} /></button>
              </div>
              <div className="ops-sheet-scroll">
                <div className="ops-sheet-grid">
                  <div><span>Availability</span><b>{sheet.availability || "—"}</b></div>
                  <div><span>Vendor</span><b>{sheet.vendor || "—"}</b></div>
                  <div><span>Cost</span><b>{sheet.purchaseCost ? currency(Number(sheet.purchaseCost)) : "—"}</b></div>
                  <div><span>Purchased</span><b>{formatDate(sheet.purchaseDate)}</b></div>
                  <div><span>Next Service</span><b>{formatDate(sheet.maintenanceDate)}</b></div>
                  <div><span>Status</span><b>{sheet.status || "—"}</b></div>
                  <div className="full"><span>Service History</span><b>{sheet.serviceHistory || "—"}</b></div>
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
