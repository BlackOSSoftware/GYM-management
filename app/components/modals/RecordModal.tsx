"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import type { SelectOption } from "../../lib/config/fields";
import { fieldsFor } from "../../lib/config/fields";
import type { AnyDoc, AppData } from "../../lib/types";
import { fetchNextMemberId, fetchNextVisitorId, saveRecordApi } from "../../lib/api/client";
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
  const isNewVisitor = editing.collection === "visitors" && !editing.record?._id;
  const isSimpleForm = ["members", "visitors", "trainers", "staff", "payments", "workouts", "diets", "equipment"].includes(editing.collection);
  const convertFromVisitorId =
    editing.collection === "members" && editing.record?._convertFromVisitorId
      ? String(editing.record._convertFromVisitorId)
      : "";
  const needsPayment =
    editing.collection === "members" && (isNewMember || Boolean(convertFromVisitorId));

  const buildInitial = (autoId = "") => {
    const config = fieldsFor(editing.collection, data, editing.record || {});
    const record = editing.record || {};
    const out: Record<string, any> = {};
    for (const field of config) out[field.name] = record[field.name] ?? "";

    if (editing.collection === "members") {
      out.joiningDate ||= today;
      out.startDate ||= today;
      out.status ||= "Active";
      if (autoId) out.memberId = autoId;
      if (needsPayment) out.paymentMethod = record.paymentMethod || "";
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
      if (autoId) out.visitorId = autoId;
    }
    if (editing.collection === "payments") {
      out.paymentDate ||= today;
      out.status ||= "Paid";
      out.type ||= "Membership";
      out.method ||= "Cash";
    }
    if (editing.collection === "staff") {
      out.joiningDate ||= today;
      out.status ||= "Active";
    }
    if (editing.collection === "workouts" || editing.collection === "diets") {
      out.status ||= "Active";
    }
    if (editing.collection === "equipment") {
      out.status ||= "Active";
      out.availability ||= "Available";
      out.condition ||= "Good";
    }
    return out;
  };

  const [values, setValues] = useState<Record<string, any>>(() => buildInitial());
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const config = useMemo(() => fieldsFor(editing.collection, data, values), [editing.collection, data, values]);

  useEffect(() => {
    if (!isNewMember && !isNewVisitor) {
      setValues(buildInitial());
      return;
    }
    let cancelled = false;
    const load = isNewMember ? fetchNextMemberId : fetchNextVisitorId;
    load()
      .then((id) => { if (!cancelled) setValues(buildInitial(id)); })
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
      const paymentMethod = String(payload.paymentMethod || "").trim();

      delete payload._convertFromVisitorId;
      delete payload._renewMode;
      delete payload._renewKind;
      delete payload.paymentMethod;

      if (needsPayment && !paymentMethod) {
        throw new Error("Please select a payment method (Cash / UPI / Card)");
      }

      if (isNewMember && !payload.memberId) delete payload.memberId;
      if (isNewVisitor && !payload.visitorId) delete payload.visitorId;

      await saveRecordApi({
        collection: editing.collection,
        _id: editing.record?._id || "",
        ...payload
      });

      if (editing.collection === "members" && paymentMethod) {
        await saveRecordApi({
          collection: "payments",
          memberName: payload.name,
          memberId: payload.memberId || editing.record?.memberId || "",
          amount: Number(payload.billingAmount || payload.planPrice || 0),
          method: paymentMethod,
          type: "Membership",
          status: "Paid",
          paymentDate: today,
          membershipPlan: payload.membershipPlan || "",
          membershipStart: payload.startDate || "",
          membershipEnd: payload.expiryDate || "",
          notes: convertFromVisitorId
            ? `Converted visitor — ${payload.membershipPlan || "plan"}`
            : `New membership — ${payload.membershipPlan || "plan"}`
        });
      }

      if (convertFromVisitorId) {
        const visitor = data.visitors.find((v) => String(v._id) === String(convertFromVisitorId));
        await saveRecordApi({
          collection: "visitors",
          _id: String(convertFromVisitorId),
          name: visitor?.name || payload.name,
          mobile: visitor?.mobile || payload.mobile,
          visitDate: visitor?.visitDate || new Date().toISOString().slice(0, 10),
          visitorId: visitor?.visitorId,
          email: visitor?.email,
          gender: visitor?.gender,
          source: visitor?.source,
          interest: visitor?.interest,
          preferredPlan: visitor?.preferredPlan || payload.membershipPlan,
          preferredTrainer: visitor?.preferredTrainer,
          followUpDate: visitor?.followUpDate,
          remarks: visitor?.remarks,
          status: "Converted"
        });
      }

      await onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Record save failed");
    } finally {
      setPending(false);
    }
  };

  const title =
    editing.collection === "members" && convertFromVisitorId
      ? "Convert Visitor"
      : `${editing.record?._id ? "Edit" : "Add"} ${label(editing.collection)}`;

  const subtitle =
    editing.collection === "members" && (isNewMember || convertFromVisitorId)
      ? "Select plan & payment method — invoice will be created on save"
      : editing.collection === "payments"
        ? "Record payment / invoice details"
        : editing.collection === "visitors"
          ? "Fill visitor details below"
          : editing.collection === "trainers"
            ? "Fill trainer details below"
            : editing.collection === "staff"
              ? "Fill staff details below"
              : editing.collection === "workouts"
                ? "Fill workout plan details"
                : editing.collection === "diets"
                  ? "Fill diet plan meals & notes"
                  : editing.collection === "equipment"
                    ? "Fill equipment details"
                    : "Fill details below";

  const renderField = (f: ReturnType<typeof fieldsFor>[number]) => (
    <label
      key={f.name}
      className={
        ["address", "remarks", "description", "notes", "instructions", "trainerNotes", "serviceHistory", "recommendations", "exerciseName", "breakfast", "lunch", "dinner", "snacks"].includes(f.name)
          ? "sf-full"
          : undefined
      }
    >
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
  );

  if (isSimpleForm) {
    return (
      <div className="modal-backdrop sf-backdrop">
        <form className="sf-modal" onSubmit={handleSubmit}>
          <div className="sf-head">
            <div>
              <h2>{title}</h2>
              <p>{subtitle}</p>
            </div>
            <button type="button" className="sf-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
          </div>
          {error ? <div className="form-error sf-error">{error}</div> : null}
          <div className="sf-grid">{config.map(renderField)}</div>
          <div className="sf-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button className="primary-btn" disabled={pending}>
              {pending ? "Saving..." : needsPayment ? "Save & Create Invoice" : "Save"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={handleSubmit}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button type="button" onClick={onClose}>x</button>
        </div>
        {error ? <div className="form-error">{error}</div> : null}
        <div className="form-grid">{config.map(renderField)}</div>
        <div className="modal-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button className="primary-btn" disabled={pending}>{pending ? "Saving..." : "Save Record"}</button>
        </div>
      </form>
    </div>
  );
}
