"use client";

import { Copy, Pencil, Trash2, Users, X } from "lucide-react";
import type { AnyDoc } from "../../lib/types";
import { currency, formatValue } from "../../lib/utils/format";
import { planDurationLabel, planIncludesTrainer } from "../../lib/utils/membership";

type Props = {
  record: AnyDoc;
  members: AnyDoc[];
  onClose: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

export default function MembershipProfileView({
  record,
  members,
  onClose,
  onEdit,
  onDuplicate,
  onDelete
}: Props) {
  const withTrainer = planIncludesTrainer(record);
  const active = String(record.status || "").toLowerCase() === "active";
  const using = members.filter((m) => m.membershipPlan === record.name).slice(0, 6);

  return (
    <div className="modal-backdrop plv-backdrop">
      <section className="plv-modal" role="dialog" aria-modal="true" aria-label="Membership details">
        <div className="plv-hero">
          <button type="button" className="plv-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
          <div className="plv-badges">
            <span className={`pl-status ${active ? "on" : "off"}`}>{record.status || "—"}</span>
            <span className={`pl-pill ${withTrainer ? "with" : "without"}`}>
              {withTrainer ? "With Trainer" : "Without Trainer"}
            </span>
          </div>
          <h2>{record.name || "Membership"}</h2>
          <p>{record.description || "Membership plan details"}</p>
          <div className="plv-hero-stats">
            <div><small>Price</small><strong>{currency(Number(record.price || 0))}</strong></div>
            <div><small>Duration</small><strong>{planDurationLabel(record)}</strong></div>
            <div><small>Members</small><strong>{using.length}</strong></div>
          </div>
        </div>

        <div className="plv-body">
          <section className="plv-card">
            <h3>Information</h3>
            <div className="plv-grid">
              <div><span>Plan Name</span><b>{record.name || "—"}</b></div>
              <div><span>Status</span><b>{record.status || "—"}</b></div>
              <div><span>Duration Type</span><b>{record.durationType || "Days"}</b></div>
              <div><span>Duration Value</span><b>{record.durationValue ?? record.durationDays ?? "—"}</b></div>
              <div><span>Created</span><b>{record.createdAt ? String(record.createdAt).slice(0, 10) : "—"}</b></div>
              <div><span>Updated</span><b>{record.updatedAt ? String(record.updatedAt).slice(0, 10) : "—"}</b></div>
            </div>
          </section>

          <section className="plv-card">
            <h3>Pricing & Trainer</h3>
            <div className="plv-grid">
              <div><span>Price</span><b>{currency(Number(record.price || 0))}</b></div>
              <div><span>Trainer Access</span><b>{withTrainer ? "With Trainer" : "Without Trainer"}</b></div>
            </div>
          </section>

          <section className="plv-card">
            <h3><Users size={14} /> Recent Members using this plan</h3>
            {using.length === 0 ? (
              <p className="plv-empty">No members are using this plan yet.</p>
            ) : (
              <div className="plv-members">
                {using.map((m) => (
                  <div key={m._id} className="plv-member-row">
                    <div>
                      <b>{m.name}</b>
                      <small>{m.memberId || "—"} · Exp {formatValue(m.expiryDate, "expiryDate")}</small>
                    </div>
                    <span>{currency(Number(m.billingAmount || 0))}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="plv-actions">
          <button type="button" className="plv-btn ghost" onClick={onClose}>Close</button>
          <button type="button" className="plv-btn soft" onClick={onDuplicate}><Copy size={15} /> Duplicate</button>
          <button type="button" className="plv-btn danger" onClick={onDelete}><Trash2 size={15} /> Delete</button>
          <button type="button" className="plv-btn primary" onClick={onEdit}><Pencil size={15} /> Edit</button>
        </div>
      </section>
    </div>
  );
}
