"use client";

import { AlertTriangle, CheckCircle2, Pencil, Trash2, Wrench, X } from "lucide-react";
import type { AnyDoc } from "../../lib/types";
import { currency, formatDate } from "../../lib/utils/format";

type Props = {
  record: AnyDoc;
  onClose: () => void;
  onEdit: () => void;
  onDelete?: () => void;
};

export default function EquipmentProfileView({ record, onClose, onEdit, onDelete }: Props) {
  const avail = String(record.availability || "").toLowerCase();
  const availCls =
    avail.includes("available") ? "on" :
    avail.includes("maintenance") ? "warn" :
    avail.includes("damaged") || avail.includes("use") ? "off" : "";

  const condition = String(record.condition || "").toLowerCase();
  const conditionCls =
    condition.includes("excellent") || condition === "good" ? "on" :
    condition.includes("service") ? "warn" :
    condition.includes("damaged") ? "off" : "";

  return (
    <div className="modal-backdrop ops-profile-backdrop">
      <section className="ops-profile-modal" role="dialog" aria-modal="true" aria-label="Equipment">
        <div className="ops-profile-hero equipment">
          <button type="button" className="ops-profile-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
          <div className="ops-profile-top">
            <div className="ops-profile-ico equipment"><Wrench size={22} /></div>
            <div>
              <span className={`ops-status ${availCls}`}>{record.availability || "—"}</span>
              <h2>{record.name || "Equipment"}</h2>
              <p>{record.category || "Equipment"} · {record.condition || "—"}</p>
            </div>
            <div className="ops-profile-aside">
              <small>Cost</small>
              <strong>{record.purchaseCost ? currency(Number(record.purchaseCost)) : "—"}</strong>
            </div>
          </div>

          <div className="ops-profile-pills">
            <div>
              <small>Condition</small>
              <strong className={conditionCls || undefined}>{record.condition || "—"}</strong>
            </div>
            <div>
              <small>Next service</small>
              <strong>{formatDate(record.maintenanceDate)}</strong>
            </div>
            <div>
              <small>Status</small>
              <strong>{record.status || "—"}</strong>
            </div>
          </div>
        </div>

        <div className="ops-profile-body">
          <section className="ops-profile-card">
            <h3>Equipment details</h3>
            <div className="ops-profile-grid">
              <div><span>Name</span><b>{record.name || "—"}</b></div>
              <div><span>Category</span><b>{record.category || "—"}</b></div>
              <div><span>Condition</span><b>{record.condition || "—"}</b></div>
              <div><span>Availability</span><b>{record.availability || "—"}</b></div>
              <div><span>Vendor</span><b>{record.vendor || "—"}</b></div>
              <div><span>Purchase cost</span><b>{record.purchaseCost ? currency(Number(record.purchaseCost)) : "—"}</b></div>
              <div><span>Purchase date</span><b>{formatDate(record.purchaseDate)}</b></div>
              <div><span>Next maintenance</span><b>{formatDate(record.maintenanceDate)}</b></div>
            </div>
          </section>

          <section className="ops-profile-card">
            <h3>Service & status</h3>
            <div className="ops-meal-stack">
              <div className="ops-meal-block">
                <div className={`ops-meal-ico ${availCls === "on" ? "diet" : availCls === "warn" ? "warn" : "equip"}`}>
                  {availCls === "on" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                </div>
                <div>
                  <small>Availability</small>
                  <p>{record.availability || "Not set"}</p>
                </div>
              </div>
              {record.serviceHistory ? (
                <div className="ops-note-block">
                  <small>Service / repair records</small>
                  <p>{record.serviceHistory}</p>
                </div>
              ) : (
                <p className="ops-profile-empty">No service history recorded.</p>
              )}
            </div>
          </section>
        </div>

        <div className="ops-profile-actions">
          <button type="button" className="ops-pbtn ghost" onClick={onClose}>Close</button>
          {onDelete ? (
            <button type="button" className="ops-pbtn danger" onClick={onDelete}><Trash2 size={14} /> Delete</button>
          ) : null}
          <button type="button" className="ops-pbtn primary" onClick={onEdit}><Pencil size={14} /> Edit</button>
        </div>
      </section>
    </div>
  );
}
