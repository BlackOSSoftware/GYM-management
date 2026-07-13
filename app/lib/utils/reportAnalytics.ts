import type { AnyDoc, AppData } from "../types";
import {
  type DateRange,
  eachDay,
  eachMonth,
  inRange,
  parseDate,
  previousRange
} from "./reportRange";
import { daysUntilExpiry, memberExpiryStatus } from "./memberExpiry";

export type Kpi = {
  id: string;
  label: string;
  value: number | string;
  format?: "number" | "currency" | "percent";
  delta?: number | null; // % vs previous
  tone?: "purple" | "green" | "blue" | "orange" | "red" | "yellow";
  group: string;
};

export type ChartSeries = { label: string; value: number; color?: string };

export type ReportTables = {
  renewals: AnyDoc[];
  newMembers: AnyDoc[];
  upcomingExpiry: AnyDoc[];
  pendingPayments: AnyDoc[];
  salaryRows: AnyDoc[];
  recentVisitors: AnyDoc[];
  maintenance: AnyDoc[];
};

export type ReportAnalytics = {
  kpis: Kpi[];
  revenue: Record<string, number>;
  membership: Record<string, number>;
  salary: Record<string, number>;
  visitors: Record<string, number>;
  trainers: Record<string, number>;
  equipment: Record<string, number>;
  charts: {
    revenueTrend: ChartSeries[];
    membershipGrowth: ChartSeries[];
    revenueSources: ChartSeries[];
    monthlyJoinings: ChartSeries[];
    expenseBreakdown: ChartSeries[];
    trainerAssignments: ChartSeries[];
    visitorFunnel: ChartSeries[];
    membershipStatus: ChartSeries[];
  };
  tables: ReportTables;
};

function num(v: unknown) {
  return Number(v) || 0;
}

function isPaid(p: AnyDoc) {
  return String(p.status || "").toLowerCase() === "paid";
}

function isPending(p: AnyDoc) {
  return String(p.status || "").toLowerCase() === "pending";
}

function isRefund(p: AnyDoc) {
  const s = String(p.status || "").toLowerCase();
  const t = String(p.type || "").toLowerCase();
  return s === "refunded" || t.includes("refund");
}

function isRenewal(p: AnyDoc) {
  return String(p.type || "").toLowerCase().includes("renew");
}

function isMembershipPay(p: AnyDoc) {
  const t = String(p.type || "").toLowerCase();
  return t.includes("membership") || t.includes("renew");
}

function isPtPay(p: AnyDoc) {
  const t = String(p.type || "").toLowerCase();
  return t.includes("pt") || t.includes("personal") || t.includes("training");
}

function methodOf(p: AnyDoc) {
  return String(p.method || "").toLowerCase();
}

function sum(rows: AnyDoc[], pick: (r: AnyDoc) => number) {
  return rows.reduce((s, r) => s + pick(r), 0);
}

function pctDelta(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10;
}

function filterByDate(rows: AnyDoc[], range: DateRange, keys: string[]) {
  if (range.preset === "all") return rows;
  return rows.filter((r) => keys.some((k) => inRange(r[k], range)));
}

function kpi(
  id: string,
  label: string,
  value: number,
  prev: number,
  group: string,
  format: Kpi["format"] = "number",
  tone: Kpi["tone"] = "purple"
): Kpi {
  return { id, label, value, format, delta: pctDelta(value, prev), tone, group };
}

export function buildReportAnalytics(data: AppData, range: DateRange): ReportAnalytics {
  const prev = previousRange(range);

  const membersIn = filterByDate(data.members, range, ["joiningDate", "createdAt", "startDate"]);
  const membersPrev = filterByDate(data.members, prev, ["joiningDate", "createdAt", "startDate"]);
  const paymentsIn = filterByDate(data.payments, range, ["paymentDate", "createdAt"]);
  const paymentsPrev = filterByDate(data.payments, prev, ["paymentDate", "createdAt"]);
  const visitorsIn = filterByDate(data.visitors, range, ["visitDate", "createdAt", "trialDate"]);
  const visitorsPrev = filterByDate(data.visitors, prev, ["visitDate", "createdAt", "trialDate"]);

  // Snapshot metrics (not strictly period-bound, but still useful)
  const activeMembers = data.members.filter((m) => String(m.status).toLowerCase() === "active").length;
  const inactiveMembers = data.members.filter((m) => String(m.status).toLowerCase() === "inactive").length;
  const expiredMembers = data.members.filter((m) => memberExpiryStatus(m) === "expired").length;
  const upcomingRenewals = data.members.filter((m) => {
    const d = daysUntilExpiry(m.expiryDate);
    return d !== null && d >= 0 && d <= 30;
  }).length;
  const expiring7 = data.members.filter((m) => {
    const d = daysUntilExpiry(m.expiryDate);
    return d !== null && d >= 0 && d <= 7;
  }).length;

  const paidIn = paymentsIn.filter((p) => isPaid(p) && !isRefund(p));
  const paidPrev = paymentsPrev.filter((p) => isPaid(p) && !isRefund(p));
  const pendingIn = paymentsIn.filter(isPending);
  const refundsIn = paymentsIn.filter(isRefund);
  const renewalsIn = paidIn.filter(isRenewal);
  const renewalsPrev = paidPrev.filter(isRenewal);

  const totalRevenue = sum(paidIn, (p) => num(p.amount));
  const totalRevenuePrev = sum(paidPrev, (p) => num(p.amount));
  const membershipRevenue = sum(paidIn.filter(isMembershipPay), (p) => num(p.amount));
  const ptRevenue = sum(paidIn.filter(isPtPay), (p) => num(p.amount));
  const otherIncome = Math.max(0, totalRevenue - membershipRevenue - ptRevenue);
  const pendingPayments = sum(pendingIn, (p) => num(p.amount));
  const refunds = sum(refundsIn, (p) => num(p.amount));
  const byMethod = (m: string) => sum(paidIn.filter((p) => methodOf(p).includes(m)), (p) => num(p.amount));
  const cash = byMethod("cash");
  const upi = byMethod("upi");
  const card = byMethod("card");
  const bank = byMethod("bank") + byMethod("transfer") + byMethod("neft");
  const netRevenue = totalRevenue - refunds;

  const newMembers = membersIn.length;
  const newMembersPrev = membersPrev.length;
  const cancelled = data.members.filter((m) => {
    const s = String(m.status || "").toLowerCase();
    return s === "frozen" || s === "cancelled";
  }).length;
  const avgMembershipValue =
    paidIn.filter(isMembershipPay).length > 0
      ? membershipRevenue / paidIn.filter(isMembershipPay).length
      : 0;

  const staffActive = data.staff.filter((s) => String(s.status).toLowerCase() === "active");
  const trainersActive = data.trainers.filter((t) => String(t.status).toLowerCase() === "active");
  const staffSalary = sum(staffActive, (s) => num(s.salary));
  const trainerSalary = sum(trainersActive, (t) => num(t.salary));
  const totalSalary = staffSalary + trainerSalary;
  // No payroll ledger — treat full monthly salary as "owed" for period expense, paid ≈ active roster
  const paidSalary = totalSalary;
  const pendingSalary = 0;
  const otherExpenses = 0;
  const netProfit = netRevenue - totalSalary - otherExpenses;

  const walkIns = visitorsIn.filter((v) => String(v.source || "").toLowerCase().includes("walk")).length;
  const trials = visitorsIn.filter((v) => {
    const s = String(v.status || "").toLowerCase();
    return s.includes("trial") || !!v.trialDate;
  }).length;
  const converted = visitorsIn.filter((v) => String(v.status || "").toLowerCase() === "converted").length;
  const convertedPrev = visitorsPrev.filter((v) => String(v.status || "").toLowerCase() === "converted").length;
  const followUps = visitorsIn.filter((v) => {
    const s = String(v.status || "").toLowerCase();
    return s.includes("follow") || !!v.followUpDate;
  }).length;
  const conversionRate = visitorsIn.length ? (converted / visitorsIn.length) * 100 : 0;

  const assignedMembers = data.members.filter((m) => m.assignedTrainer).length;
  const totalTrainers = data.trainers.length;
  const activeTrainers = trainersActive.length;
  const workoutsCreated = filterByDate(data.workouts, range, ["createdAt", "updatedAt"]).length || data.workouts.length;
  const dietsCreated = filterByDate(data.diets, range, ["createdAt", "updatedAt"]).length || data.diets.length;

  const totalStaff = data.staff.length;
  const activeStaff = staffActive.length;
  const attendancePct = totalStaff ? (activeStaff / totalStaff) * 100 : 0;

  const totalEquip = data.equipment.length;
  const available = data.equipment.filter((e) => String(e.availability || "").toLowerCase().includes("available")).length;
  const maintenance = data.equipment.filter((e) => String(e.availability || "").toLowerCase().includes("maintenance")).length;
  const damaged = data.equipment.filter((e) => String(e.condition || "").toLowerCase().includes("damaged")).length;
  const purchaseCost = sum(filterByDate(data.equipment, range, ["purchaseDate", "createdAt"]), (e) => num(e.purchaseCost));
  const maintenanceCost = 0; // no dedicated field

  const kpis: Kpi[] = [
    kpi("m-total", "Total Members", data.members.length, data.members.length, "Members", "number", "purple"),
    kpi("m-active", "Active Members", activeMembers, activeMembers, "Members", "number", "green"),
    kpi("m-inactive", "Inactive Members", inactiveMembers, inactiveMembers, "Members", "number", "orange"),
    kpi("m-expired", "Expired Members", expiredMembers, expiredMembers, "Members", "number", "red"),
    kpi("m-new", "New Members Joined", newMembers, newMembersPrev, "Members", "number", "blue"),
    kpi("m-renew", "Membership Renewals", renewalsIn.length, renewalsPrev.length, "Members", "number", "green"),
    kpi("m-upcoming", "Upcoming Renewals", upcomingRenewals, upcomingRenewals, "Members", "number", "yellow"),

    kpi("f-rev", "Total Revenue", totalRevenue, totalRevenuePrev, "Finance", "currency", "green"),
    kpi("f-mem", "Membership Revenue", membershipRevenue, membershipRevenue, "Finance", "currency", "purple"),
    kpi("f-pt", "PT Revenue", ptRevenue, ptRevenue, "Finance", "currency", "blue"),
    kpi("f-other", "Other Income", otherIncome, otherIncome, "Finance", "currency", "orange"),
    kpi("f-pending", "Pending Payments", pendingPayments, pendingPayments, "Finance", "currency", "yellow"),
    kpi("f-dues", "Outstanding Dues", pendingPayments, pendingPayments, "Finance", "currency", "red"),

    kpi("e-staff", "Staff Salary", staffSalary, staffSalary, "Expenses", "currency", "blue"),
    kpi("e-trainer", "Trainer Salary", trainerSalary, trainerSalary, "Expenses", "currency", "purple"),
    kpi("e-total", "Total Salary", totalSalary, totalSalary, "Expenses", "currency", "orange"),
    kpi("e-other", "Other Expenses", otherExpenses, otherExpenses, "Expenses", "currency", "yellow"),
    kpi("e-profit", "Net Profit", netProfit, netProfit, "Expenses", "currency", "green"),

    kpi("v-total", "Total Visitors", visitorsIn.length, visitorsPrev.length, "Visitors", "number", "blue"),
    kpi("v-walk", "Walk-ins", walkIns, walkIns, "Visitors", "number", "purple"),
    kpi("v-conv", "Converted Members", converted, convertedPrev, "Visitors", "number", "green"),
    kpi("v-fu", "Follow Ups", followUps, followUps, "Visitors", "number", "yellow"),
    kpi("v-rate", "Conversion Rate %", Math.round(conversionRate * 10) / 10, conversionRate, "Visitors", "percent", "green"),

    kpi("t-total", "Total Trainers", totalTrainers, totalTrainers, "Trainers", "number", "purple"),
    kpi("t-active", "Active Trainers", activeTrainers, activeTrainers, "Trainers", "number", "green"),
    kpi("t-assign", "Members Assigned", assignedMembers, assignedMembers, "Trainers", "number", "blue"),
    kpi("t-pt", "PT Sessions", ptRevenue > 0 ? renewalsIn.length : 0, 0, "Trainers", "number", "orange"),

    kpi("s-total", "Total Staff", totalStaff, totalStaff, "Staff", "number", "blue"),
    kpi("s-active", "Active Staff", activeStaff, activeStaff, "Staff", "number", "green"),
    kpi("s-att", "Attendance %", Math.round(attendancePct), attendancePct, "Staff", "percent", "yellow"),
    kpi("s-sal", "Monthly Salary", staffSalary, staffSalary, "Staff", "currency", "orange"),

    kpi("eq-total", "Total Equipment", totalEquip, totalEquip, "Equipment", "number", "purple"),
    kpi("eq-maint", "Under Maintenance", maintenance, maintenance, "Equipment", "number", "yellow"),
    kpi("eq-avail", "Available Equipment", available, available, "Equipment", "number", "green"),
    kpi("eq-dmg", "Damaged Equipment", damaged, damaged, "Equipment", "number", "red")
  ];

  // Charts
  const chartStart = range.start || new Date(new Date().getFullYear(), 0, 1);
  const chartEnd = range.end || new Date();
  const useMonthly =
    range.preset === "thisYear" ||
    range.preset === "all" ||
    chartEnd.getTime() - chartStart.getTime() > 45 * 86400000;

  const trendPoints = useMonthly
    ? eachMonth(chartStart, chartEnd)
    : eachDay(chartStart, chartEnd, 14);

  const revenueTrend = trendPoints.map((d) => {
    let dayStart: Date;
    let dayEnd: Date;
    if (useMonthly) {
      dayStart = new Date(d.getFullYear(), d.getMonth(), 1);
      dayEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    } else {
      dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);
    }
    const bucket: DateRange = { preset: "custom", start: dayStart, end: dayEnd, label: "" };
    const amt = sum(
      data.payments.filter((p) => isPaid(p) && !isRefund(p) && inRange(p.paymentDate || p.createdAt, bucket)),
      (p) => num(p.amount)
    );
    const label = useMonthly
      ? d.toLocaleString("en-IN", { month: "short" })
      : `${d.getDate()}/${d.getMonth() + 1}`;
    return { label, value: amt };
  });

  const membershipGrowth = trendPoints.map((d, i) => {
    const cutoff = useMonthly
      ? new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
      : (() => {
          const x = new Date(d);
          x.setHours(23, 59, 59, 999);
          return x;
        })();
    const count = data.members.filter((m) => {
      const jd = parseDate(m.joiningDate || m.createdAt || m.startDate);
      return jd && jd.getTime() <= cutoff.getTime();
    }).length;
    const label = revenueTrend[i]?.label || String(i + 1);
    return { label, value: count };
  });

  const monthlyJoinings = (() => {
    const months = eachMonth(chartStart, chartEnd).slice(-6);
    return months.map((d) => {
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      const bucket: DateRange = { preset: "custom", start, end, label: "" };
      return {
        label: d.toLocaleString("en-IN", { month: "short" }),
        value: filterByDate(data.members, bucket, ["joiningDate", "createdAt", "startDate"]).length
      };
    });
  })();

  const trainerMap = new Map<string, number>();
  data.members.forEach((m) => {
    const t = String(m.assignedTrainer || "").trim();
    if (!t) return;
    trainerMap.set(t, (trainerMap.get(t) || 0) + 1);
  });
  const trainerAssignments = Array.from(trainerMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value]) => ({ label: label.split(" ")[0], value }));

  const charts = {
    revenueTrend,
    membershipGrowth,
    revenueSources: [
      { label: "Cash", value: cash, color: "#20c67a" },
      { label: "UPI", value: upi, color: "#4f46e5" },
      { label: "Card", value: card, color: "#35a8f5" },
      { label: "Bank", value: bank, color: "#ff7b2c" },
      { label: "Pending", value: pendingPayments, color: "#ffb22e" }
    ].filter((x) => x.value > 0),
    monthlyJoinings,
    expenseBreakdown: [
      { label: "Staff", value: staffSalary, color: "#35a8f5" },
      { label: "Trainers", value: trainerSalary, color: "#7047ff" },
      { label: "Other", value: Math.max(otherExpenses, 1), color: "#ffb22e" }
    ],
    trainerAssignments: trainerAssignments.length
      ? trainerAssignments
      : [{ label: "None", value: 0 }],
    visitorFunnel: [
      { label: "Visitors", value: visitorsIn.length, color: "#35a8f5" },
      { label: "Follow-ups", value: followUps, color: "#ffb22e" },
      { label: "Trials", value: trials, color: "#ff7b2c" },
      { label: "Converted", value: converted, color: "#20c67a" }
    ],
    membershipStatus: [
      { label: "Active", value: activeMembers, color: "#20c67a" },
      { label: "Expiring", value: upcomingRenewals, color: "#ffb22e" },
      { label: "Expired", value: expiredMembers, color: "#ff4d5f" },
      { label: "Inactive", value: inactiveMembers, color: "#94a3b8" }
    ].filter((x) => x.value > 0)
  };

  const tables: ReportTables = {
    renewals: renewalsIn.slice(0, 8),
    newMembers: [...membersIn]
      .sort((a, b) => (parseDate(b.joiningDate || b.createdAt)?.getTime() || 0) - (parseDate(a.joiningDate || a.createdAt)?.getTime() || 0))
      .slice(0, 8),
    upcomingExpiry: data.members
      .filter((m) => {
        const d = daysUntilExpiry(m.expiryDate);
        return d !== null && d >= 0 && d <= 30;
      })
      .sort((a, b) => (daysUntilExpiry(a.expiryDate) || 0) - (daysUntilExpiry(b.expiryDate) || 0))
      .slice(0, 8),
    pendingPayments: pendingIn.slice(0, 8),
    salaryRows: [
      ...trainersActive.map((t) => ({ ...t, _kind: "Trainer", _paid: num(t.salary) })),
      ...staffActive.map((s) => ({ ...s, _kind: "Staff", _paid: num(s.salary) }))
    ].slice(0, 10),
    recentVisitors: [...visitorsIn]
      .sort((a, b) => (parseDate(b.visitDate || b.createdAt)?.getTime() || 0) - (parseDate(a.visitDate || a.createdAt)?.getTime() || 0))
      .slice(0, 8),
    maintenance: data.equipment
      .filter((e) => e.maintenanceDate || String(e.availability || "").toLowerCase().includes("maintenance"))
      .slice(0, 8)
  };

  return {
    kpis,
    revenue: {
      total: totalRevenue,
      cash,
      upi,
      card,
      bank,
      pending: pendingPayments,
      refunds,
      net: netRevenue
    },
    membership: {
      total: data.members.length,
      newJoinings: newMembers,
      renewals: renewalsIn.length,
      expired: expiredMembers,
      expiring7,
      cancelled,
      avgValue: avgMembershipValue
    },
    salary: {
      trainer: trainerSalary,
      staff: staffSalary,
      total: totalSalary,
      pending: pendingSalary,
      paid: paidSalary
    },
    visitors: {
      walkIns,
      trials,
      converted,
      conversionRate,
      followUps
    },
    trainers: {
      total: totalTrainers,
      active: activeTrainers,
      assigned: assignedMembers,
      workouts: workoutsCreated,
      diets: dietsCreated
    },
    equipment: {
      total: totalEquip,
      available,
      maintenance,
      damaged,
      purchaseCost,
      maintenanceCost
    },
    charts,
    tables
  };
}
