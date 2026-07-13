"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  CreditCard,
  Eye,
  IndianRupee,
  MoreHorizontal,
  Pencil,
  Plus,
  Printer,
  Search,
  Trash2,
  Wallet,
  X,
  Clock,
  CheckCircle2
} from "lucide-react";
import type { AnyDoc } from "../../lib/types";
import { currency, formatDate } from "../../lib/utils/format";
import { printInvoice } from "../../lib/utils/invoice";
import DropUpMenu from "../ui/DropUpMenu";

type FilterKey = "all" | "paid" | "pending" | "refunded" | "renewal" | "membership";
type SortKey = "newest" | "amountDesc" | "amountAsc";

type Props = {
  records: AnyDoc[];
  onAdd: () => void;
  onEdit: (record: AnyDoc) => void;
  onView: (record: AnyDoc) => void;
  onDelete: (id: string) => void;
};

function monthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function PaymentView({ records, onAdd, onEdit, onView, onDelete }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [moreFor, setMoreFor] = useState<string | null>(null);
  const [sheet, setSheet] = useState<AnyDoc | null>(null);
  const moreAnchorRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => {
    const paid = records.filter((r) => String(r.status).toLowerCase() === "paid");
    const pending = records.filter((r) => String(r.status).toLowerCase() === "pending");
    const mk = monthKey();
    const monthRevenue = paid
      .filter((r) => String(r.paymentDate || "").startsWith(mk))
      .reduce((s, r) => s + Number(r.amount || 0), 0);
    const totalPaid = paid.reduce((s, r) => s + Number(r.amount || 0), 0);
    return {
      invoices: records.length,
      totalPaid,
      pending: pending.length,
      monthRevenue
    };
  }, [records]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = [...records];
    if (filter === "paid") rows = rows.filter((r) => String(r.status).toLowerCase() === "paid");
    if (filter === "pending") rows = rows.filter((r) => String(r.status).toLowerCase() === "pending");
    if (filter === "refunded") rows = rows.filter((r) => String(r.status).toLowerCase() === "refunded");
    if (filter === "renewal") rows = rows.filter((r) => String(r.type || "").toLowerCase().includes("renew"));
    if (filter === "membership") rows = rows.filter((r) => String(r.type || "").toLowerCase() === "membership");
    if (q) {
      rows = rows.filter((r) =>
        [r.invoiceNo, r.memberName, r.memberId, r.method, r.type, r.status, r.amount, r.paymentDate]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }
    rows.sort((a, b) => {
      if (sort === "amountDesc") return Number(b.amount || 0) - Number(a.amount || 0);
      if (sort === "amountAsc") return Number(a.amount || 0) - Number(b.amount || 0);
      return new Date(b.paymentDate || b.createdAt || 0).getTime() - new Date(a.paymentDate || a.createdAt || 0).getTime();
    });
    return rows;
  }, [records, search, filter, sort]);

  const statusClass = (status?: string) => {
    const s = String(status || "").toLowerCase();
    if (s === "paid") return "paid";
    if (s === "pending") return "pending";
    if (s === "refunded") return "refunded";
    return "";
  };

  return (
    <div className="content pay-page">
      <div className="pay-head">
        <div>
          <h2>Payments & Invoices</h2>
          <p>{filtered.length} of {records.length} invoices</p>
        </div>
        <button type="button" className="primary-btn" onClick={onAdd}><Plus size={18} /> Record Payment</button>
      </div>

      <div className="pay-stats">
        <article className="pay-stat"><div className="pay-ico invoices"><CreditCard size={17} /></div><div><b>{stats.invoices}</b><span>Total Invoices</span></div></article>
        <article className="pay-stat"><div className="pay-ico paid"><CheckCircle2 size={17} /></div><div><b>{currency(stats.totalPaid)}</b><span>Total Collected</span></div></article>
        <article className="pay-stat"><div className="pay-ico pending"><Clock size={17} /></div><div><b>{stats.pending}</b><span>Pending</span></div></article>
        <article className="pay-stat"><div className="pay-ico month"><IndianRupee size={17} /></div><div><b>{currency(stats.monthRevenue)}</b><span>This Month</span></div></article>
      </div>

      <div className="pay-toolbar">
        <div className="pay-search">
          <Search size={17} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoice, member, method..." />
          {search ? <button type="button" onClick={() => setSearch("")} aria-label="Clear"><X size={14} /></button> : null}
        </div>
        <select className="pay-sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
          <option value="newest">Newest first</option>
          <option value="amountDesc">Amount high–low</option>
          <option value="amountAsc">Amount low–high</option>
        </select>
      </div>

      <div className="pay-chips">
        {([
          ["all", "All"],
          ["paid", "Paid"],
          ["pending", "Pending"],
          ["refunded", "Refunded"],
          ["membership", "New Membership"],
          ["renewal", "Renewals"]
        ] as const).map(([key, label]) => (
          <button key={key} type="button" className={`pay-chip${filter === key ? " active" : ""}`} onClick={() => setFilter(key)}>{label}</button>
        ))}
      </div>

      <div className="pay-table-card pay-desktop">
        <div className="pay-table-scroll">
          <table className="pay-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Member</th>
                <th>Membership</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Paid On</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const key = String(row._id || row.invoiceNo);
                return (
                  <tr key={key} className="pay-row">
                    <td>
                      <div className="pay-inv">
                        <Wallet size={15} />
                        <b>{row.invoiceNo || "—"}</b>
                      </div>
                    </td>
                    <td>
                      <b>{row.memberName || "—"}</b>
                      {row.memberId ? <span className="pay-sub">{row.memberId}</span> : null}
                    </td>
                    <td>
                      <span>{row.type || "—"}</span>
                      {(row.membershipStart || row.membershipEnd) ? (
                        <span className="pay-sub">{formatDate(row.membershipStart)} → {formatDate(row.membershipEnd)}</span>
                      ) : null}
                    </td>
                    <td>{row.method || "—"}</td>
                    <td><b>{currency(Number(row.amount || 0))}</b></td>
                    <td>{formatDate(row.paymentDate)}</td>
                    <td><span className={`pay-status ${statusClass(row.status)}`}>{row.status || "—"}</span></td>
                    <td>
                      <div className="pay-row-actions" ref={moreFor === key ? moreAnchorRef : undefined}>
                        <button type="button" className="pay-icon" onClick={() => onView(row)} aria-label="View"><Eye size={15} /></button>
                        <button type="button" className="pay-icon" onClick={() => printInvoice(row)} aria-label="Print"><Printer size={15} /></button>
                        <button type="button" className="pay-icon" onClick={() => setMoreFor(moreFor === key ? null : key)} aria-label="More"><MoreHorizontal size={15} /></button>
                        <DropUpMenu open={moreFor === key} onClose={() => setMoreFor(null)} anchorRef={moreAnchorRef} className="pay-menu" width={160}>
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
        {filtered.length === 0 ? <div className="pay-empty">No invoices found.</div> : null}
      </div>

      <div className="pay-tiles pay-mobile">
        {filtered.map((row) => (
          <button key={row._id || row.invoiceNo} type="button" className="pay-tile" onClick={() => setSheet(row)}>
            <div className="pay-tile-ico"><Wallet size={18} /></div>
            <div className="pay-tile-body">
              <div className="pay-tile-top">
                <b>{row.invoiceNo || "Invoice"}</b>
                <span className={`pay-status ${statusClass(row.status)}`}>{row.status || "—"}</span>
              </div>
              <span>{row.memberName || "—"}</span>
              <div className="pay-tile-bottom">
                <strong>{currency(Number(row.amount || 0))}</strong>
                <span>{row.method || "—"} · Paid {formatDate(row.paymentDate)}</span>
              </div>
            </div>
            <ChevronRight size={16} />
          </button>
        ))}
        {filtered.length === 0 ? <div className="pay-empty">No invoices found.</div> : null}
      </div>

      <AnimatePresence>
        {sheet ? (
          <motion.div className="pay-sheet-root" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" className="pay-sheet-backdrop" onClick={() => setSheet(null)} aria-label="Close" />
            <motion.div className="pay-sheet" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 320 }}>
              <div className="pay-sheet-handle" />
              <div className="pay-sheet-head">
                <div>
                  <h3>{sheet.invoiceNo || "Invoice"}</h3>
                  <p>{sheet.memberName} · {currency(Number(sheet.amount || 0))}</p>
                </div>
                <button type="button" className="pay-icon" onClick={() => setSheet(null)}><X size={16} /></button>
              </div>
              <div className="pay-sheet-scroll">
                <div className="pay-sheet-grid">
                  <div><span>Type</span><b>{sheet.type || "—"}</b></div>
                  <div><span>Method</span><b>{sheet.method || "—"}</b></div>
                  <div><span>Paid on</span><b>{formatDate(sheet.paymentDate)}</b></div>
                  <div><span>Status</span><b>{sheet.status || "—"}</b></div>
                  <div className="full"><span>Membership</span><b>{(sheet.membershipStart || sheet.membershipEnd) ? `${formatDate(sheet.membershipStart)} → ${formatDate(sheet.membershipEnd)}` : "—"}</b></div>
                  {sheet.notes ? <div className="full"><span>Notes</span><b>{sheet.notes}</b></div> : null}
                </div>
              </div>
              <div className="pay-sheet-actions">
                <button type="button" className="soft" onClick={() => printInvoice(sheet)}><Printer size={14} /> Print</button>
                <button type="button" onClick={() => { onView(sheet); setSheet(null); }}><Eye size={14} /> View</button>
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
