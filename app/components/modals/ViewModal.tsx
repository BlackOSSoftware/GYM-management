"use client";

import { moduleTitles, type ModuleKey } from "../../lib/config/nav";
import type { AnyDoc, AppData } from "../../lib/types";
import { currency, formatValue, label } from "../../lib/utils/format";
import Panel from "../ui/Panel";

type Props = {
  viewing: { collection: string; record: AnyDoc };
  data: AppData;
  onClose: () => void;
  onEdit: () => void;
};

function DetailBlock({ row, keys }: { row: AnyDoc; keys: string[] }) {
  return (
    <div className="detail-block">
      {keys.map((key) => (
        <p key={key}><small>{label(key)}</small><span>{formatValue(row[key], key)}</span></p>
      ))}
    </div>
  );
}

export default function ViewModal({ viewing, data, onClose, onEdit }: Props) {
  const { collection, record } = viewing;
  const memberPayments = collection === "members" ? data.payments.filter((p) => p.memberName === record.name || p.memberId === record.memberId) : [];
  const trainer = collection === "members" ? data.trainers.find((t) => t.name === record.assignedTrainer) : null;
  const workout = collection === "members" ? data.workouts.find((w) => w.name === record.workoutPlan) : null;
  const diet = collection === "members" ? data.diets.find((d) => d.name === record.dietPlan) : null;

  return (
    <div className="modal-backdrop">
      <section className="modal view-modal">
        <div className="modal-head">
          <h2>{record.name || record.memberName || record.invoiceNo || label(collection)}</h2>
          <button type="button" onClick={onClose}>x</button>
        </div>
        <div className="profile-top">
          <div className="profile-avatar">{(record.name || record.memberName || "G").slice(0, 1)}</div>
          <div>
            <h3>{record.name || record.memberName || record.invoiceNo}</h3>
            <p>{moduleTitles[collection as ModuleKey]} • {record.status || "Active"}</p>
          </div>
        </div>
        <div className="detail-grid">
          {Object.entries(record).filter(([key]) => !["_id", "passwordHash"].includes(key)).map(([key, value]) => (
            <div key={key}><small>{label(key)}</small><span>{formatValue(value, key)}</span></div>
          ))}
        </div>
        {collection === "members" ? (
          <div className="linked-grid">
            <Panel title="Assigned Trainer">{trainer ? <DetailBlock row={trainer} keys={["name", "mobile", "specialization", "experience"]} /> : <p>No trainer assigned</p>}</Panel>
            <Panel title="Workout Plan">{workout ? <DetailBlock row={workout} keys={["name", "category", "exerciseName", "duration"]} /> : <p>No workout assigned</p>}</Panel>
            <Panel title="Diet Plan">{diet ? <DetailBlock row={diet} keys={["name", "category", "breakfast", "lunch", "dinner"]} /> : <p>No diet assigned</p>}</Panel>
            <Panel title="Payment History">
              {memberPayments.length ? (
                <div className="compact-list">
                  {memberPayments.map((p) => (
                    <div key={p._id}><b>{p.invoiceNo}</b><span>{currency(Number(p.amount || 0))}</span><small>{p.paymentDate}</small></div>
                  ))}
                </div>
              ) : <p>No payment recorded</p>}
            </Panel>
          </div>
        ) : null}
        <div className="modal-actions">
          <button type="button" onClick={onClose}>Close</button>
          <button className="primary-btn" type="button" onClick={onEdit}>Edit</button>
        </div>
      </section>
    </div>
  );
}
