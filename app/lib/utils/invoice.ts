import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import type { AnyDoc } from "../types";
import { buildInvoiceModel, type InvoiceModel } from "./invoiceModel";

function esc(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function badge(model: InvoiceModel) {
  const map: Record<InvoiceModel["statusTone"], string> = {
    paid: "background:#ecfdf5;color:#047857;border-color:#a7f3d0",
    pending: "background:#fffbeb;color:#b45309;border-color:#fde68a",
    failed: "background:#fff1f2;color:#be123c;border-color:#fecdd3",
    refunded: "background:#f0f9ff;color:#0369a1;border-color:#bae6fd",
    other: "background:#f1f5f9;color:#475569;border-color:#e2e8f0"
  };
  return `<span style="display:inline-flex;align-items:center;border:1px solid;border-radius:999px;padding:2px 8px;font-size:9px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;${map[model.statusTone]}">${esc(model.status)}</span>`;
}

/** Compact single-A4 invoice HTML (same fields / layout as on-screen invoice). */
export function buildPrintHtml(model: InvoiceModel, opts?: { toolbar?: boolean }) {
  const showToolbar = opts?.toolbar !== false;
  const gymLines = [
    model.gym.address ? esc(model.gym.address) : "",
    model.gym.phone ? `Phone: ${esc(model.gym.phone)}` : "",
    model.gym.email ? `Email: ${esc(model.gym.email)}` : "",
    model.gym.gst ? `GST: ${esc(model.gym.gst)}` : ""
  ]
    .filter(Boolean)
    .map((l) => `<div>${l}</div>`)
    .join("");

  const memRows = [
    ["Membership Plan", model.plan],
    ["Membership Type", model.membershipType],
    ["Duration", model.duration],
    ["Start Date", model.startDate],
    ["Expiry Date", model.expiryDate],
    ["Renewal Type", model.renewalType],
    ["Trainer Included", model.trainerIncluded],
    ["Status", model.membershipStatus]
  ]
    .map(
      ([l, v]) =>
        `<div class="cell"><span>${esc(l)}</span><b>${esc(v)}</b></div>`
    )
    .join("");

  const notes =
    model.notes || model.period !== "—"
      ? `<section class="card notes">
          <h3>Notes</h3>
          ${model.notes ? `<p>${esc(model.notes)}</p>` : ""}
          ${
            model.period !== "—"
              ? `<p class="muted">${esc(model.description)}${model.duration !== "—" ? ` · ${esc(model.duration)}` : ""} · ${esc(model.period)}</p>`
              : ""
          }
        </section>`
      : "";

  const toolbar = showToolbar
    ? `<div class="toolbar">
    <button type="button" onclick="window.print()">Print Invoice</button>
    <button type="button" class="primary" onclick="window.print()">Save as PDF</button>
  </div>`
    : "";

  return `<!DOCTYPE html><html><head><title>${esc(model.invoiceNo)} — Invoice</title>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  *{box-sizing:border-box}
  html,body{margin:0;padding:0}
  body{background:#f8fafc;color:#0f172a;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif;font-size:11px;line-height:1.35}
  .toolbar{display:flex;gap:8px;justify-content:flex-end;margin:10px auto 8px;max-width:210mm;padding:0 8px}
  .toolbar button{border:1px solid #e2e8f0;background:#fff;border-radius:8px;padding:8px 12px;font-weight:600;font-size:12px;cursor:pointer}
  .toolbar .primary{background:#4f46e5;border-color:#4f46e5;color:#fff}
  .sheet{width:210mm;max-width:100%;min-height:297mm;margin:0 auto;background:#fff;padding:10mm 11mm;box-sizing:border-box}
  header{display:flex;justify-content:space-between;gap:12px;padding-bottom:8px;border-bottom:1px solid #e2e8f0}
  .logo{width:32px;height:32px;border-radius:8px;background:#4f46e5;color:#fff;display:grid;place-items:center;font-weight:700;font-size:13px;margin-bottom:4px}
  h1{margin:0;font-size:18px;letter-spacing:-.02em;line-height:1.2}
  .contact{margin-top:3px;color:#64748b;font-size:10px;line-height:1.35}
  .right{text-align:right}
  .title{margin:0;color:#4f46e5;font-size:14px;font-weight:700;letter-spacing:-.02em}
  .label{color:#64748b;font-size:10px;margin:4px 0 0}
  .value{margin:1px 0 0;font-weight:600;font-size:12px}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}
  .card{border:1px solid #e2e8f0;border-radius:8px;padding:8px 10px;margin-top:8px;background:#fff}
  .card h3{margin:0 0 6px;font-size:12px}
  .row{display:flex;justify-content:space-between;gap:8px;font-size:10.5px;padding:2px 0}
  .row span{color:#64748b}
  .cells{display:grid;grid-template-columns:1fr 1fr;gap:5px}
  .cell{border:1px solid #eef2f7;border-radius:6px;padding:4px 7px;background:#f8fafc}
  .cell span{display:block;color:#64748b;font-size:9.5px}
  .cell b{display:block;margin-top:1px;font-size:11px;font-weight:600}
  table{width:100%;border-collapse:collapse;font-size:10.5px}
  th{text-align:left;color:#64748b;padding:5px 6px;background:#f8fafc;font-weight:600}
  td{padding:6px;border-top:1px solid #eef2f7}
  .totals{margin-left:auto;max-width:200px;margin-top:6px}
  .totals .line{display:flex;justify-content:space-between;padding:2px 0;font-size:10.5px}
  .grand{display:flex;justify-content:space-between;align-items:flex-end;border-top:1px solid #e2e8f0;margin-top:4px;padding-top:4px}
  .grand span{font-weight:600;font-size:11px}
  .grand b{font-size:16px;color:#4f46e5;letter-spacing:-.02em}
  .notes p{margin:0;font-size:10.5px}
  footer{margin-top:8px;padding-top:6px;border-top:1px solid #e2e8f0;text-align:center}
  footer p{margin:0}
  footer .thanks{font-weight:600;font-size:11px}
  footer .muted,.muted{color:#64748b;font-size:9.5px;margin-top:2px}
  @media print{
    body{background:#fff}
    .toolbar{display:none!important}
    .sheet{width:auto;min-height:0;margin:0;padding:0;box-shadow:none}
  }
  @page{size:A4;margin:8mm}
</style></head><body>
  ${toolbar}
  <div class="sheet" id="invoice-root">
    <header>
      <div>
        <div class="logo">${esc((model.gym.name || "G").slice(0, 1).toUpperCase())}</div>
        <h1>${esc(model.gym.name)}</h1>
        <div class="contact">${gymLines}</div>
      </div>
      <div class="right">
        <p class="title">PAYMENT INVOICE</p>
        <p class="label">Invoice Number</p>
        <p class="value">${esc(model.invoiceNo)}</p>
        <p class="label">Invoice Date</p>
        <p class="value">${esc(model.invoiceDate)}</p>
        <div style="margin-top:6px">${badge(model)}</div>
      </div>
    </header>

    <div class="grid2">
      <section class="card" style="margin-top:0">
        <h3>Bill To</h3>
        <div class="row"><span>Member Name</span><b>${esc(model.memberName)}</b></div>
        <div class="row"><span>Mobile</span><b>${esc(model.memberMobile)}</b></div>
        <div class="row"><span>Email</span><b>${esc(model.memberEmail)}</b></div>
        <div class="row"><span>Member ID</span><b>${esc(model.memberId)}</b></div>
      </section>
      <section class="card" style="margin-top:0">
        <h3>Invoice Details</h3>
        <div class="row"><span>Invoice Number</span><b>${esc(model.invoiceNo)}</b></div>
        <div class="row"><span>Payment Date</span><b>${esc(model.paymentDate)}</b></div>
        <div class="row"><span>Payment Method</span><b>${esc(model.method)}</b></div>
        <div class="row"><span>Transaction ID</span><b>${esc(model.transactionId)}</b></div>
      </section>
    </div>

    <section class="card">
      <h3>Membership Details</h3>
      <div class="cells">${memRows}</div>
    </section>

    <section class="card">
      <h3>Payment Summary</h3>
      <table>
        <thead><tr><th>Description</th><th style="text-align:center">Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th></tr></thead>
        <tbody>
          <tr>
            <td>${esc(model.description)}</td>
            <td style="text-align:center">${model.qty}</td>
            <td style="text-align:right">${esc(model.rateLabel)}</td>
            <td style="text-align:right"><b>${esc(model.subtotalLabel)}</b></td>
          </tr>
        </tbody>
      </table>
      <div class="totals">
        <div class="line"><span>Subtotal</span><b>${esc(model.subtotalLabel)}</b></div>
        <div class="line"><span>Discount</span><b>${esc(model.discountLabel)}</b></div>
        <div class="line"><span>Tax</span><b>${esc(model.taxLabel)}</b></div>
        <div class="grand"><span>Grand Total</span><b>${esc(model.grandTotalLabel)}</b></div>
      </div>
    </section>

    ${notes}

    <footer>
      <p class="thanks">Thank you for choosing ${esc(model.gym.name)}.</p>
      <p class="muted">This invoice is system generated and does not require a signature.</p>
    </footer>
  </div>
</body></html>`;
}

function openHtmlWindow(html: string, autoPrint: boolean) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank");
  if (!w) {
    URL.revokeObjectURL(url);
    const fallback = window.open("about:blank", "_blank");
    if (!fallback) return null;
    fallback.document.open();
    fallback.document.write(html);
    fallback.document.close();
    fallback.focus();
    if (autoPrint) window.setTimeout(() => fallback.print(), 300);
    return fallback;
  }
  if (autoPrint) {
    const done = () => {
      try {
        w.focus();
        w.print();
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    if (w.document.readyState === "complete") {
      window.setTimeout(done, 200);
    } else {
      w.addEventListener("load", () => window.setTimeout(done, 150));
      window.setTimeout(done, 800);
    }
  } else {
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
  return w;
}

/** Opens printable invoice and triggers browser print (fits 1× A4). */
export function printInvoice(payment: AnyDoc, member?: AnyDoc | null) {
  try {
    const model = buildInvoiceModel(payment, member);
    openHtmlWindow(buildPrintHtml(model, { toolbar: true }), true);
  } catch (err) {
    console.error("printInvoice failed", err);
  }
}

function safeFileName(invoiceNo: string) {
  return `${String(invoiceNo || "invoice").replace(/[^\w.-]+/g, "_")}.pdf`;
}

/** Downloads a real PDF of the same invoice UI, scaled to one A4 page. */
export async function downloadInvoicePdf(payment: AnyDoc, member?: AnyDoc | null) {
  const model = buildInvoiceModel(payment, member);
  const html = buildPrintHtml(model, { toolbar: false });

  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText =
    "position:fixed;left:-12000px;top:0;width:794px;background:#fff;z-index:-1;pointer-events:none;opacity:0;";
  document.body.appendChild(host);

  try {
    const doc = host.ownerDocument;
    const iframe = doc.createElement("iframe");
    iframe.setAttribute("title", "invoice-pdf");
    iframe.style.cssText = "width:794px;height:1123px;border:0;background:#fff;";
    host.appendChild(iframe);

    const idoc = iframe.contentDocument;
    if (!idoc) throw new Error("PDF iframe unavailable");
    idoc.open();
    idoc.write(html);
    idoc.close();

    await new Promise<void>((resolve) => {
      if (iframe.contentWindow?.document.readyState === "complete") resolve();
      else iframe.onload = () => resolve();
      window.setTimeout(resolve, 400);
    });

    const root = idoc.getElementById("invoice-root") as HTMLElement | null;
    if (!root) throw new Error("Invoice root missing");

    const canvas = await html2canvas(root, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: 794
    });

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 6;
    const maxW = pageW - margin * 2;
    const maxH = pageH - margin * 2;

    const imgW = maxW;
    const imgH = (canvas.height * maxW) / canvas.width;
    const scale = Math.min(1, maxH / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const x = margin + (maxW - drawW) / 2;
    const y = margin;

    const imgData = canvas.toDataURL("image/jpeg", 0.96);
    pdf.addImage(imgData, "JPEG", x, y, drawW, drawH);
    pdf.save(safeFileName(model.invoiceNo));
  } catch (err) {
    console.error("downloadInvoicePdf failed", err);
    // Fallback: open print dialog so user can Save as PDF
    openHtmlWindow(html, true);
  } finally {
    host.remove();
  }
}
