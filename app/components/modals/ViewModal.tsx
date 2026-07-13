"use client";

import { moduleTitles, type ModuleKey } from "../../lib/config/nav";
import type { AnyDoc, AppData } from "../../lib/types";
import { formatValue, label } from "../../lib/utils/format";
import MemberProfileView from "./MemberProfileView";
import MembershipProfileView from "./MembershipProfileView";
import TrainerProfileView from "./TrainerProfileView";
import StaffProfileView from "./StaffProfileView";
import PaymentProfileView from "./PaymentProfileView";
import WorkoutProfileView from "./WorkoutProfileView";
import DietProfileView from "./DietProfileView";
import EquipmentProfileView from "./EquipmentProfileView";

type Props = {
  viewing: { collection: string; record: AnyDoc };
  data: AppData;
  onClose: () => void;
  onEdit: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onDeactivate?: () => void;
};

export default function ViewModal({
  viewing,
  data,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
  onDeactivate
}: Props) {
  const { collection, record } = viewing;

  if (collection === "members") {
    return <MemberProfileView record={record} data={data} onClose={onClose} onEdit={onEdit} />;
  }

  if (collection === "memberships") {
    return (
      <MembershipProfileView
        record={record}
        members={data.members}
        onClose={onClose}
        onEdit={onEdit}
        onDuplicate={() => onDuplicate?.()}
        onDelete={() => onDelete?.()}
      />
    );
  }

  if (collection === "trainers") {
    return (
      <TrainerProfileView
        record={record}
        members={data.members}
        onClose={onClose}
        onEdit={onEdit}
        onDelete={() => onDelete?.()}
        onDeactivate={() => onDeactivate?.()}
      />
    );
  }

  if (collection === "staff") {
    return (
      <StaffProfileView
        record={record}
        onClose={onClose}
        onEdit={onEdit}
        onDelete={() => onDelete?.()}
        onDeactivate={() => onDeactivate?.()}
      />
    );
  }

  if (collection === "payments") {
    return (
      <PaymentProfileView
        record={record}
        data={data}
        onClose={onClose}
        onEdit={onEdit}
      />
    );
  }

  if (collection === "workouts") {
    return (
      <WorkoutProfileView
        record={record}
        data={data}
        onClose={onClose}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );
  }

  if (collection === "diets") {
    return (
      <DietProfileView
        record={record}
        data={data}
        onClose={onClose}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );
  }

  if (collection === "equipment") {
    return (
      <EquipmentProfileView
        record={record}
        onClose={onClose}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );
  }

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
          {Object.entries(record)
            .filter(([key]) => !["_id", "passwordHash", "_convertFromVisitorId"].includes(key))
            .map(([key, value]) => (
              <div key={key}><small>{label(key)}</small><span>{formatValue(value, key)}</span></div>
            ))}
        </div>
        <div className="modal-actions">
          <button type="button" onClick={onClose}>Close</button>
          <button className="primary-btn" type="button" onClick={onEdit}>Edit</button>
        </div>
      </section>
    </div>
  );
}
