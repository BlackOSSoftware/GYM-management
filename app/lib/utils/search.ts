import type { AnyDoc } from "../types";
import type { ModuleKey } from "../config/nav";

export function searchableText(row: AnyDoc) {
  return Object.entries(row)
    .filter(([key]) => !["passwordHash"].includes(key))
    .map(([, value]) => String(value ?? ""))
    .join(" ")
    .toLowerCase();
}

export function searchAll(data: Record<string, AnyDoc[]>, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const collections: { key: ModuleKey; rows: AnyDoc[] }[] = [
    { key: "members", rows: data.members },
    { key: "visitors", rows: data.visitors },
    { key: "payments", rows: data.payments },
    { key: "trainers", rows: data.trainers },
    { key: "memberships", rows: data.memberships },
    { key: "workouts", rows: data.workouts },
    { key: "diets", rows: data.diets },
    { key: "equipment", rows: data.equipment },
    { key: "staff", rows: data.staff }
  ];
  return collections
    .flatMap(({ key, rows }) =>
      rows
        .filter((row) => searchableText(row).includes(q))
        .slice(0, 6)
        .map((row) => ({ key, row }))
    )
    .slice(0, 24);
}

export function memberFromVisitor(visitor: AnyDoc) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    name: visitor.name || "",
    mobile: visitor.mobile || "",
    email: visitor.email || "",
    gender: visitor.gender || "",
    address: visitor.address || "",
    membershipPlan: visitor.preferredPlan || "",
    assignedTrainer: visitor.preferredTrainer || "",
    joiningDate: today,
    startDate: today,
    status: "Active",
    discount: 0,
    _convertFromVisitorId: visitor._id ? String(visitor._id) : ""
  };
}
