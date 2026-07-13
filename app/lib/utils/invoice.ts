import { currency } from "./format";
import type { AnyDoc } from "../types";

export function printInvoice(payment: AnyDoc) {
  const html = `<h1>Gym Management Invoice</h1><p><b>Invoice:</b> ${payment.invoiceNo}</p><p><b>Member:</b> ${payment.memberName}</p><p><b>Amount:</b> ${currency(Number(payment.amount))}</p><p><b>Method:</b> ${payment.method}</p><p><b>Date:</b> ${payment.paymentDate || ""}</p>`;
  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.print();
  }
}
