import type { AnyDoc } from "../types";

export function planDurationLabel(plan: AnyDoc | Record<string, any>) {
  const type = plan.durationType || "Days";
  const value = Number(plan.durationValue ?? plan.durationDays ?? 0);
  if (type === "Months") return `${value} Month${value === 1 ? "" : "s"}`;
  return `${value} Day${value === 1 ? "" : "s"}`;
}

export function planIncludesTrainer(plan: AnyDoc | Record<string, any>) {
  return (plan.trainerIncluded || "Without Trainer") === "With Trainer";
}

export function calculateExpiryFromPlan(startDate: string, plan: AnyDoc | Record<string, any>) {
  const type = plan.durationType || "Days";
  const value = Number(plan.durationValue ?? plan.durationDays ?? 30);
  const date = new Date(startDate);
  if (Number.isNaN(date.getTime())) return "";

  if (type === "Months") {
    date.setMonth(date.getMonth() + value);
    return date.toISOString().slice(0, 10);
  }

  date.setDate(date.getDate() + value);
  return date.toISOString().slice(0, 10);
}

export function normalizeMembershipPlan(plan: AnyDoc | Record<string, any>) {
  const durationType = plan.durationType || "Days";
  const durationValue = Number(plan.durationValue ?? plan.durationDays ?? 30);
  return { durationType, durationValue };
}

export function previewMemberId(memberCount: number) {
  return `M-${String(1001 + memberCount).padStart(4, "0")}`;
}
