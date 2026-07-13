"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  History,
  MessageCircle,
  Pencil,
  RefreshCw,
  Trash2,
  User,
  X
} from "lucide-react";
import type { AnyDoc } from "../../lib/types";
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
  member: AnyDoc | null;
  payments: AnyDoc[];
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onRenew: () => void;
  onDelete: () => void;
  onView: () => void;
};

export default function MemberBottomSheet({
  member,
  payments,
  open,
  onClose,
  onEdit,
  onRenew,
  onDelete,
  onView
}: Props) {
  if (!member) return null;
  const badge = membershipBadge(member);
  const related = payments
    .filter((p) => p.memberName === member.name || p.memberId === member.memberId)
    .slice()
    .sort((a, b) => new Date(b.paymentDate || b.createdAt || 0).getTime() - new Date(a.paymentDate || a.createdAt || 0).getTime());

  const message = () => {
    const url = whatsappUrl(member.mobile, smartMemberMessage(member));
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="mm-sheet-root" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" className="mm-sheet-backdrop" aria-label="Close" onClick={onClose} />
          <motion.div
            className="mm-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Member details"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            <div className="mm-sheet-handle" />
            <div className="mm-sheet-head">
              <div className={`mm-avatar lg badge-${badge}`}>{avatarInitials(member.name)}</div>
              <div className="mm-sheet-title">
                <h3>{member.name || "Member"}</h3>
                <p>{member.membershipPlan || "No plan"}</p>
                <p className="mm-sheet-phone">{formatPhoneDisplay(member.mobile) || "No phone"}</p>
                <span className={`mm-badge badge-${badge}`}>{membershipBadgeLabel(badge)}</span>
              </div>
              <button type="button" className="mm-icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
            </div>

            <div className="mm-sheet-section">
              <h4><User size={14} /> Profile</h4>
              <div className="mm-sheet-grid">
                <div><span>Member ID</span><b>{member.memberId || "—"}</b></div>
                <div><span>Email</span><b>{member.email || "—"}</b></div>
                <div><span>Account Status</span><b>{member.status || "—"}</b></div>
                <div><span>Amount</span><b>{currency(Number(member.billingAmount || 0))}</b></div>
              </div>
            </div>

            <div className="mm-sheet-section">
              <h4>Membership Details</h4>
              <div className="mm-sheet-grid">
                <div><span>Plan</span><b>{member.membershipPlan || "—"}</b></div>
                <div className="full"><span>Period</span><b>{formatMembershipPeriod(member.startDate, member.expiryDate)}</b></div>
                <div><span>Start</span><b>{formatDate(member.startDate)}</b></div>
                <div><span>Expiry</span><b>{formatDate(member.expiryDate)}</b></div>
                <div><span>Trainer</span><b>{member.assignedTrainer || "—"}</b></div>
              </div>
            </div>

            <div className="mm-sheet-section">
              <h4><History size={14} /> Payment History</h4>
              {related.length === 0 ? (
                <p className="mm-muted">No payment history yet.</p>
              ) : (
                <div className="mm-tx-list">
                  {related.map((p) => (
                    <div key={p._id} className="mm-tx-row">
                      <div>
                        <b>{p.invoiceNo || p.type || "Payment"}</b>
                        <span>Paid {formatDate(p.paymentDate)}{p.method ? ` · ${p.method}` : ""}</span>
                        {(p.membershipStart || p.membershipEnd) ? (
                          <span>{formatMembershipPeriod(p.membershipStart, p.membershipEnd)}</span>
                        ) : null}
                      </div>
                      <strong>{currency(Number(p.amount || 0))}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mm-sheet-actions">
              <button type="button" className="primary-btn mm-renew-btn" onClick={onRenew}>
                <RefreshCw size={16} /> Renew Membership
              </button>
              <div className="mm-sheet-actions-row">
                <button type="button" onClick={onView}><User size={16} /><span>Profile</span></button>
                <button type="button" onClick={onEdit}><Pencil size={16} /><span>Edit</span></button>
                <button type="button" onClick={message}><MessageCircle size={16} /><span>Message</span></button>
                <button type="button" className="danger" onClick={onDelete}><Trash2 size={16} /><span>Delete</span></button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
