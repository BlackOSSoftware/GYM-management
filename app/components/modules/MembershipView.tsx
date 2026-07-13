"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  Copy,
  Dumbbell,
  Eye,
  Filter,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  UserCheck,
  UserX,
  Layers,
  X
} from "lucide-react";
import type { AnyDoc } from "../../lib/types";
import { currency } from "../../lib/utils/format";
import { planDurationLabel, planIncludesTrainer } from "../../lib/utils/membership";
import DropUpMenu from "../ui/DropUpMenu";

type PlanFilter = "all" | "active" | "inactive" | "with" | "without";
type PlanSort = "newest" | "name" | "priceAsc" | "priceDesc";

const filters: { key: PlanFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
  { key: "with", label: "With Trainer" },
  { key: "without", label: "Without Trainer" }
];

type Props = {
  records: AnyDoc[];
  members?: AnyDoc[];
  onAdd: () => void;
  onEdit: (record: AnyDoc) => void;
  onView: (record: AnyDoc) => void;
  onDelete: (id: string) => void;
  onDuplicate: (record: AnyDoc) => void;
};

export default function MembershipView({
  records,
  members = [],
  onAdd,
  onEdit,
  onView,
  onDelete,
  onDuplicate
}: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<PlanFilter>("all");
  const [sort, setSort] = useState<PlanSort>("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [moreFor, setMoreFor] = useState<string | null>(null);
  const [sheet, setSheet] = useState<AnyDoc | null>(null);
  const moreAnchorRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => ({
    total: records.length,
    active: records.filter((r) => String(r.status || "").toLowerCase() === "active").length,
    withTrainer: records.filter((r) => planIncludesTrainer(r)).length,
    withoutTrainer: records.filter((r) => !planIncludesTrainer(r)).length
  }), [records]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = [...records];
    if (filter === "active") rows = rows.filter((r) => String(r.status || "").toLowerCase() === "active");
    if (filter === "inactive") rows = rows.filter((r) => String(r.status || "").toLowerCase() !== "active");
    if (filter === "with") rows = rows.filter((r) => planIncludesTrainer(r));
    if (filter === "without") rows = rows.filter((r) => !planIncludesTrainer(r));
    if (q) {
      rows = rows.filter((r) =>
        [r.name, r.description, r.trainerIncluded, r.durationType, r.status]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }
    rows.sort((a, b) => {
      if (sort === "name") return String(a.name || "").localeCompare(String(b.name || ""));
      if (sort === "priceAsc") return Number(a.price || 0) - Number(b.price || 0);
      if (sort === "priceDesc") return Number(b.price || 0) - Number(a.price || 0);
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
    return rows;
  }, [records, search, filter, sort]);

  const membersUsing = (planName?: string) =>
    members.filter((m) => m.membershipPlan === planName).length;

  return (
    <div className="content pl-page">
      <div className="pl-head">
        <div>
          <h2>Membership Plans</h2>
          <p>{filtered.length} of {records.length} plans</p>
        </div>
        <button type="button" className="primary-btn" onClick={onAdd}><Plus size={18} /> Add Membership</button>
      </div>

      <div className="pl-stats">
        <article className="pl-stat"><div className="pl-stat-icon total"><Layers size={17} /></div><div><b>{stats.total}</b><span>Total Plans</span></div></article>
        <article className="pl-stat"><div className="pl-stat-icon active"><UserCheck size={17} /></div><div><b>{stats.active}</b><span>Active Plans</span></div></article>
        <article className="pl-stat"><div className="pl-stat-icon with"><Dumbbell size={17} /></div><div><b>{stats.withTrainer}</b><span>With Trainer</span></div></article>
        <article className="pl-stat"><div className="pl-stat-icon without"><UserX size={17} /></div><div><b>{stats.withoutTrainer}</b><span>Without Trainer</span></div></article>
      </div>

      <div className="pl-toolbar">
        <div className="pl-search">
          <Search size={17} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search plans..." aria-label="Search plans" />
          {search ? <button type="button" onClick={() => setSearch("")} aria-label="Clear"><X size={14} /></button> : null}
        </div>
        <div className="pl-tools">
          <button type="button" className="pl-tool" onClick={() => setFilter((f) => (f === "all" ? "active" : "all"))}>
            <Filter size={15} /> Filter
          </button>
          <div className="pl-sort-wrap">
            <button type="button" className="pl-tool" onClick={() => setSortOpen((v) => !v)}>
              <SlidersHorizontal size={15} /> Sort
            </button>
            <AnimatePresence>
              {sortOpen ? (
                <motion.div className="pl-menu" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {[
                    ["newest", "Newest"],
                    ["name", "Name A–Z"],
                    ["priceAsc", "Price low–high"],
                    ["priceDesc", "Price high–low"]
                  ].map(([key, label]) => (
                    <button key={key} type="button" className={sort === key ? "active" : ""} onClick={() => { setSort(key as PlanSort); setSortOpen(false); }}>
                      {label}
                    </button>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="pl-chips">
        {filters.map((f) => (
          <button key={f.key} type="button" className={`pl-chip${filter === f.key ? " active" : ""}`} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="pl-table-card pl-desktop">
        <div className="pl-table-scroll">
          <table className="pl-table">
            <thead>
              <tr>
                <th>Plan Name</th>
                <th>Duration</th>
                <th>Trainer</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const key = String(row._id || row.name);
                const withTrainer = planIncludesTrainer(row);
                const active = String(row.status || "").toLowerCase() === "active";
                return (
                  <tr key={key} className="pl-row">
                    <td>
                      <div className="pl-plan-cell">
                        <b>{row.name || "—"}</b>
                        {row.description ? <span>{row.description}</span> : null}
                      </div>
                    </td>
                    <td>{planDurationLabel(row)}</td>
                    <td>
                      <span className={`pl-pill ${withTrainer ? "with" : "without"}`}>
                        {withTrainer ? "With Trainer" : "Without Trainer"}
                      </span>
                    </td>
                    <td><b>{currency(Number(row.price || 0))}</b></td>
                    <td><span className={`pl-status ${active ? "on" : "off"}`}>{row.status || "—"}</span></td>
                    <td>
                      <div className="pl-row-actions" ref={moreFor === key ? moreAnchorRef : undefined}>
                        <button type="button" className="pl-icon" onClick={() => onView(row)} aria-label="View"><Eye size={15} /></button>
                        <button type="button" className="pl-icon" onClick={() => setMoreFor(moreFor === key ? null : key)} aria-label="More">
                          <MoreHorizontal size={15} />
                        </button>
                        <DropUpMenu open={moreFor === key} onClose={() => setMoreFor(null)} anchorRef={moreAnchorRef} className="pl-menu" width={170}>
                          <button type="button" onClick={() => { onEdit(row); setMoreFor(null); }}><Pencil size={14} /> Edit</button>
                          <button type="button" onClick={() => { onDuplicate(row); setMoreFor(null); }}><Copy size={14} /> Duplicate</button>
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
        {filtered.length === 0 ? <div className="pl-empty">No membership plans found.</div> : null}
      </div>

      <div className="pl-tiles pl-mobile">
        {filtered.map((row) => {
          const withTrainer = planIncludesTrainer(row);
          const active = String(row.status || "").toLowerCase() === "active";
          return (
            <button key={row._id || row.name} type="button" className="pl-tile" onClick={() => setSheet(row)}>
              <div className="pl-tile-body">
                <div className="pl-tile-top">
                  <b>{row.name || "—"}</b>
                  <span className={`pl-status ${active ? "on" : "off"}`}>{row.status || "—"}</span>
                </div>
                <span className="pl-tile-meta">{planDurationLabel(row)}</span>
                <div className="pl-tile-bottom">
                  <strong>{currency(Number(row.price || 0))}</strong>
                  <span>{withTrainer ? "With Trainer" : "Without Trainer"}</span>
                </div>
              </div>
              <ChevronRight size={16} />
            </button>
          );
        })}
        {filtered.length === 0 ? <div className="pl-empty">No membership plans found.</div> : null}
      </div>

      <AnimatePresence>
        {sheet ? (
          <motion.div className="pl-sheet-root" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" className="pl-sheet-backdrop" onClick={() => setSheet(null)} aria-label="Close" />
            <motion.div
              className="pl-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
            >
              <div className="pl-sheet-handle" />
              <div className="pl-sheet-head">
                <div>
                  <h3>{sheet.name}</h3>
                  <p>{planDurationLabel(sheet)} · {currency(Number(sheet.price || 0))}</p>
                </div>
                <button type="button" className="pl-icon" onClick={() => setSheet(null)}><X size={16} /></button>
              </div>
              <div className="pl-sheet-grid">
                <div><span>Trainer</span><b>{planIncludesTrainer(sheet) ? "With Trainer" : "Without Trainer"}</b></div>
                <div><span>Status</span><b>{sheet.status || "—"}</b></div>
                <div><span>Members using</span><b>{membersUsing(sheet.name)}</b></div>
                <div><span>Created</span><b>{sheet.createdAt ? String(sheet.createdAt).slice(0, 10) : "—"}</b></div>
              </div>
              {sheet.description ? <p className="pl-sheet-desc">{sheet.description}</p> : null}
              <div className="pl-sheet-actions">
                <button type="button" className="primary-btn" onClick={() => { onEdit(sheet); setSheet(null); }}><Pencil size={15} /> Edit</button>
                <div className="pl-sheet-row">
                  <button type="button" onClick={() => { onView(sheet); setSheet(null); }}><Eye size={15} /> View</button>
                  <button type="button" onClick={() => { onDuplicate(sheet); setSheet(null); }}><Copy size={15} /> Duplicate</button>
                  <button type="button" className="danger" onClick={() => { onDelete(sheet._id!); setSheet(null); }}><Trash2 size={15} /> Delete</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
