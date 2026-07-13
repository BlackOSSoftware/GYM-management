import {
  Activity,
  Briefcase,
  CalendarClock,
  CalendarDays,
  ShieldCheck,
  UserCog,
  UserPlus,
  Users
} from "lucide-react";
import type { AppData } from "../types";
import { currency } from "./format";

export function buildStats(data: AppData) {
  const now = new Date();
  const inDays = (date?: string) => (date ? Math.ceil((new Date(date).getTime() - now.getTime()) / 86400000) : 9999);
  const activeMembers = data.members.filter((m) => m.status === "Active").length;
  const visitorFollowUps = data.visitors.filter((v) => v.status === "Follow Up" || v.followUpDate).length;
  const inactiveMembers = data.members.length - activeMembers;
  const expiredMemberships = data.members.filter((m) => inDays(m.expiryDate) < 0).length;
  const expiring30 = data.members.filter((m) => inDays(m.expiryDate) >= 0 && inDays(m.expiryDate) <= 30).length;
  const upcoming = data.members.filter((m) => inDays(m.expiryDate) >= 0).sort((a, b) => inDays(a.expiryDate) - inDays(b.expiryDate)).slice(0, 5);
  const paid = data.payments.filter((p) => p.status !== "Refunded");
  const monthRevenue = paid.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const pendingRevenue = data.payments.filter((p) => p.status === "Pending").reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const todayRevenue = paid.filter((p) => p.paymentDate === now.toISOString().slice(0, 10)).reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const activeMemberships = data.memberships.filter((m) => m.status === "Active").length || activeMembers;
  const total = Math.max(1, activeMembers + expiredMemberships + expiring30);

  return {
    activeMembers,
    inactiveMembers,
    expiredMemberships,
    expiring30,
    upcoming,
    monthRevenue,
    pendingRevenue,
    todayRevenue,
    activeMemberships,
    activePct: (activeMembers / total) * 100,
    expiringPct: (expiring30 / total) * 100,
    revenueBars: [12, 18, 42, 39, 68, 55, 48, 73, 86, 74, 79, 66, 92, 98],
    cards: [
      { label: "Total Members", value: data.members.length, sub: "All Members", icon: Users, color: "purple", target: "members" as const, filter: "" },
      { label: "Active Members", value: activeMembers, sub: "Active Members", icon: Users, color: "green", target: "members" as const, filter: "Active" },
      { label: "Inactive Members", value: inactiveMembers, sub: "Inactive Members", icon: UserCog, color: "orange", target: "members" as const, filter: "Inactive" },
      { label: "Total Visitors", value: data.visitors.length, sub: "All Enquiries", icon: UserPlus, color: "blue", target: "visitors" as const, filter: "" },
      { label: "Visitor Follow Ups", value: visitorFollowUps, sub: "Needs Follow Up", icon: CalendarDays, color: "yellow", target: "visitors" as const, filter: "Follow Up" },
      { label: "Total Memberships", value: data.memberships.length, sub: "All Memberships", icon: ShieldCheck, color: "blue", target: "memberships" as const, filter: "" },
      { label: "Active Memberships", value: activeMemberships, sub: "Active Memberships", icon: ShieldCheck, color: "green", target: "memberships" as const, filter: "Active" },
      { label: "Expired Memberships", value: expiredMemberships, sub: "Expired", icon: CalendarClock, color: "red", target: "members" as const, filter: "Inactive" },
      { label: "Upcoming Expiries", value: expiring30, sub: "Next 30 Days", icon: CalendarClock, color: "yellow", target: "members" as const, filter: "" },
      { label: "Total Trainers", value: data.trainers.length, sub: "All Trainers", icon: UserCog, color: "purple", target: "trainers" as const, filter: "" },
      { label: "Total Staff", value: data.staff.length, sub: "All Staff Members", icon: Briefcase, color: "blue", target: "staff" as const, filter: "" },
      { label: "Revenue (This Month)", value: currency(monthRevenue), sub: "Total Revenue", icon: Activity, color: "green", target: "payments" as const, filter: "Paid" }
    ]
  };
}
