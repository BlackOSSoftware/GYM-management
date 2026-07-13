"use client";

import {
  CreditCard,
  Dumbbell,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  Salad,
  User,
  X,
  CalendarRange
} from "lucide-react";
import type { AnyDoc, AppData } from "../../lib/types";
import { currency, formatDate, formatMembershipPeriod } from "../../lib/utils/format";
import {
  avatarInitials,
  formatPhoneDisplay,
  membershipBadge,
  membershipBadgeLabel,
  smartMemberMessage,
  whatsappUrl
} from "../../lib/utils/memberExpiry";

type Props = {
  record: AnyDoc;
  data: AppData;
  onClose: () => void;
  onEdit: () => void;
};

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="mp-info">
      <span>{label}</span>
      <b>{value || "—"}</b>
    </div>
  );
}

export default function MemberProfileView({ record, data, onClose, onEdit }: Props) {
  const badge = membershipBadge(record);
  const payments = data.payments
    .filter((p) =>
      (record.memberId && p.memberId === record.memberId) ||
      (record.name && p.memberName === record.name)
    )
    .slice()
    .sort((a, b) => new Date(b.paymentDate || b.createdAt || 0).getTime() - new Date(a.paymentDate || a.createdAt || 0).getTime());

  const trainer = data.trainers.find((t) => t.name === record.assignedTrainer);
  const workout = data.workouts.find((w) => w.name === record.workoutPlan);
  const diet = data.diets.find((d) => d.name === record.dietPlan);

  const openMessage = () => {
    const url = whatsappUrl(record.mobile, smartMemberMessage(record));
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="modal-backdrop mp-backdrop">
      <section className="mp-modal" role="dialog" aria-modal="true" aria-label="Member profile">
        <div className="mp-hero compact">
          <button type="button" className="mp-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
          <div className="mp-hero-main">
            <div className={`mp-avatar badge-${badge}`}>{avatarInitials(record.name)}</div>
            <div className="mp-hero-text">
              <div className="mp-hero-badges">
                <span className={`mm-badge badge-${badge}`}>{membershipBadgeLabel(badge)}</span>
                <span className={`mm-status s-${String(record.status || "").toLowerCase()}`}>{record.status || "—"}</span>
              </div>
              <h2>{record.name || "Member"}</h2>
              <p className="mp-id">{record.memberId || "No ID"} · {record.membershipPlan || "No plan"}</p>
              <div className="mp-contact-row">
                {record.mobile ? <span><Phone size={12} /> {formatPhoneDisplay(record.mobile)}</span> : null}
                {record.email ? <span><Mail size={12} /> {record.email}</span> : null}
              </div>
            </div>
          </div>
          <div className="mp-period-banner">
            <CalendarRange size={16} />
            <div>
              <small>Current membership</small>
              <strong>{formatMembershipPeriod(record.startDate, record.expiryDate)}</strong>
            </div>
            <div className="mp-period-amount">
              <small>Billing</small>
              <strong>{currency(Number(record.billingAmount || 0))}</strong>
            </div>
          </div>
        </div>

        <div className="mp-body compact">
          <section className="mp-card">
            <h3>Details</h3>
            <div className="mp-grid dense">
              <InfoItem label="Plan" value={String(record.membershipPlan || "—")} />
              <InfoItem label="Start Date" value={formatDate(record.startDate)} />
              <InfoItem label="Expiry Date" value={formatDate(record.expiryDate)} />
              <InfoItem label="Joining Date" value={formatDate(record.joiningDate)} />
              <InfoItem label="Amount" value={currency(Number(record.billingAmount || 0))} />
              <InfoItem label="Gender" value={String(record.gender || "—")} />
              <InfoItem label="Emergency" value={String(record.emergencyContact || "—")} />
              <InfoItem label="Address" value={String(record.address || "—")} />
              <InfoItem label="DOB" value={formatDate(record.dob)} />
            </div>
          </section>

          <section className="mp-card">
            <h3>Trainer & Plans</h3>
            <div className="mp-linked dense">
              <div className="mp-linked-item">
                <span className="mp-linked-label"><User size={13} /> Trainer</span>
                <b>{trainer?.name || "Not assigned"}</b>
                <small>{trainer?.specialization || "—"}</small>
              </div>
              <div className="mp-linked-item">
                <span className="mp-linked-label"><Dumbbell size={13} /> Workout</span>
                <b>{workout?.name || "Not assigned"}</b>
                <small>{workout?.category || "—"}</small>
              </div>
              <div className="mp-linked-item">
                <span className="mp-linked-label"><Salad size={13} /> Diet</span>
                <b>{diet?.name || "Not assigned"}</b>
                <small>{diet?.category || "—"}</small>
              </div>
            </div>
          </section>

          <section className="mp-card">
            <h3><CreditCard size={14} /> Payment & Membership History</h3>
            {payments.length > 0 ? (
              <div className="mp-payments">
                {payments.map((p, idx) => {
                  const hasStoredPeriod = Boolean(p.membershipStart || p.membershipEnd);
                  const period = hasStoredPeriod
                    ? formatMembershipPeriod(p.membershipStart, p.membershipEnd)
                    : idx === 0
                      ? formatMembershipPeriod(record.startDate, record.expiryDate)
                      : "Period not recorded";
                  return (
                  <div key={p._id} className="mp-pay-row history">
                    <div>
                      <b>{p.invoiceNo || p.type || "Payment"}</b>
                      <small>
                        Paid on {formatDate(p.paymentDate)}
                        {p.method ? ` · ${p.method}` : ""}
                        {p.type ? ` · ${p.type}` : ""}
                      </small>
                      <small className="mp-period-line">
                        Membership: {period}
                        {p.membershipPlan ? ` · ${p.membershipPlan}` : ""}
                      </small>
                    </div>
                    <strong>{currency(Number(p.amount || 0))}</strong>
                  </div>
                  );
                })}
              </div>
            ) : (
              <p className="mp-empty-note">No payment history yet.</p>
            )}
          </section>
        </div>

        <div className="mp-actions">
          <button type="button" className="mp-btn ghost" onClick={onClose}>Close</button>
          <button type="button" className="mp-btn soft" onClick={openMessage}><MessageCircle size={15} /> Message</button>
          <button type="button" className="mp-btn primary" onClick={onEdit}><Pencil size={15} /> Edit</button>
        </div>
      </section>
    </div>
  );
}
