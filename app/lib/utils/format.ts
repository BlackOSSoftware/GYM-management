export function label(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

export function currency(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
}

const DATE_KEYS = new Set([
  "dob",
  "joiningDate",
  "startDate",
  "expiryDate",
  "visitDate",
  "trialDate",
  "followUpDate",
  "paymentDate",
  "purchaseDate",
  "maintenanceDate",
  "membershipStart",
  "membershipEnd",
  "createdAt",
  "updatedAt"
]);

/** Format any date-like value as dd/mm/yyyy */
export function formatDate(value: any): string {
  if (value == null || value === "") return "—";
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return "—";
    const dd = String(value.getDate()).padStart(2, "0");
    const mm = String(value.getMonth() + 1).padStart(2, "0");
    const yyyy = value.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  const raw = String(value).trim();
  // Already dd/mm/yyyy
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw;

  // yyyy-mm-dd or ISO
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    const dd = String(parsed.getDate()).padStart(2, "0");
    const mm = String(parsed.getMonth() + 1).padStart(2, "0");
    const yyyy = parsed.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
  return raw;
}

export function formatMembershipPeriod(start?: any, end?: any) {
  const from = formatDate(start);
  const to = formatDate(end);
  if (from === "—" && to === "—") return "—";
  if (from === "—") return `until ${to}`;
  if (to === "—") return `from ${from}`;
  return `${from} → ${to}`;
}

export function formatValue(value: any, key: string) {
  if (value == null || value === "") return "—";
  if (["amount", "price", "salary", "purchaseCost", "planPrice", "billingAmount"].includes(key)) return currency(Number(value));
  if (DATE_KEYS.has(key) || key.toLowerCase().endsWith("date") || key === "createdAt" || key === "updatedAt") {
    return formatDate(value);
  }
  if (key === "durationValue" && typeof value === "number") return String(value);
  if (key === "durationType") return String(value);
  if (key === "trainerIncluded") return String(value);
  return String(value);
}

export function calculateExpiry(startDate: string, durationDays: number) {
  const date = new Date(startDate);
  if (Number.isNaN(date.getTime())) return "";
  date.setDate(date.getDate() + durationDays);
  return date.toISOString().slice(0, 10);
}

export function download(filename: string, text: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

