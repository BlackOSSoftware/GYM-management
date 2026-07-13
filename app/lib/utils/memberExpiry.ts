import type { AnyDoc } from "../types";

export type MemberExpiryStatus = "active" | "expired" | "expiring" | "expiringToday" | "inactive" | "unknown";
export type MembershipBadge = "active" | "expiringToday" | "expiringSoon" | "expired" | "inactive";
export type MemberSort = "newest" | "expiryAsc" | "expiryDesc" | "nameAsc" | "amountDesc";

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
  const recordStatus = String(member.status || "").toLowerCase();
  if (recordStatus === "inactive" || recordStatus === "frozen") return "inactive";

  const days = daysUntilExpiry(member.expiryDate);
  if (days === null) return "unknown";
  if (days < 0) return "expired";
  if (days === 0) return "expiringToday";
  if (days <= 10) return "expiring";
  return "active";
}

export function membershipBadge(member: AnyDoc): MembershipBadge {
  const status = memberExpiryStatus(member);
  if (status === "inactive") return "inactive";
  if (status === "expired") return "expired";
  if (status === "expiringToday") return "expiringToday";
  if (status === "expiring") return "expiringSoon";
  return "active";
}

export function membershipBadgeLabel(badge: MembershipBadge) {
  switch (badge) {
    case "expiringToday":
      return "Expires Today";
    case "expiringSoon":
      return "Expiring Soon";
    case "expired":
      return "Expired";
    case "inactive":
      return "Inactive";
    default:
      return "Active";
  }
}

export function sortMembers(members: AnyDoc[], sort: MemberSort = "newest") {
  const rows = [...members];
  rows.sort((a, b) => {
    if (sort === "nameAsc") return String(a.name || "").localeCompare(String(b.name || ""));
    if (sort === "amountDesc") return Number(b.billingAmount || 0) - Number(a.billingAmount || 0);
    if (sort === "expiryAsc" || sort === "expiryDesc") {
      const aTime = new Date(a.expiryDate || 0).getTime();
      const bTime = new Date(b.expiryDate || 0).getTime();
      return sort === "expiryAsc" ? aTime - bTime : bTime - aTime;
    }
    const aTime = new Date(a.createdAt || a.joiningDate || 0).getTime();
    const bTime = new Date(b.createdAt || b.joiningDate || 0).getTime();
    return bTime - aTime;
  });
  return rows;
}

export function sortMembersNewestFirst(members: AnyDoc[]) {
  return sortMembers(members, "newest");
}

export function filterMembersByExpiry(members: AnyDoc[], filter: string) {
  if (!filter || filter === "all") return members;
  return members.filter((m) => {
    const status = memberExpiryStatus(m);
    if (filter === "expired") return status === "expired";
    if (filter === "expiring") return status === "expiring" || status === "expiringToday";
    if (filter === "expiringToday") return status === "expiringToday";
    if (filter === "active") return status === "active";
    if (filter === "inactive") return status === "inactive";
    return true;
  });
}

export function memberStats(members: AnyDoc[]) {
  const total = members.length;
  const active = filterMembersByExpiry(members, "active").length;
  const expiringToday = filterMembersByExpiry(members, "expiringToday").length;
  const expired = filterMembersByExpiry(members, "expired").length;
  const revenue = members.reduce((sum, m) => sum + Number(m.billingAmount || m.planPrice || 0), 0);
  return { total, active, expiringToday, expired, revenue };
}

export function avatarInitials(name?: string) {
  const parts = String(name || "?").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function formatPhoneDisplay(mobile?: string) {
  if (!mobile) return "";
  const digits = mobile.replace(/\D/g, "");
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return mobile;
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

export function smartMemberMessage(member: AnyDoc) {
  const name = member.name || "Member";
  const status = memberExpiryStatus(member);
  const days = daysUntilExpiry(member.expiryDate);
  if (status === "expired") return expiredMemberMessage(name);
  if ((status === "expiring" || status === "expiringToday") && days !== null) {
    return expiringMemberMessage(name, Math.max(0, days));
  }
  return `Hi ${name}, hope you're enjoying your workouts at our gym! Keep pushing — consistency is the key to results. 💪`;
}

export function memberSearchText(member: AnyDoc) {
  return [member.name, member.mobile, member.memberId, member.email, member.membershipPlan, member.status]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
