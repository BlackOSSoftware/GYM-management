"use client";

import { Dumbbell, Pencil, Trash2, X } from "lucide-react";
import type { AnyDoc, AppData } from "../../lib/types";

type Props = {
  record: AnyDoc;
  data: AppData;
  onClose: () => void;
  onEdit: () => void;
  onDelete?: () => void;
};

export default function WorkoutProfileView({ record, data, onClose, onEdit, onDelete }: Props) {
  const status = String(record.status || "").toLowerCase();
  const statusCls = status === "active" ? "on" : "off";
  const assigned = data.members.filter((m) => m.workoutPlan && m.workoutPlan === record.name).length;

  return (
    <div className="modal-backdrop ops-profile-backdrop">
      <section className="ops-profile-modal" role="dialog" aria-modal="true" aria-label="Workout plan">
        <div className="ops-profile-hero workout">
          <button type="button" className="ops-profile-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
          <div className="ops-profile-top">
            <div className="ops-profile-ico workout"><Dumbbell size={22} /></div>
            <div>
              <span className={`ops-status ${statusCls}`}>{record.status || "—"}</span>
              <h2>{record.name || "Workout plan"}</h2>
              <p>{record.category || "Workout"} · {assigned} member{assigned === 1 ? "" : "s"} assigned</p>
            </div>
            <div className="ops-profile-aside">
              <small>Duration</small>
              <strong>{record.duration || "—"}</strong>
            </div>
          </div>

          <div className="ops-profile-pills">
            <div><small>Sets</small><strong>{record.sets || "—"}</strong></div>
            <div><small>Reps</small><strong>{record.repetitions || "—"}</strong></div>
            <div><small>Rest</small><strong>{record.restTime || "—"}</strong></div>
          </div>
        </div>

        <div className="ops-profile-body">
          <section className="ops-profile-card">
            <h3>Plan details</h3>
            <div className="ops-profile-grid">
              <div><span>Plan name</span><b>{record.name || "—"}</b></div>
              <div><span>Category</span><b>{record.category || "—"}</b></div>
              <div><span>Duration</span><b>{record.duration || "—"}</b></div>
              <div><span>Status</span><b>{record.status || "—"}</b></div>
            </div>
          </section>

          <section className="ops-profile-card">
            <h3>Exercises & structure</h3>
            <div className="ops-meal-block">
              <div className="ops-meal-ico"><Dumbbell size={16} /></div>
              <div>
                <small>Exercises</small>
                <p>{record.exerciseName || "No exercises listed"}</p>
              </div>
            </div>
            <div className="ops-profile-grid ops-profile-grid-tight">
              <div><span>Sets</span><b>{record.sets || "—"}</b></div>
              <div><span>Repetitions</span><b>{record.repetitions || "—"}</b></div>
              <div><span>Rest time</span><b>{record.restTime || "—"}</b></div>
              <div><span>Assigned members</span><b>{assigned}</b></div>
            </div>
          </section>

          {(record.instructions || record.trainerNotes) ? (
            <section className="ops-profile-card">
              <h3>Notes</h3>
              {record.instructions ? (
                <div className="ops-note-block">
                  <small>Instructions</small>
                  <p>{record.instructions}</p>
                </div>
              ) : null}
              {record.trainerNotes ? (
                <div className="ops-note-block">
                  <small>Trainer notes</small>
                  <p>{record.trainerNotes}</p>
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
