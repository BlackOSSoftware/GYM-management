export function label(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

export function currency(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
}

export function formatValue(value: any, key: string) {
  if (value == null || value === "") return "-";
  if (["amount", "price", "salary", "purchaseCost", "planPrice", "billingAmount"].includes(key)) return currency(Number(value));
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
