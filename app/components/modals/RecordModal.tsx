"use client";

import { useEffect, useMemo, useState } from "react";
import type { SelectOption } from "../../lib/config/fields";
import { fieldsFor } from "../../lib/config/fields";
import type { AnyDoc, AppData } from "../../lib/types";
import { fetchNextMemberId, saveRecordApi } from "../../lib/api/client";
import { label } from "../../lib/utils/format";
import { calculateExpiryFromPlan, planIncludesTrainer } from "../../lib/utils/membership";

type Props = {
  editing: { collection: string; record?: AnyDoc };
  data: AppData;
  onClose: () => void;
  onSaved: () => Promise<void>;
};

function optionValue(option: SelectOption) {
  return typeof option === "string" ? option : option.value;
}

function optionLabel(option: SelectOption) {
  return typeof option === "string" ? option : option.label;
}

export default function RecordModal({ editing, data, onClose, onSaved }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const isNewMember = editing.collection === "members" && !editing.record?._id;

  const buildInitial = (memberId = "") => {
    const config = fieldsFor(editing.collection, data, editing.record || {});
    const record = editing.record || {};
    const out: Record<string, any> = {};
    for (const field of config) out[field.name] = record[field.name] ?? "";

    if (editing.collection === "members") {
      out.joiningDate ||= today;
      out.startDate ||= today;
      out.status ||= "Active";
      if (memberId) out.memberId = memberId;
      const plan = data.memberships.find((p) => p.name === out.membershipPlan) || data.memberships[0];
      if (!out.membershipPlan && plan) out.membershipPlan = plan.name;
      if (plan) {
        out.planPrice = Number(plan.price || 0);
        out.billingAmount = Math.max(0, Number(plan.price || 0) - Number(out.discount || 0));
        if (out.startDate) out.expiryDate = calculateExpiryFromPlan(out.startDate, plan);
        if (!planIncludesTrainer(plan)) out.assignedTrainer = "";
      }
    }
    if (editing.collection === "memberships") {
      out.durationType ||= record.durationType || (record.durationDays ? "Days" : "Days");
      out.durationValue ||= record.durationValue ?? record.durationDays ?? "";
      out.trainerIncluded ||= record.trainerIncluded || "Without Trainer";
      out.status ||= "Active";
    }
    if (editing.collection === "visitors") {
      out.visitDate ||= today;
      out.status ||= "New";
    }
    if (editing.collection === "payments") out.paymentDate ||= today;
    return out;
  };

  const [values, setValues] = useState<Record<string, any>>(() => buildInitial());
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const config = useMemo(() => fieldsFor(editing.collection, data, values), [editing.collection, data, values]);

  useEffect(() => {
    if (!isNewMember) {
      setValues(buildInitial());
      return;
    }
    let cancelled = false;
    fetchNextMemberId()
      .then((memberId) => { if (!cancelled) setValues(buildInitial(memberId)); })
      .catch(() => { if (!cancelled) setValues(buildInitial()); });
    return () => { cancelled = true; };
  }, [editing.collection, editing.record?._id]);

  const changeValue = (name: string, value: string) => {
    setValues((current) => {
      const next = { ...current, [name]: value };
      if (editing.collection === "members") {
        const plan = data.memberships.find((p) => p.name === (name === "membershipPlan" ? value : next.membershipPlan));
        if (plan) {
          next.planPrice = Number(plan.price || 0);
          next.billingAmount = Math.max(0, Number(plan.price || 0) - Number(next.discount || 0));
          if (next.startDate) next.expiryDate = calculateExpiryFromPlan(next.startDate, plan);
          if (!planIncludesTrainer(plan)) next.assignedTrainer = "";
        }
        if (name === "startDate" && next.membershipPlan) {
          const p = data.memberships.find((m) => m.name === next.membershipPlan);
          if (p) next.expiryDate = calculateExpiryFromPlan(value, p);
        }
      }
      if (editing.collection === "payments" && name === "memberName") {
        const member = data.members.find((m) => m.name === value);
        if (member) next.amount = Number(member.billingAmount || member.planPrice || 0);
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const payload = { ...values };
      if (isNewMember && !payload.memberId) delete payload.memberId;
      await saveRecordApi({
        collection: editing.collection,
        _id: editing.record?._id || "",
        ...payload
      });
      await onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Record save failed");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={handleSubmit}>
        <div className="modal-head">
          <h2>{editing.record?._id ? "Edit" : "Add"} {label(editing.collection)}</h2>
          <button type="button" onClick={onClose}>x</button>
        </div>
        {error ? <div className="form-error">{error}</div> : null}
        <div className="form-grid">
          {config.map((f) => (
            <label key={f.name}>
              <span className="field-label">{f.label}{f.required ? <i>*</i> : null}</span>
              {f.options ? (
                <select name={f.name} required={f.required} value={values[f.name] ?? ""} onChange={(e) => changeValue(f.name, e.target.value)}>
                  <option value="" disabled={f.required}>Select {f.label}</option>
                  {f.options.filter(Boolean).map((o) => <option key={optionValue(o)} value={optionValue(o)}>{optionLabel(o)}</option>)}
                </select>
              ) : (
                <input
                  name={f.name}
                  type={f.type || "text"}
                  required={f.required && !f.readOnly}
                  readOnly={f.readOnly}
                  placeholder={f.placeholder}
                  min={f.type === "number" ? 0 : undefined}
                  pattern={f.name === "mobile" ? "[0-9+\\-\\s]{8,15}" : undefined}
                  value={values[f.name] ?? ""}
                  onChange={(e) => changeValue(f.name, e.target.value)}
                />
              )}
            </label>
          ))}
        </div>
        <div className="modal-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button className="primary-btn" disabled={pending}>{pending ? "Saving..." : "Save Record"}</button>
        </div>
      </form>
    </div>
  );
}
