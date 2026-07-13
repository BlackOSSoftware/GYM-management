"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import type { AnyDoc } from "../../lib/types";
import {
  daysUntilExpiry,
  expiredMemberMessage,
  expiringMemberMessage,
  memberExpiryStatus,
  whatsappUrl
} from "../../lib/utils/memberExpiry";

type Props = {
  member: AnyDoc;
};

export default function WhatsAppMenu({ member }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const status = memberExpiryStatus(member);
  const days = daysUntilExpiry(member.expiryDate);
  const name = member.name || "Member";
  const mobile = member.mobile;

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const openWhatsApp = (message: string) => {
    const url = whatsappUrl(mobile, message);
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  if (!mobile) {
    return <span className="wa-disabled" title="No mobile number">—</span>;
  }

  return (
    <div className={`wa-menu-wrap${open ? " open" : ""}`} ref={ref}>
      <button
        type="button"
        className="action-icon action-wa"
        onClick={() => setOpen((v) => !v)}
        title="WhatsApp"
        aria-expanded={open}
      >
        <MessageCircle size={15} />
      </button>
      {open ? (
        <div className="wa-dropdown">
          {status === "expired" ? (
            <button type="button" className="wa-option wa-option-danger" onClick={() => openWhatsApp(expiredMemberMessage(name))}>
              <strong>Membership expired</strong>
              <span>Send renew &amp; train-more message</span>
            </button>
          ) : null}
          {status === "expiring" && days !== null && days >= 0 ? (
            <button type="button" className="wa-option wa-option-warning" onClick={() => openWhatsApp(expiringMemberMessage(name, days))}>
              <strong>{days === 0 ? "Expires today" : `${days} day${days === 1 ? "" : "s"} left`}</strong>
              <span>Send reminder on WhatsApp</span>
            </button>
          ) : null}
          {status === "active" ? (
            <button type="button" className="wa-option" onClick={() => openWhatsApp(`Hi ${name}, hope you're enjoying your workouts at our gym! Keep pushing — consistency is the key to results. 💪`)}>
              <strong>Motivation message</strong>
              <span>Encourage consistency &amp; results</span>
            </button>
          ) : null}
          <button type="button" className="wa-option" onClick={() => openWhatsApp("")}>
            <strong>Custom message</strong>
            <span>Open chat without pre-filled text</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
