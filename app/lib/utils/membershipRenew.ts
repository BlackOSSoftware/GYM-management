import type { AnyDoc } from "../types";
import { daysUntilExpiry, memberExpiryStatus } from "./memberExpiry";

export type RenewKind = "early" | "expired" | "inactive" | "default";

/** Compute renew start date + force Active status. */
export function renewMemberDefaults(member: AnyDoc) {
  const today = new Date().toISOString().slice(0, 10);
  const status = memberExpiryStatus(member);
  const days = daysUntilExpiry(member.expiryDate);

  let startDate = today;
  let kind: RenewKind = "default";

  if (status === "expired" && member.expiryDate) {
    // Continue from the day membership expired
    startDate = String(member.expiryDate).slice(0, 10);
    kind = "expired";
  } else if (status === "inactive") {
    // Reactivate from today
    startDate = today;
    kind = "inactive";
  } else if (days !== null && days >= 0 && member.expiryDate) {
    // Still running or expiring soon — renew starts from current expiry
    startDate = String(member.expiryDate).slice(0, 10);
    kind = "early";
  }

  return {
    ...member,
    startDate,
    status: "Active",
    membershipPlan: member.membershipPlan || "",
    _renewMode: true,
    _renewKind: kind,
    paymentMethod: ""
  };
}

export function renewKindLabel(kind?: RenewKind | string) {
  switch (kind) {
    case "early":
      return "Early renew — starts from current expiry date";
    case "expired":
      return "Expired — continues from previous expiry date";
    case "inactive":
      return "Inactive — reactivates from today";
    default:
      return "Membership renewal";
  }
}
