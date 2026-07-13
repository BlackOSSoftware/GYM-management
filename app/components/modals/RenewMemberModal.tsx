"use client";

import { useMemo, useState } from "react";
import { CalendarRange, CreditCard, X } from "lucide-react";
import type { AnyDoc, AppData } from "../../lib/types";
import { saveRecordApi } from "../../lib/api/client";
import { currency, formatDate, formatMembershipPeriod } from "../../lib/utils/format";
import { calculateExpiryFromPlan, planDurationLabel, planIncludesTrainer } from "../../lib/utils/membership";
import { renewKindLabel, type RenewKind } from "../../lib/utils/membershipRenew";
import Button from "../ui/Button";

type Props = {
  member: AnyDoc;
  data: AppData;
  onClose: () => void;
  onSaved: () => Promise<void>;
};

export default function RenewMemberModal({ member, data, onClose, onSaved }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const renewKind = (member._renewKind as RenewKind) || "default";
  const initialPlan =
    data.memberships.find((p) => p.name === member.membershipPlan) || data.memberships[0] || null;
  const initialStart = String(member.startDate || member.expiryDate || today).slice(0, 10);

  const [planName, setPlanName] = useState(initialPlan?.name || member.membershipPlan || "");
  const [startDate, setStartDate] = useState(initialStart);
  const [discount, setDiscount] = useState(String(member.discount ?? 0));
  const [paymentMethod, setPaymentMethod] = useState("");
  const [assignedTrainer, setAssignedTrainer] = useState(String(member.assignedTrainer || ""));
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const plan = useMemo(
    () => data.memberships.find((p) => p.name === planName) || null,
    [data.memberships, planName]
  );

  const planPrice = Number(plan?.price || 0);
  const billingAmount = Math.max(0, planPrice - Number(discount || 0));
  const expiryDate = plan && startDate ? calculateExpiryFromPlan(startDate, plan) : "";
  const showTrainer = plan ? planIncludesTrainer(plan) : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      if (!planName) throw new Error("Please select a membership plan");
      if (!startDate) throw new Error("Renew start date is required");
      if (!paymentMethod) throw new Error("Please select payment method (Cash / UPI / Card)");
      if (!member._id) throw new Error("Member record missing");

      const { _id, passwordHash, _renewMode, _renewKind, paymentMethod: _pm, ...rest } = member;

      await saveRecordApi({
        collection: "members",
        _id,
        ...rest,
        membershipPlan: planName,
        planPrice,
        discount: Number(discount || 0),
        billingAmount,
        startDate,
        expiryDate,
        status: "Active",
        assignedTrainer: showTrainer ? assignedTrainer : ""
      });

      await saveRecordApi({
        collection: "payments",
        memberName: member.name,
        memberId: member.memberId || "",
        amount: billingAmount,
        method: paymentMethod,
        type: "Membership Renewal",
        status: "Paid",
        paymentDate: today,
        membershipPlan: planName,
        membershipStart: startDate,
        membershipEnd: expiryDate,
        notes: `Renewal — ${planName} (${formatMembershipPeriod(startDate, expiryDate)})`
      });

      await onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Renew failed");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="modal-backdrop sf-backdrop">
      <form className="sf-modal sf-renew" onSubmit={handleSubmit}>
        <div className="sf-head">
          <div>
            <h2>Renew Membership</h2>
            <p>{renewKindLabel(renewKind)}</p>
          </div>
          <button type="button" className="sf-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="sf-renew-banner">
          <div>
            <strong>{member.name || "Member"}</strong>
            <span>
              {member.memberId || "—"}
              {member.expiryDate ? ` · Current expiry ${formatDate(member.expiryDate)}` : ""}
            </span>
          </div>
        </div>

        {error ? <div className="form-error sf-error">{error}</div> : null}

        <div className="sf-renew-summary">
          <div className="sf-renew-chip">
            <CalendarRange size={16} />
            <div>
              <small>Package period</small>
              <strong>{formatMembershipPeriod(startDate, expiryDate)}</strong>
              <span>
                {planName || "Select plan"}
                {plan ? ` · ${planDurationLabel(plan)}` : ""}
              </span>
            </div>
          </div>
          <div className="sf-renew-chip">
            <CreditCard size={16} />
            <div>
              <small>Payment date</small>
              <strong>{formatDate(today)}</strong>
              <span>{paymentMethod || "Select method"} · {currency(billingAmount)}</span>
            </div>
          </div>
        </div>

        <div className="sf-grid">
          <label className="sf-full">
            <span className="field-label">Membership Plan<i>*</i></span>
            <select required value={planName} onChange={(e) => setPlanName(e.target.value)}>
              <option value="" disabled>Select Membership Plan</option>
              {data.memberships.map((p) => (
                <option key={p._id || p.name} value={p.name}>
                  {p.name} — {currency(Number(p.price || 0))} / {planDurationLabel(p)}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="field-label">Renew Start Date<i>*</i></span>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <small className="sf-help">
              {renewKind === "early" || renewKind === "expired"
                ? "Pre-filled from current expiry date so membership continues without gap."
                : "Starts from reactivation date."}
            </small>
          </label>

          <label>
            <span className="field-label">New Expiry Date</span>
            <input type="date" readOnly value={expiryDate} />
          </label>

          <label>
            <span className="field-label">Plan Price</span>
            <input type="number" readOnly value={planPrice} />
          </label>

          <label>
            <span className="field-label">Discount</span>
            <input type="number" min={0} value={discount} onChange={(e) => setDiscount(e.target.value)} />
          </label>

          <label>
            <span className="field-label">Billing Amount</span>
            <input type="number" readOnly value={billingAmount} />
          </label>

          <label>
            <span className="field-label">Payment Method<i>*</i></span>
            <select required value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="" disabled>Select Payment Method</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
            </select>
          </label>

          {showTrainer ? (
            <label>
              <span className="field-label">Assigned Trainer</span>
              <select value={assignedTrainer} onChange={(e) => setAssignedTrainer(e.target.value)}>
                <option value="">Select Trainer</option>
                {data.trainers.map((t) => (
                  <option key={t._id || t.name} value={t.name}>{t.name}</option>
                ))}
              </select>
            </label>
          ) : null}
        </div>

        <div className="sf-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <Button type="submit" variant="primary" disabled={pending}>
            {pending ? "Saving..." : "Renew & Create Invoice"}
          </Button>
        </div>
      </form>
    </div>
  );
}
