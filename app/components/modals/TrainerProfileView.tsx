"use client";

import { MessageCircle, Pencil, Phone, Trash2, UserMinus, Users, X } from "lucide-react";
import type { AnyDoc } from "../../lib/types";
import { currency, formatValue } from "../../lib/utils/format";
import { avatarInitials, formatPhoneDisplay, whatsappUrl } from "../../lib/utils/memberExpiry";

type Props = {
  record: AnyDoc;
  members: AnyDoc[];
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDeactivate: () => void;
};

export default function TrainerProfileView({ record, members, onClose, onEdit, onDelete, onDeactivate }: Props) {
  const assigned = members.filter((m) => m.assignedTrainer === record.name).slice(0, 8);
  const status = String(record.status || "").toLowerCase();
  const statusCls = status === "active" ? "on" : status === "on leave" ? "leave" : "off";

  const message = () => {
    const url = whatsappUrl(record.mobile, `Hi ${record.name || ""}, `);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="modal-backdrop pe-profile-backdrop">
      <section className="pe-profile-modal">
        <div className="pe-profile-hero">
          <button type="button" className="pe-profile-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
          <div className="pe-person">
            <div className="pe-avatar xl">{avatarInitials(record.name)}</div>
            <div>
              <span className={`pe-status ${statusCls}`}>{record.status || "—"}</span>
              <h2>{record.name || "Trainer"}</h2>
              <p>{record.specialization || "Trainer"} · {record.experience ? `${record.experience} yrs` : "—"}</p>
              <div className="pe-contact-line">
                {record.mobile ? <span><Phone size={12} /> {formatPhoneDisplay(record.mobile)}</span> : null}
                {record.email ? <span>{record.email}</span> : null}
              </div>
            </div>
          </div>
          <div className="pe-profile-stats">
            <div><small>Salary</small><strong>{currency(Number(record.salary || 0))}</strong></div>
            <div><small>Members</small><strong>{assigned.length}</strong></div>
            <div><small>Joined</small><strong>{formatValue(record.joiningDate, "joiningDate")}</strong></div>
          </div>
        </div>

        <div className="pe-profile-body">
          <section className="pe-profile-card">
            <h3>Personal</h3>
            <div className="pe-profile-grid">
              <div><span>Gender</span><b>{record.gender || "—"}</b></div>
              <div><span>Email</span><b>{record.email || "—"}</b></div>
              <div><span>Address</span><b>{record.address || "—"}</b></div>
              <div><span>Emergency</span><b>{record.emergencyContact || "—"}</b></div>
            </div>
          </section>
          <section className="pe-profile-card">
            <h3>Professional</h3>
            <div className="pe-profile-grid">
              <div><span>Specialization</span><b>{record.specialization || "—"}</b></div>
              <div><span>Qualification</span><b>{record.qualification || "—"}</b></div>
              <div><span>Experience</span><b>{record.experience ? `${record.experience} years` : "—"}</b></div>
              <div><span>Status</span><b>{record.status || "—"}</b></div>
            </div>
          </section>
          <section className="pe-profile-card">
            <h3><Users size={14} /> Assigned Members</h3>
            {assigned.length === 0 ? (
              <p className="pe-empty-line">No members assigned yet.</p>
            ) : (
              <div className="pe-mini-list">
                {assigned.map((m) => (
                  <div key={m._id}><b>{m.name}</b><span>{m.membershipPlan || "—"}</span></div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="pe-profile-actions pe-profile-actions-5">
          <button type="button" className="pe-pbtn ghost" onClick={onClose}>Close</button>
          <button type="button" className="pe-pbtn soft" onClick={message}><MessageCircle size={14} /> Msg</button>
          <button type="button" className="pe-pbtn warn" onClick={onDeactivate}><UserMinus size={14} /> Off</button>
          <button type="button" className="pe-pbtn danger" onClick={onDelete}><Trash2 size={14} /> Del</button>
          <button type="button" className="pe-pbtn primary" onClick={onEdit}><Pencil size={14} /> Edit</button>
        </div>
      </section>
    </div>
  );
}
