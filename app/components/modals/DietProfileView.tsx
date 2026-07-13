"use client";

import type { ReactNode } from "react";
import { Apple, Coffee, Moon, Pencil, Sun, Trash2, Cookie, X } from "lucide-react";
import type { AnyDoc, AppData } from "../../lib/types";

type Props = {
  record: AnyDoc;
  data: AppData;
  onClose: () => void;
  onEdit: () => void;
  onDelete?: () => void;
};

function MealRow({
  icon,
  label,
  value
}: {
  icon: ReactNode;
  label: string;
  value?: string;
}) {
  if (!value) return null;
  return (
    <div className="ops-meal-block">
      <div className="ops-meal-ico diet">{icon}</div>
      <div>
        <small>{label}</small>
        <p>{value}</p>
      </div>
    </div>
  );
}

export default function DietProfileView({ record, data, onClose, onEdit, onDelete }: Props) {
  const status = String(record.status || "").toLowerCase();
  const statusCls = status === "active" ? "on" : "off";
  const assigned = data.members.filter((m) => m.dietPlan && m.dietPlan === record.name).length;
  const meals = [record.breakfast, record.lunch, record.dinner, record.snacks].filter(Boolean).length;

  return (
    <div className="modal-backdrop ops-profile-backdrop">
      <section className="ops-profile-modal" role="dialog" aria-modal="true" aria-label="Diet plan">
        <div className="ops-profile-hero diet">
          <button type="button" className="ops-profile-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
          <div className="ops-profile-top">
            <div className="ops-profile-ico diet"><Apple size={22} /></div>
            <div>
              <span className={`ops-status ${statusCls}`}>{record.status || "—"}</span>
              <h2>{record.name || "Diet plan"}</h2>
              <p>{record.category || "Template"} · {assigned} member{assigned === 1 ? "" : "s"} assigned</p>
            </div>
            <div className="ops-profile-aside">
              <small>Meals</small>
              <strong>{meals || "—"}</strong>
            </div>
          </div>

          <div className="ops-profile-pills">
            <div><small>Template</small><strong>{record.category || "—"}</strong></div>
            <div><small>Status</small><strong>{record.status || "—"}</strong></div>
            <div><small>Assigned</small><strong>{assigned}</strong></div>
          </div>
        </div>

        <div className="ops-profile-body">
          <section className="ops-profile-card">
            <h3>Daily meals</h3>
            <div className="ops-meal-stack">
              <MealRow icon={<Coffee size={16} />} label="Breakfast" value={record.breakfast} />
              <MealRow icon={<Sun size={16} />} label="Lunch" value={record.lunch} />
              <MealRow icon={<Moon size={16} />} label="Dinner" value={record.dinner} />
              <MealRow icon={<Cookie size={16} />} label="Snacks" value={record.snacks} />
              {!meals ? <p className="ops-profile-empty">No meals added yet.</p> : null}
            </div>
          </section>

          {(record.supplements || record.notes || record.recommendations) ? (
            <section className="ops-profile-card">
              <h3>Nutrition & notes</h3>
              {record.supplements ? (
                <div className="ops-note-block">
                  <small>Supplements</small>
                  <p>{record.supplements}</p>
                </div>
              ) : null}
              {record.notes ? (
                <div className="ops-note-block">
                  <small>Nutrition notes</small>
                  <p>{record.notes}</p>
                </div>
              ) : null}
              {record.recommendations ? (
                <div className="ops-note-block">
                  <small>Trainer recommendations</small>
                  <p>{record.recommendations}</p>
                </div>
              ) : null}
            </section>
          ) : null}
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
