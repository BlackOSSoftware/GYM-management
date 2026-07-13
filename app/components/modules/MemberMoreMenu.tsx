"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { History, MessageCircle, MoreHorizontal, Pencil, RefreshCw, Trash2 } from "lucide-react";
import type { AnyDoc } from "../../lib/types";
import { smartMemberMessage, whatsappUrl } from "../../lib/utils/memberExpiry";

type Props = {
  member: AnyDoc;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onRenew: () => void;
  onDelete: () => void;
  onHistory: () => void;
};

export default function MemberMoreMenu({ member, open, onOpenChange, onEdit, onRenew, onDelete, onHistory }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ bottom: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!open || !btnRef.current) {
      setPos(null);
      return;
    }
    const place = () => {
      const rect = btnRef.current!.getBoundingClientRect();
      const width = 180;
      setPos({
        bottom: Math.max(8, window.innerHeight - rect.top + 6),
        left: Math.min(Math.max(8, rect.right - width), window.innerWidth - width - 8)
      });
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t)) return;
      onOpenChange(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open, onOpenChange]);

  const message = () => {
    const url = whatsappUrl(member.mobile, smartMemberMessage(member));
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    onOpenChange(false);
  };

  return (
    <div className="mm-more" ref={wrapRef}>
      <button
        ref={btnRef}
        type="button"
        className="mm-icon-btn"
        aria-label="More actions"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          onOpenChange(!open);
        }}
      >
        <MoreHorizontal size={16} />
      </button>
      <AnimatePresence>
        {open && pos ? (
          <motion.div
            className="mm-menu mm-menu-fixed"
            style={{ position: "fixed", bottom: pos.bottom, left: pos.left, width: 180, zIndex: 9999 }}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
          >
            <button type="button" onClick={() => { onEdit(); onOpenChange(false); }}><Pencil size={14} /> Edit</button>
            <button type="button" onClick={() => { onRenew(); onOpenChange(false); }}><RefreshCw size={14} /> Renew</button>
            <button type="button" onClick={() => { onHistory(); onOpenChange(false); }}><History size={14} /> History</button>
            <button type="button" onClick={message}><MessageCircle size={14} /> Message</button>
            <button type="button" className="danger" onClick={() => { onDelete(); onOpenChange(false); }}><Trash2 size={14} /> Delete</button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
