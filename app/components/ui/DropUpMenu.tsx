"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  anchorRef: React.RefObject<HTMLElement | null>;
  width?: number;
};

/** Fixed menu that opens upward above the anchor — avoids table scroll clipping */
export default function DropUpMenu({ open, onClose, children, className = "", anchorRef, width = 180 }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ bottom: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) {
      setPos(null);
      return;
    }
    const place = () => {
      const rect = anchorRef.current!.getBoundingClientRect();
      const left = Math.min(Math.max(8, rect.right - width), window.innerWidth - width - 8);
      setPos({
        bottom: Math.max(8, window.innerHeight - rect.top + 6),
        left
      });
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, anchorRef, width]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t)) return;
      if (anchorRef.current?.contains(t)) return;
      onClose();
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open, onClose, anchorRef]);

  if (!open || !pos) return null;

  return (
    <div
      ref={menuRef}
      className={`drop-up-menu ${className}`.trim()}
      style={{
        position: "fixed",
        bottom: pos.bottom,
        left: pos.left,
        width,
        zIndex: 9999
      }}
      role="menu"
    >
      {children}
    </div>
  );
}
