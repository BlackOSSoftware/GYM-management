"use client";

import { Pencil, Trash2, UserMinus, X } from "lucide-react";
import type { AnyDoc } from "../../lib/types";
import { currency, formatValue } from "../../lib/utils/format";
import { avatarInitials, formatPhoneDisplay } from "../../lib/utils/memberExpiry";
import { staffDisplayRole } from "../modules/StaffView";

type Props = {
  record: AnyDoc;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDeactivate: () => void;
};

export default function StaffProfileView({ record, onClose, onEdit, onDelete, onDeactivate }: Props) {
  const status = String(record.status || "").toLowerCase();
  const statusCls = status === "active" ? "on" : "off";

  return (
    <div className="modal-backdrop pe-profile-backdrop">
      <section className="pe-profile-modal">
        <div className="pe-profile-hero">
          <button type="button" className="pe-profile-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
          <div className="pe-person">
            <div className="pe-avatar xl">{avatarInitials(record.name)}</div>
            <div>
              <span className={`pe-status ${statusCls}`}>{record.status || "—"}</span>
              <h2>{record.name || "Staff"}</h2>
              <p>{staffDisplayRole(record)}</p>
              <div className="pe-contact-line">
                {record.mobile ? <span>{formatPhoneDisplay(record.mobile)}</span> : null}
                {record.email ? <span>{record.email}</span> : null}
              </div>
            </div>
          </div>
          <div className="pe-profile-stats">
            <div><small>Salary</small><strong>{currency(Number(record.salary || 0))}</strong></div>
            <div><small>Joined</small><strong>{formatValue(record.joiningDate, "joiningDate")}</strong></div>
            <div><small>Status</small><strong>{record.status || "—"}</strong></div>
          </div>
        </div>

        <div className="pe-profile-body">
          <section className="pe-profile-card">
            <h3>Staff Details</h3>
            <div className="pe-profile-grid">
              <div><span>Full Name</span><b>{record.name || "—"}</b></div>
              <div><span>Mobile</span><b>{formatPhoneDisplay(record.mobile) || record.mobile || "—"}</b></div>
              <div><span>Email</span><b>{record.email || "—"}</b></div>
              <div><span>Designation</span><b>{staffDisplayRole(record)}</b></div>
              <div><span>Salary</span><b>{currency(Number(record.salary || 0))}</b></div>
              <div><span>Joining Date</span><b>{formatValue(record.joiningDate, "joiningDate")}</b></div>
              <div><span>Status</span><b>{record.status || "—"}</b></div>
            </div>
          </section>
        </div>

        <div className="pe-profile-actions">
          <button type="button" className="pe-pbtn ghost" onClick={onClose}>Close</button>
          <button type="button" className="pe-pbtn warn" onClick={onDeactivate}><UserMinus size={14} /> Off</button>
          <button type="button" className="pe-pbtn danger" onClick={onDelete}><Trash2 size={14} /> Delete</button>
          <button type="button" className="pe-pbtn primary" onClick={onEdit}><Pencil size={14} /> Edit</button>
        </div>
      </section>
    </div>
  );
}
