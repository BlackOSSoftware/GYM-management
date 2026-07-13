import type { AnyDoc } from "../types";

export type MemberExpiryStatus = "active" | "expired" | "expiring" | "unknown";

export function daysUntilExpiry(expiryDate?: string) {
  if (!expiryDate) return null;
  const end = new Date(expiryDate);
  if (Number.isNaN(end.getTime())) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - now.getTime()) / 86400000);
}

export function memberExpiryStatus(member: AnyDoc): MemberExpiryStatus {
  const days = daysUntilExpiry(member.expiryDate);
  if (days === null) return "unknown";
  if (days < 0) return "expired";
  if (days <= 10) return "expiring";
  return "active";
}

export function sortMembersNewestFirst(members: AnyDoc[]) {
  return [...members].sort((a, b) => {
    const aTime = new Date(a.createdAt || a.joiningDate || 0).getTime();
    const bTime = new Date(b.createdAt || b.joiningDate || 0).getTime();
    return bTime - aTime;
  });
}

export function filterMembersByExpiry(members: AnyDoc[], filter: string) {
  if (!filter || filter === "all") return members;
  return members.filter((m) => {
    const status = memberExpiryStatus(m);
    if (filter === "expired") return status === "expired";
    if (filter === "expiring") return status === "expiring";
    if (filter === "active") return status === "active";
    return true;
  });
}

export function whatsappPhone(mobile?: string) {
  if (!mobile) return "";
  const digits = mobile.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits;
}

export function whatsappUrl(mobile: string | undefined, message: string) {
  const phone = whatsappPhone(mobile);
  if (!phone) return "";
  const text = encodeURIComponent(message);
  return `https://wa.me/${phone}${message ? `?text=${text}` : ""}`;
}

export function expiredMemberMessage(name: string, gymName = "our gym") {
  return `Hi ${name}, your membership at ${gymName} has expired. Don't let your hard work fade — renew today and come back stronger! 💪 Train harder, feel better, live healthier. Reply here to renew your membership.`;
}

export function expiringMemberMessage(name: string, days: number, gymName = "our gym") {
  const dayLabel = days === 1 ? "1 day" : `${days} days`;
  return `Hi ${name}, only ${dayLabel} remaining on your ${gymName} membership! ⏳ Renew now and keep your momentum alive. Your goals are closer than you think — let's crush them together! 🔥`;
}

export function memberSearchText(member: AnyDoc) {
  return [member.name, member.mobile, member.memberId, member.email, member.membershipPlan, member.status]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
