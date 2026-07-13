import type { AnyDoc } from "../types";
import { currency, formatDate, formatMembershipPeriod } from "./format";

export type InvoiceGym = {
  name: string;
  phone: string;
  email: string;
  address?: string;
  gst?: string;
};

export type InvoiceModel = {
  gym: InvoiceGym;
  invoiceNo: string;
  invoiceDate: string;
  status: string;
  statusTone: "paid" | "pending" | "failed" | "refunded" | "other";
  memberName: string;
  memberMobile: string;
  memberEmail: string;
  memberId: string;
  paymentDate: string;
  method: string;
  transactionId: string;
  type: string;
  plan: string;
  membershipType: string;
  duration: string;
  startDate: string;
  expiryDate: string;
  period: string;
  renewalType: string;
  trainerIncluded: string;
  membershipStatus: string;
  amount: number;
  amountLabel: string;
  description: string;
  qty: number;
  rateLabel: string;
  subtotalLabel: string;
  discountLabel: string;
  taxLabel: string;
  grandTotalLabel: string;
  notes: string;
};

function readGym(): InvoiceGym {
  if (typeof window === "undefined") {
    return { name: "Gym Management", phone: "", email: "" };
  }
  try {
    return {
      name: localStorage.getItem("gym-name")?.trim() || "Gym Management",
      phone: localStorage.getItem("gym-phone")?.trim() || "",
      email: localStorage.getItem("gym-email")?.trim() || "",
      address: localStorage.getItem("gym-address")?.trim() || "",
      gst: localStorage.getItem("gym-gst")?.trim() || ""
    };
  } catch {
    return { name: "Gym Management", phone: "", email: "" };
  }
}

function statusTone(status: string): InvoiceModel["statusTone"] {
  const s = status.toLowerCase();
  if (s === "paid") return "paid";
  if (s === "pending") return "pending";
  if (s === "failed" || s === "cancelled") return "failed";
  if (s === "refunded") return "refunded";
  return "other";
}

function daysBetween(start?: any, end?: any) {
  if (!start || !end) return null;
  const a = new Date(start);
  const b = new Date(end);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null;
  const days = Math.round((b.getTime() - a.getTime()) / 86400000);
  if (days <= 0) return null;
  if (days % 30 === 0) {
    const months = days / 30;
    return `${months} Month${months === 1 ? "" : "s"}`;
  }
  return `${days} Day${days === 1 ? "" : "s"}`;
}

export function buildInvoiceModel(
  payment: AnyDoc,
  member?: AnyDoc | null,
  gymOverride?: InvoiceGym
): InvoiceModel {
  const gym = gymOverride || readGym();
  const start = payment.membershipStart || member?.startDate;
  const end = payment.membershipEnd || member?.expiryDate;
  const plan = payment.membershipPlan || member?.membershipPlan || "—";
  const amount = Number(payment.amount || 0);
  const type = String(payment.type || "Payment");
  const status = String(payment.status || "—");

  return {
    gym,
    invoiceNo: String(payment.invoiceNo || "—"),
    invoiceDate: formatDate(payment.paymentDate || payment.createdAt),
    status,
    statusTone: statusTone(status),
    memberName: String(payment.memberName || member?.name || "—"),
    memberMobile: String(member?.mobile || payment.mobile || "—"),
    memberEmail: String(member?.email || payment.email || "—"),
    memberId: String(payment.memberId || member?.memberId || "—"),
    paymentDate: formatDate(payment.paymentDate),
    method: String(payment.method || "—"),
    transactionId: String(payment.transactionId || payment.txnId || payment.reference || "—"),
    type,
    plan,
    membershipType: type,
    duration: daysBetween(start, end) || "—",
    startDate: formatDate(start),
    expiryDate: formatDate(end),
    period: formatMembershipPeriod(start, end),
    renewalType: type,
    trainerIncluded: String(member?.assignedTrainer || payment.trainerIncluded || "—"),
    membershipStatus: String(member?.status || payment.status || "—"),
    amount,
    amountLabel: currency(amount),
    description: type || plan || "Membership",
    qty: 1,
    rateLabel: currency(amount),
    subtotalLabel: currency(amount),
    discountLabel: currency(Number(payment.discount || 0)),
    taxLabel: currency(Number(payment.tax || 0)),
    grandTotalLabel: currency(amount),
    notes: String(payment.notes || "")
  };
}
