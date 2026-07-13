"use client";

import { cn } from "../../lib/utils/cn";
import type { InvoiceModel } from "../../lib/utils/invoiceModel";

const TONE: Record<InvoiceModel["statusTone"], string> = {
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  failed: "bg-rose-50 text-rose-700 border-rose-200",
  refunded: "bg-sky-50 text-sky-700 border-sky-200",
  other: "bg-slate-100 text-slate-600 border-slate-200"
};

export function StatusBadge({ status, tone }: { status: string; tone: InvoiceModel["statusTone"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide print:px-2 print:py-0 print:text-[9px]",
        TONE[tone]
      )}
    >
      {status || "—"}
    </span>
  );
}

export function InvoiceHeader({ model }: { model: InvoiceModel }) {
  const { gym } = model;
  return (
    <header className="flex flex-col gap-4 border-b border-line/60 pb-4 min-[640px]:flex-row min-[640px]:items-start min-[640px]:justify-between print:flex-row print:gap-3 print:pb-2">
      <div className="min-w-0">
        <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white print:mb-1 print:size-8 print:rounded-lg print:text-xs">
          {(gym.name || "G").slice(0, 1).toUpperCase()}
        </div>
        <h1 className="m-0 text-2xl font-semibold tracking-tight text-ink min-[768px]:text-[32px] print:text-lg">
          {gym.name}
        </h1>
        <div className="mt-1.5 space-y-0.5 text-[13px] leading-snug text-muted print:mt-1 print:text-[10px] print:leading-snug">
          {gym.address ? <p className="m-0">{gym.address}</p> : null}
          {gym.phone ? <p className="m-0">Phone: {gym.phone}</p> : null}
          {gym.email ? <p className="m-0">Email: {gym.email}</p> : null}
          {gym.gst ? <p className="m-0">GST: {gym.gst}</p> : null}
        </div>
      </div>
      <div className="text-left min-[640px]:text-right print:text-right">
        <p className="m-0 text-xl font-semibold tracking-tight text-indigo-600 min-[768px]:text-2xl print:text-sm">
          PAYMENT INVOICE
        </p>
        <p className="mt-2 mb-0 text-[13px] text-muted print:mt-1 print:text-[10px]">Invoice Number</p>
        <p className="m-0 text-base font-semibold text-ink print:text-xs">{model.invoiceNo}</p>
        <p className="mt-2 mb-0 text-[13px] text-muted print:mt-1 print:text-[10px]">Invoice Date</p>
        <p className="m-0 text-base font-semibold text-ink print:text-xs">{model.invoiceDate}</p>
        <div className="mt-2.5 min-[640px]:flex min-[640px]:justify-end print:mt-1.5 print:flex print:justify-end">
          <StatusBadge status={model.status} tone={model.statusTone} />
        </div>
      </div>
    </header>
  );
}

function InfoCard({ title, rows }: { title: string; rows: { label: string; value: string }[] }) {
  return (
    <section className="rounded-2xl border border-line/60 bg-bg/40 p-3 min-[360px]:p-3.5 print:rounded-md print:border-slate-200 print:p-2">
      <h3 className="mb-2.5 mt-0 text-base font-semibold tracking-tight text-ink min-[768px]:text-lg print:mb-1.5 print:text-xs">
        {title}
      </h3>
      <dl className="m-0 grid gap-2 print:gap-0.5">
        {rows.map((r) => (
          <div
            key={r.label}
            className="grid grid-cols-[1fr_auto] gap-2 text-[13px] min-[768px]:text-sm print:text-[10px]"
          >
            <dt className="text-muted">{r.label}</dt>
            <dd className="m-0 text-right font-semibold text-ink">{r.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function BillingInformation({ model }: { model: InvoiceModel }) {
  return (
    <div className="grid grid-cols-1 gap-2.5 min-[640px]:grid-cols-2 print:grid-cols-2 print:gap-2">
      <InfoCard
        title="Bill To"
        rows={[
          { label: "Member Name", value: model.memberName },
          { label: "Mobile", value: model.memberMobile },
          { label: "Email", value: model.memberEmail },
          { label: "Member ID", value: model.memberId }
        ]}
      />
      <InfoCard
        title="Invoice Details"
        rows={[
          { label: "Invoice Number", value: model.invoiceNo },
          { label: "Payment Date", value: model.paymentDate },
          { label: "Payment Method", value: model.method },
          { label: "Transaction ID", value: model.transactionId }
        ]}
      />
    </div>
  );
}

export function MembershipDetails({ model }: { model: InvoiceModel }) {
  const rows = [
    { label: "Membership Plan", value: model.plan },
    { label: "Membership Type", value: model.membershipType },
    { label: "Duration", value: model.duration },
    { label: "Start Date", value: model.startDate },
    { label: "Expiry Date", value: model.expiryDate },
    { label: "Renewal Type", value: model.renewalType },
    { label: "Trainer Included", value: model.trainerIncluded },
    { label: "Status", value: model.membershipStatus }
  ];
  return (
    <section className="rounded-2xl border border-line/60 bg-panel p-3 min-[360px]:p-3.5 print:rounded-md print:p-2">
      <h3 className="mb-2.5 mt-0 text-base font-semibold tracking-tight text-ink min-[768px]:text-lg print:mb-1.5 print:text-xs">
        Membership Details
      </h3>
      <div className="grid grid-cols-1 gap-2 min-[480px]:grid-cols-2 print:grid-cols-2 print:gap-1">
        {rows.map((r) => (
          <div
            key={r.label}
            className="rounded-xl border border-line/45 bg-bg/50 px-2.5 py-2 print:rounded-md print:px-1.5 print:py-1"
          >
            <span className="block text-[12px] text-muted min-[768px]:text-[13px] print:text-[9px]">{r.label}</span>
            <b className="mt-0.5 block text-sm font-semibold text-ink min-[768px]:text-base print:mt-0 print:text-[10.5px]">
              {r.value}
            </b>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PaymentSummary({ model }: { model: InvoiceModel }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-line/60 bg-panel print:rounded-md">
      <div className="border-b border-line/55 px-3 py-2.5 min-[360px]:px-3.5 print:px-2 print:py-1.5">
        <h3 className="m-0 text-base font-semibold tracking-tight text-ink min-[768px]:text-lg print:text-xs">
          Payment Summary
        </h3>
      </div>
      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full min-w-[480px] border-collapse text-left text-[13px] min-[768px]:text-sm print:min-w-0 print:text-[10.5px]">
          <thead>
            <tr className="bg-bg/70 text-muted">
              <th className="px-3 py-2.5 font-semibold min-[360px]:px-3.5 print:px-2 print:py-1.5">Description</th>
              <th className="px-3 py-2.5 font-semibold text-center print:px-2 print:py-1.5">Qty</th>
              <th className="px-3 py-2.5 font-semibold text-right print:px-2 print:py-1.5">Rate</th>
              <th className="px-3 py-2.5 font-semibold text-right min-[360px]:px-3.5 print:px-2 print:py-1.5">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-line/50">
              <td className="px-3 py-3 font-medium text-ink min-[360px]:px-3.5 print:px-2 print:py-1.5">
                {model.description}
              </td>
              <td className="px-3 py-3 text-center text-ink print:px-2 print:py-1.5">{model.qty}</td>
              <td className="px-3 py-3 text-right text-ink print:px-2 print:py-1.5">{model.rateLabel}</td>
              <td className="px-3 py-3 text-right font-semibold text-ink min-[360px]:px-3.5 print:px-2 print:py-1.5">
                {model.subtotalLabel}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="border-t border-line/55 bg-bg/40 px-3 py-3 min-[360px]:px-3.5 print:px-2 print:py-1.5">
        <div className="ml-auto grid w-full max-w-xs gap-1.5 text-[13px] min-[768px]:text-sm print:gap-0.5 print:text-[10.5px]">
          <div className="flex justify-between gap-4">
            <span className="text-muted">Subtotal</span>
            <b>{model.subtotalLabel}</b>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted">Discount</span>
            <b>{model.discountLabel}</b>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted">Tax</span>
            <b>{model.taxLabel}</b>
          </div>
          <div className="mt-1 flex items-end justify-between gap-4 border-t border-line/50 pt-2 print:mt-0.5 print:pt-1">
            <span className="text-sm font-semibold text-ink print:text-[11px]">Grand Total</span>
            <b className="text-2xl font-bold tracking-tight text-indigo-600 min-[768px]:text-[32px] print:text-base">
              {model.grandTotalLabel}
            </b>
          </div>
        </div>
      </div>
    </section>
  );
}

export function InvoiceNotes({ model }: { model: InvoiceModel }) {
  if (!model.notes && model.period === "—") return null;
  return (
    <section className="rounded-2xl border border-line/60 bg-bg/40 p-3 min-[360px]:p-3.5 print:rounded-md print:p-2">
      <h3 className="mb-2 mt-0 text-base font-semibold text-ink min-[768px]:text-lg print:mb-1 print:text-xs">
        Notes
      </h3>
      {model.notes ? <p className="m-0 text-sm text-ink print:text-[10.5px]">{model.notes}</p> : null}
      {model.period !== "—" ? (
        <p className="mt-1.5 mb-0 text-[13px] text-muted print:mt-1 print:text-[9.5px]">
          {model.description}
          {model.duration !== "—" ? ` · ${model.duration}` : ""}
          {` · ${model.period}`}
        </p>
      ) : null}
    </section>
  );
}

export function InvoiceFooter({ gymName }: { gymName: string }) {
  return (
    <footer className="border-t border-line/60 pt-3 text-center print:pt-1.5">
      <p className="m-0 text-sm font-semibold text-ink print:text-[11px]">Thank you for choosing {gymName}.</p>
      <p className="mt-1 mb-0 text-[12px] text-muted print:mt-0.5 print:text-[9.5px]">
        This invoice is system generated and does not require a signature.
      </p>
    </footer>
  );
}

export function InvoiceDocument({ model }: { model: InvoiceModel }) {
  return (
    <div className="invoice-sheet mx-auto w-full max-w-[900px] bg-panel p-3 text-ink min-[360px]:p-4 min-[768px]:rounded-2xl min-[768px]:p-6 min-[768px]:shadow-[0_12px_40px_rgba(15,23,42,0.08)] print:max-w-none print:rounded-none print:p-0 print:shadow-none">
      <InvoiceHeader model={model} />
      <div className="mt-3 flex flex-col gap-3 min-[768px]:mt-4 min-[768px]:gap-3.5 print:mt-2 print:gap-2">
        <BillingInformation model={model} />
        <MembershipDetails model={model} />
        <PaymentSummary model={model} />
        <InvoiceNotes model={model} />
        <InvoiceFooter gymName={model.gym.name} />
      </div>
    </div>
  );
}
