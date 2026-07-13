"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarClock,
  ChevronRight,
  CreditCard,
  Eye,
  Filter,
  Menu,
  Plus,
  Search,
  SlidersHorizontal,
  TrendingUp,
  UserCheck,
  UserX,
  Users,
  X
} from "lucide-react";
import type { AnyDoc } from "../../lib/types";
import { currency, formatValue } from "../../lib/utils/format";
import {
  avatarInitials,
  filterMembersByExpiry,
  formatPhoneDisplay,
  memberSearchText,
  memberStats,
  membershipBadge,
  membershipBadgeLabel,
  sortMembers,
  type MemberSort
} from "../../lib/utils/memberExpiry";
import MemberBottomSheet from "./MemberBottomSheet";
import MemberMoreMenu from "./MemberMoreMenu";
import { renewMemberDefaults } from "../../lib/utils/membershipRenew";

type ExpiryFilter = "all" | "active" | "expiring" | "expired" | "inactive";

const filters: { key: ExpiryFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "expiring", label: "Expiring" },
  { key: "expired", label: "Expired" },
  { key: "inactive", label: "Inactive" }
];

const sorts: { key: MemberSort; label: string }[] = [
  { key: "newest", label: "Newest first" },
  { key: "nameAsc", label: "Name A–Z" },
  { key: "expiryAsc", label: "Expiry soonest" },
  { key: "expiryDesc", label: "Expiry latest" },
  { key: "amountDesc", label: "Amount high–low" }
];

type Props = {
  records: AnyDoc[];
  payments?: AnyDoc[];
  onAdd: () => void;
  onEdit: (record: AnyDoc) => void;
  onView: (record: AnyDoc) => void;
  onDelete: (id: string) => void;
  onOpenSidebar?: () => void;
};

export default function MemberView({
  records,
  payments = [],
  onAdd,
  onEdit,
  onView,
  onDelete,
  onOpenSidebar
}: Props) {
  const [localSearch, setLocalSearch] = useState("");
  const [expiryFilter, setExpiryFilter] = useState<ExpiryFilter>("all");
  const [sort, setSort] = useState<MemberSort>("newest");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [moreFor, setMoreFor] = useState<string | null>(null);
  const [sheetMember, setSheetMember] = useState<AnyDoc | null>(null);

  const stats = useMemo(() => memberStats(records), [records]);

  const filtered = useMemo(() => {
    const q = localSearch.trim().toLowerCase();
    let rows = sortMembers(records, sort);
    rows = filterMembersByExpiry(rows, expiryFilter);
    if (q) rows = rows.filter((r) => memberSearchText(r).includes(q));
    return rows;
  }, [records, localSearch, expiryFilter, sort]);

  const renew = (member: AnyDoc) => {
    onEdit(renewMemberDefaults(member));
  };

  return (
    <div className="content mm-page">
      <div className="mm-mobile-header">
        <button type="button" className="mm-icon-btn" onClick={onOpenSidebar} aria-label="Open menu">
          <Menu size={18} />
        </button>
        <div className="mm-mobile-title">
          <h2>Members</h2>
          <span>Showing {filtered.length} of {records.length}</span>
        </div>
        <button type="button" className="mm-icon-btn accent" onClick={onAdd} aria-label="Add member"><Plus size={18} /></button>
        <button
          type="button"
          className="mm-icon-btn"
          onClick={() => setMobileSearchOpen((v) => !v)}
          aria-label="Search"
        >
          <Search size={18} />
        </button>
      </div>

      <AnimatePresence>
        {mobileSearchOpen ? (
          <motion.div
            className="mm-mobile-search"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="mm-search-bar">
              <Search size={16} />
              <input
                autoFocus
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search members..."
                aria-label="Search members"
              />
              {localSearch ? (
                <button type="button" onClick={() => setLocalSearch("")} aria-label="Clear"><X size={14} /></button>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="mm-desktop-head">
        <div>
          <h2>Member Management</h2>
          <p>Showing {filtered.length} of {records.length} members · newest first</p>
        </div>
        <button type="button" className="primary-btn" onClick={onAdd}><Plus size={18} /> Add Member</button>
      </div>

      <div className="mm-stats">
        <article className="mm-stat">
          <div className="mm-stat-icon users"><Users size={18} /></div>
          <div>
            <b>{stats.total}</b>
            <span>Members</span>
          </div>
          <em className="up"><ArrowUpRight size={14} /> All</em>
        </article>
        <article className="mm-stat">
          <div className="mm-stat-icon active"><UserCheck size={18} /></div>
          <div>
            <b>{stats.active}</b>
            <span>Active</span>
          </div>
          <em className="up"><TrendingUp size={14} /> Live</em>
        </article>
        <article className="mm-stat warn">
          <div className="mm-stat-icon warn"><CalendarClock size={18} /></div>
          <div>
            <b>{stats.expiringToday}</b>
            <span>Expiring Today</span>
          </div>
          <em className="warn">Today</em>
        </article>
        <article className="mm-stat danger">
          <div className="mm-stat-icon danger"><UserX size={18} /></div>
          <div>
            <b>{stats.expired}</b>
            <span>Expired</span>
          </div>
          <em className="down">Alert</em>
        </article>
        <article className="mm-stat revenue">
          <div className="mm-stat-icon revenue"><CreditCard size={18} /></div>
          <div>
            <b>{currency(stats.revenue)}</b>
            <span>Revenue</span>
          </div>
          <em className="up"><TrendingUp size={14} /></em>
        </article>
      </div>

      <div className="mm-toolbar">
        <div className="mm-search-bar floating">
          <Search size={18} />
          <input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by name, mobile, email, plan..."
            aria-label="Search members"
          />
        </div>
        <div className="mm-toolbar-actions">
          <button type="button" className="mm-tool-btn" onClick={() => setFilterSheetOpen(true)}>
            <Filter size={15} /> Filter
          </button>
          <div className="mm-sort-wrap">
            <button type="button" className="mm-tool-btn" onClick={() => setSortOpen((v) => !v)}>
              <SlidersHorizontal size={15} /> Sort
            </button>
            <AnimatePresence>
              {sortOpen ? (
                <motion.div
                  className="mm-menu"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {sorts.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      className={sort === s.key ? "active" : ""}
                      onClick={() => { setSort(s.key); setSortOpen(false); }}
                    >
                      {s.label}
                    </button>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="mm-chips" role="tablist" aria-label="Quick filters">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            role="tab"
            aria-selected={expiryFilter === f.key}
            className={`mm-chip${expiryFilter === f.key ? " active" : ""}`}
            onClick={() => setExpiryFilter(f.key)}
          >
            {f.label}
            <span className="mm-chip-count">
              {f.key === "all" ? records.length : filterMembersByExpiry(records, f.key).length}
            </span>
          </button>
        ))}
      </div>

      {/* Desktop table — plain tr so every row always renders */}
      <div className="mm-table-card mm-desktop-only">
        <div className="mm-table-scroll">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Membership</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const badge = membershipBadge(row);
                const rowKey = String(row._id || row.memberId || row.mobile || row.name);
                return (
                  <tr key={rowKey} className={`mm-row strip-${badge}`}>
                    <td>
                      <div className="mm-person">
                        <div className={`mm-avatar badge-${badge}`}>{avatarInitials(row.name)}</div>
                        <div className="mm-person-text">
                          <b>{row.name || "—"}</b>
                          <span>{row.email || "No email"}</span>
                          <span>{formatPhoneDisplay(row.mobile) || "No phone"}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="mm-plan">{row.membershipPlan || "—"}</span></td>
                    <td><b className="mm-amount">{currency(Number(row.billingAmount || 0))}</b></td>
                    <td>{formatValue(row.expiryDate, "expiryDate")}</td>
                    <td><span className={`mm-status s-${String(row.status || "").toLowerCase()}`}>{row.status || "—"}</span></td>
                    <td><span className={`mm-badge badge-${badge}`}>{membershipBadgeLabel(badge)}</span></td>
                    <td>
                      <div className="mm-row-actions">
                        <button type="button" className="mm-icon-btn" onClick={() => onView(row)} title="View" aria-label="View">
                          <Eye size={15} />
                        </button>
                        <MemberMoreMenu
                          member={row}
                          open={moreFor === rowKey}
                          onOpenChange={(open) => setMoreFor(open ? rowKey : null)}
                          onEdit={() => onEdit(row)}
                          onRenew={() => renew(row)}
                          onDelete={() => row._id && onDelete(row._id)}
                          onHistory={() => onView(row)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 ? (
          <div className="mm-empty">
            <Users size={32} strokeWidth={1.4} />
            <h3>No members found</h3>
            <p>Try another filter or add your first member.</p>
            <button type="button" className="primary-btn" onClick={onAdd}><Plus size={16} /> Add Member</button>
          </div>
        ) : (
          <div className="mm-table-footer">Showing all {filtered.length} members</div>
        )}
      </div>

      {/* Mobile tiles */}
      <div className="mm-tiles mm-mobile-only">
        {filtered.length === 0 ? (
          <div className="mm-empty compact">
            <Users size={28} strokeWidth={1.4} />
            <h3>No members</h3>
            <p>Adjust filters or add a member.</p>
          </div>
        ) : (
          filtered.map((row) => {
            const badge = membershipBadge(row);
            const rowKey = String(row._id || row.memberId || row.mobile || row.name);
            return (
              <button
                key={rowKey}
                type="button"
                className={`mm-tile strip-${badge}`}
                onClick={() => setSheetMember(row)}
              >
                <div className={`mm-avatar badge-${badge}`}>{avatarInitials(row.name)}</div>
                <div className="mm-tile-body">
                  <div className="mm-tile-top">
                    <b>{row.name || "—"}</b>
                    <span className={`mm-badge sm badge-${badge}`}>{membershipBadgeLabel(badge)}</span>
                  </div>
                  <span className="mm-tile-plan">{row.membershipPlan || "No plan"}</span>
                  <div className="mm-tile-bottom">
                    <strong>{currency(Number(row.billingAmount || 0))}</strong>
                    <span className="mm-tile-expiry">Exp {formatValue(row.expiryDate, "expiryDate")}</span>
                  </div>
                  <span className="mm-tile-hint">Tap for details</span>
                </div>
                <ChevronRight size={18} className="mm-tile-chevron" aria-hidden />
              </button>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {filterSheetOpen ? (
          <motion.div className="mm-sheet-root" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" className="mm-sheet-backdrop" onClick={() => setFilterSheetOpen(false)} aria-label="Close filters" />
            <motion.div
              className="mm-sheet compact"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
            >
              <div className="mm-sheet-handle" />
              <h3 className="mm-sheet-simple-title">Filter members</h3>
              <div className="mm-filter-list">
                {filters.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    className={expiryFilter === f.key ? "active" : ""}
                    onClick={() => {
                      setExpiryFilter(f.key);
                      setFilterSheetOpen(false);
                    }}
                  >
                    {f.label}
                    <span>
                      {f.key === "all" ? records.length : filterMembersByExpiry(records, f.key).length}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <MemberBottomSheet
        member={sheetMember}
        payments={payments}
        open={!!sheetMember}
        onClose={() => setSheetMember(null)}
        onView={() => { if (sheetMember) { onView(sheetMember); setSheetMember(null); } }}
        onEdit={() => { if (sheetMember) { onEdit(sheetMember); setSheetMember(null); } }}
        onRenew={() => { if (sheetMember) { renew(sheetMember); setSheetMember(null); } }}
        onDelete={() => { if (sheetMember?._id) { onDelete(sheetMember._id); setSheetMember(null); } }}
      />
    </div>
  );
}
