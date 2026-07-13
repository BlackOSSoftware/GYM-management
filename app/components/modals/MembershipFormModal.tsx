"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { AnyDoc } from "../../lib/types";
import { saveRecordApi } from "../../lib/api/client";

type Props = {
  record?: AnyDoc;
  onClose: () => void;
  onSaved: () => Promise<void>;
};

type FormState = {
  name: string;
  description: string;
  durationType: string;
  durationValue: string;
  price: string;
  trainerIncluded: string;
  status: string;
};

function buildInitial(record?: AnyDoc): FormState {
  return {
    name: String(record?.name || ""),
    description: String(record?.description || ""),
    durationType: String(record?.durationType || (record?.durationDays ? "Days" : "Months")),
    durationValue: String(record?.durationValue ?? record?.durationDays ?? ""),
    price: record?.price != null && record?.price !== "" ? String(record.price) : "",
    trainerIncluded: String(record?.trainerIncluded || "Without Trainer"),
    status: String(record?.status || "Active")
  };
}

export default function MembershipFormModal({ record, onClose, onSaved }: Props) {
  const isEdit = Boolean(record?._id);
  const [values, setValues] = useState<FormState>(() => buildInitial(record));
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setValues(buildInitial(record));
    setError("");
  }, [record?._id]);

  const change = (name: keyof FormState, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      if (!values.name.trim()) throw new Error("Plan name is required");
      if (!values.durationType) throw new Error("Duration type is required");
      if (!values.durationValue || Number(values.durationValue) <= 0) throw new Error("Duration value must be greater than 0");
      if (values.price === "" || Number(values.price) < 0) throw new Error("Enter a valid price");

      await saveRecordApi({
        collection: "memberships",
        _id: record?._id || "",
        name: values.name.trim(),
        description: values.description.trim(),
        durationType: values.durationType,
        durationValue: Number(values.durationValue),
        price: Number(values.price),
        trainerIncluded: values.trainerIncluded,
        status: values.status
      });
      await onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to save membership");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="modal-backdrop sf-backdrop">
      <form className="sf-modal" onSubmit={handleSubmit}>
        <div className="sf-head">
          <div>
            <h2>{isEdit ? "Edit Membership" : "Add Membership"}</h2>
            <p>Simple plan details — fill and save</p>
          </div>
          <button type="button" className="sf-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        {error ? <div className="form-error sf-error">{error}</div> : null}
        <div className="sf-grid">
          <label className="sf-full">
            <span className="field-label">Plan Name <i>*</i></span>
            <input value={values.name} onChange={(e) => change("name", e.target.value)} placeholder="e.g. Monthly Membership" required />
          </label>
          <label className="sf-full">
            <span className="field-label">Description</span>
            <input value={values.description} onChange={(e) => change("description", e.target.value)} placeholder="Optional" />
          </label>
          <label>
            <span className="field-label">Duration Type <i>*</i></span>
            <select value={values.durationType} onChange={(e) => change("durationType", e.target.value)} required>
              <option value="Days">Days</option>
              <option value="Months">Months</option>
            </select>
          </label>
          <label>
            <span className="field-label">Duration Value <i>*</i></span>
            <input type="number" min={1} value={values.durationValue} onChange={(e) => change("durationValue", e.target.value)} placeholder="30" required />
          </label>
          <label>
            <span className="field-label">Price (₹) <i>*</i></span>
            <input type="number" min={0} value={values.price} onChange={(e) => change("price", e.target.value)} placeholder="3000" required />
          </label>
          <label>
            <span className="field-label">Trainer <i>*</i></span>
            <select value={values.trainerIncluded} onChange={(e) => change("trainerIncluded", e.target.value)} required>
              <option value="Without Trainer">Without Trainer</option>
              <option value="With Trainer">With Trainer</option>
            </select>
          </label>
          <label>
            <span className="field-label">Status <i>*</i></span>
            <select value={values.status} onChange={(e) => change("status", e.target.value)} required>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>
        </div>
        <div className="sf-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button className="primary-btn" disabled={pending}>{pending ? "Saving..." : "Save"}</button>
        </div>
      </form>
    </div>
  );
}
