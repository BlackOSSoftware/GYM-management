"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger" | "soft";
  children: ReactNode;
};

/**
 * Pixel-matched to existing .primary-btn / ghost actions.
 * Prefer this for new call sites; existing className="primary-btn" still works via CSS.
 */
export default function Button({ variant = "primary", className, children, type = "button", ...rest }: Props) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-extrabold transition-opacity disabled:opacity-60",
        variant === "primary" && "primary-btn",
        variant === "ghost" && "rounded-lg border border-[var(--line)] bg-[var(--panel)] px-[18px] py-3 text-[var(--ink)]",
        variant === "danger" && "rounded-lg border border-[color-mix(in_srgb,var(--danger)_30%,var(--line))] bg-[var(--panel)] px-[18px] py-3 text-[var(--danger)]",
        variant === "soft" && "rounded-lg border-0 bg-[var(--accent-soft)] px-[18px] py-3 text-[var(--primary)]",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
