"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  Eye,
  Filter,
  IndianRupee,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  UserCheck,
  UserMinus,
  Users,
  X,
  Briefcase
} from "lucide-react";
import type { AnyDoc } from "../../lib/types";
import { currency } from "../../lib/utils/format";
import { avatarInitials, formatPhoneDisplay } from "../../lib/utils/memberExpiry";
import DropUpMenu from "../ui/DropUpMenu";

type FilterKey = "all" | "active" | "leave" | "inactive";
type SortKey = "newest" | "name" | "salaryDesc" | "expDesc";

type Props = {
  records: AnyDoc[];
  members?: AnyDoc[];
  onAdd: () => void;
  onEdit: (record: AnyDoc) => void;
  onView: (record: AnyDoc) => void;
  onDelete: (id: string) => void;
  onDeactivate: (record: AnyDoc) => void;
};

function statusOf(row: AnyDoc) {
  return String(row.status || "").toLowerCase();
}

function experienceYears(value: any) {
  const n = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export default function TrainerView({
  records,
  members = [],
  onAdd,
  onEdit,
  onView,
  onDelete,
  onDeactivate
}: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [moreFor, setMoreFor] = useState<string | null>(null);
  const [sheet, setSheet] = useState<AnyDoc | null>(null);
  const moreAnchorRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => {
    const active = records.filter((r) => statusOf(r) === "active").length;
    const leave = records.filter((r) => statusOf(r) === "on leave").length;
    const totalSalary = records.reduce((sum, r) => sum + Number(r.salary || 0), 0);
    const avgExp = records.length
      ? Math.round((records.reduce((sum, r) => sum + experienceYears(r.experience), 0) / records.length) * 10) / 10
      : 0;
    return { total: records.length, active, leave, avgExp, totalSalary };
  }, [records]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = [...records];
    if (filter === "active") rows = rows.filter((r) => statusOf(r) === "active");
    if (filter === "leave") rows = rows.filter((r) => statusOf(r) === "on leave");
    if (filter === "inactive") rows = rows.filter((r) => statusOf(r) === "inactive");
    if (q) {
      rows = rows.filter((r) =>
        [r.name, r.mobile, r.email, r.specialization, r._id]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }
    rows.sort((a, b) => {
      if (sort === "name") return String(a.name || "").localeCompare(String(b.name || ""));
      if (sort === "salaryDesc") return Number(b.salary || 0) - Number(a.salary || 0);
      if (sort === "expDesc") return experienceYears(b.experience) - experienceYears(a.experience);
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
    return rows;
  }, [records, search, filter, sort]);

  const assignedCount = (name?: string) => members.filter((m) => m.assignedTrainer === name).length;

  const statusClass = (status?: string) => {
    const s = String(status || "").toLowerCase();
    if (s === "active") return "on";
    if (s === "on leave") return "leave";
    return "off";
  };

  return (
    <div className="content pe-page">
      <div className="pe-head">
        <div>
          <h2>Trainers</h2>
          <p>{filtered.length} of {records.length} trainers</p>
        </div>
        <button type="button" className="primary-btn" onClick={onAdd}><Plus size={18} /> Add Trainer</button>
      </div>

      <div className="pe-stats">
        <article className="pe-stat"><div className="pe-ico users"><Users size={17} /></div><div><b>{stats.total}</b><span>Total Trainers</span></div></article>
        <article className="pe-stat"><div className="pe-ico active"><UserCheck size={17} /></div><div><b>{stats.active}</b><span>Active</span></div></article>
        <article className="pe-stat"><div className="pe-ico leave"><UserMinus size={17} /></div><div><b>{stats.leave}</b><span>On Leave</span></div></article>
        <article className="pe-stat"><div className="pe-ico work"><Briefcase size={17} /></div><div><b>{stats.avgExp}y</b><span>Avg Experience</span></div></article>
        <article className="pe-stat"><div className="pe-ico pay"><IndianRupee size={17} /></div><div><b>{currency(stats.totalSalary)}</b><span>Total Salary</span></div></article>
      </div>

      <div className="pe-toolbar">
        <div className="pe-search">
          <Search size={17} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, mobile, specialization..." />
          {search ? <button type="button" onClick={() => setSearch("")} aria-label="Clear"><X size={14} /></button> : null}
        </div>
        <div className="pe-tools">
          <button type="button" className="pe-tool" onClick={() => setFilter((f) => (f === "all" ? "active" : "all"))}><Filter size={15} /> Filter</button>
          <div className="pe-sort-wrap">
            <button type="button" className="pe-tool" onClick={() => setSortOpen((v) => !v)}><SlidersHorizontal size={15} /> Sort</button>
            <AnimatePresence>
              {sortOpen ? (
                <motion.div className="pe-menu" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {[
                    ["newest", "Newest"],
                    ["name", "Name A–Z"],
                    ["salaryDesc", "Salary high–low"],
                    ["expDesc", "Experience high–low"]
                  ].map(([key, label]) => (
                    <button key={key} type="button" className={sort === key ? "active" : ""} onClick={() => { setSort(key as SortKey); setSortOpen(false); }}>{label}</button>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="pe-chips">
        {([
          ["all", "All"],
          ["active", "Active"],
          ["leave", "On Leave"],
          ["inactive", "Inactive"]
        ] as const).map(([key, label]) => (
          <button key={key} type="button" className={`pe-chip${filter === key ? " active" : ""}`} onClick={() => setFilter(key)}>{label}</button>
        ))}
      </div>

      <div className="pe-table-card pe-desktop">
        <div className="pe-table-scroll">
          <table className="pe-table">
            <thead>
              <tr>
                <th>Trainer</th>
                <th>Specialization</th>
                <th>Experience</th>
                <th>Salary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const key = String(row._id || row.mobile || row.name);
                return (
                  <tr key={key} className="pe-row">
                    <td>
                      <div className="pe-person">
                        <div className="pe-avatar">{avatarInitials(row.name)}</div>
                        <div>
                          <b>{row.name || "—"}</b>
                          <span>{formatPhoneDisplay(row.mobile) || row.mobile || "—"}</span>
                          <span>{row.email || "No email"}</span>
                        </div>
                      </div>
                    </td>
                    <td>{row.specialization || "—"}</td>
                    <td>{row.experience ? `${row.experience} yrs` : "—"}</td>
                    <td><b>{currency(Number(row.salary || 0))}</b></td>
                    <td><span className={`pe-status ${statusClass(row.status)}`}>{row.status || "—"}</span></td>
                    <td>
                      <div className="pe-row-actions" ref={moreFor === key ? moreAnchorRef : undefined}>
                        <button type="button" className="pe-icon" onClick={() => onView(row)} aria-label="View"><Eye size={15} /></button>
                        <button type="button" className="pe-icon" onClick={() => setMoreFor(moreFor === key ? null : key)} aria-label="More"><MoreHorizontal size={15} /></button>
                        <DropUpMenu open={moreFor === key} onClose={() => setMoreFor(null)} anchorRef={moreAnchorRef} className="pe-menu" width={200}>
                          <button type="button" onClick={() => { onEdit(row); setMoreFor(null); }}><Pencil size={14} /> Edit</button>
                          <button type="button" onClick={() => { onView(row); setMoreFor(null); }}><Users size={14} /> Assigned ({assignedCount(row.name)})</button>
                          <button type="button" onClick={() => { onDeactivate(row); setMoreFor(null); }}><UserMinus size={14} /> Deactivate</button>
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
        {filtered.length === 0 ? <div className="pe-empty">No trainers found.</div> : null}
      </div>

      <div className="pe-tiles pe-mobile">
        {filtered.map((row) => (
          <button key={row._id || row.name} type="button" className="pe-tile" onClick={() => setSheet(row)}>
            <div className="pe-avatar">{avatarInitials(row.name)}</div>
            <div className="pe-tile-body">
              <div className="pe-tile-top">
                <b>{row.name || "—"}</b>
                <span className={`pe-status ${statusClass(row.status)}`}>{row.status || "—"}</span>
              </div>
              <span>{row.specialization || "Trainer"}</span>
              <div className="pe-tile-bottom">
                <strong>{currency(Number(row.salary || 0))}</strong>
                <span>{row.experience ? `${row.experience} yrs` : "—"}</span>
              </div>
            </div>
            <ChevronRight size={16} />
          </button>
        ))}
        {filtered.length === 0 ? <div className="pe-empty">No trainers found.</div> : null}
      </div>

      <AnimatePresence>
        {sheet ? (
          <motion.div className="pe-sheet-root" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" className="pe-sheet-backdrop" onClick={() => setSheet(null)} aria-label="Close" />
            <motion.div className="pe-sheet" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 320 }}>
              <div className="pe-sheet-handle" />
              <div className="pe-sheet-head">
                <div className="pe-person">
                  <div className="pe-avatar lg">{avatarInitials(sheet.name)}</div>
                  <div>
                    <h3>{sheet.name}</h3>
                    <p>{sheet.specialization || "Trainer"} · {currency(Number(sheet.salary || 0))}</p>
                  </div>
                </div>
                <button type="button" className="pe-icon" onClick={() => setSheet(null)}><X size={16} /></button>
              </div>
              <div className="pe-sheet-scroll">
                <div className="pe-sheet-grid">
                  <div><span>Experience</span><b>{sheet.experience ? `${sheet.experience} yrs` : "—"}</b></div>
                  <div><span>Status</span><b>{sheet.status || "—"}</b></div>
                  <div><span>Mobile</span><b>{formatPhoneDisplay(sheet.mobile) || sheet.mobile || "—"}</b></div>
                  <div><span>Assigned members</span><b>{assignedCount(sheet.name)}</b></div>
                </div>
              </div>
              <div className="pe-sheet-actions">
                <button type="button" onClick={() => { onEdit(sheet); setSheet(null); }}><Pencil size={14} /> Edit</button>
                <button type="button" onClick={() => { onView(sheet); setSheet(null); }}><Eye size={14} /> Profile</button>
                <button type="button" onClick={() => { onDeactivate(sheet); setSheet(null); }}><UserMinus size={14} /> Off</button>
                <button type="button" className="danger" onClick={() => { onDelete(sheet._id!); setSheet(null); }}><Trash2 size={14} /> Delete</button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
