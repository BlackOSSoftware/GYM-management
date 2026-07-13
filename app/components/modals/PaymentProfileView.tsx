"use client";

import { useMemo, useState } from "react";
import { FileDown, Pencil, Printer, X } from "lucide-react";
import type { AnyDoc, AppData } from "../../lib/types";
import { buildInvoiceModel } from "../../lib/utils/invoiceModel";
import { downloadInvoicePdf, printInvoice } from "../../lib/utils/invoice";
import { InvoiceDocument } from "../invoice/InvoiceDocument";

type Props = {
  record: AnyDoc;
  data: AppData;
  onClose: () => void;
  onEdit: () => void;
};

export default function PaymentProfileView({ record, data, onClose, onEdit }: Props) {
  const [pdfBusy, setPdfBusy] = useState(false);

  const member = useMemo(
    () =>
      data.members.find(
        (m) =>
          (record.memberId && m.memberId === record.memberId) ||
          (record.memberName && m.name === record.memberName)
      ) || null,
    [data.members, record.memberId, record.memberName]
  );

  const model = useMemo(() => buildInvoiceModel(record, member), [record, member]);

  const handlePrint = () => printInvoice(record, member);

  const handlePdf = async () => {
    if (pdfBusy) return;
    setPdfBusy(true);
    try {
      await downloadInvoicePdf(record, member);
    } finally {
      setPdfBusy(false);
    }
  };

  const actionBtn =
    "inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-line/70 bg-panel px-2.5 text-[11px] font-semibold text-ink min-[400px]:flex-none min-[400px]:px-3 min-[400px]:text-xs disabled:opacity-60";

  return (
    <div className="modal-backdrop fixed inset-0 z-[90] flex items-end justify-center bg-slate-900/50 p-0 min-[640px]:items-center min-[640px]:p-3">
      <section
        className="relative flex max-h-[96dvh] w-full max-w-[920px] flex-col overflow-hidden rounded-t-2xl bg-bg shadow-2xl min-[640px]:max-h-[92dvh] min-[640px]:rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Payment invoice"
      >
        <div className="no-print z-20 flex shrink-0 flex-wrap items-center gap-2 border-b border-line/60 bg-panel px-2.5 py-2 print:hidden">
          <b className="mr-auto text-sm font-semibold text-ink">Invoice Preview</b>
          <button type="button" className={actionBtn} onClick={onEdit}>
            <Pencil size={14} /> Edit
          </button>
          <button type="button" className={actionBtn} onClick={handlePrint}>
            <Printer size={14} /> Print
          </button>
          <button
            type="button"
            className={`${actionBtn} border-indigo-600 bg-indigo-600 text-white`}
            onClick={handlePdf}
            disabled={pdfBusy}
          >
            <FileDown size={14} /> {pdfBusy ? "PDF…" : "Download PDF"}
          </button>
          <button
            type="button"
            className="grid size-10 shrink-0 place-items-center rounded-xl border border-line/70 bg-panel text-ink"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2 min-[360px]:p-3">
          <InvoiceDocument model={model} />
        </div>

        <div className="no-print z-20 flex shrink-0 gap-2 border-t border-line/60 bg-panel p-2.5 print:hidden">
          <button type="button" className={`${actionBtn} flex-1`} onClick={onEdit}>
            <Pencil size={14} /> Edit
          </button>
          <button type="button" className={`${actionBtn} flex-1`} onClick={handlePrint}>
            <Printer size={14} /> Print
          </button>
          <button
            type="button"
            className={`${actionBtn} flex-[1.3] border-indigo-600 bg-indigo-600 text-white`}
            onClick={handlePdf}
            disabled={pdfBusy}
          >
            <FileDown size={14} /> {pdfBusy ? "Preparing…" : "Download PDF"}
          </button>
        </div>
      </section>
    </div>
  );
}
