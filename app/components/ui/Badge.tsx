import type { ReactNode } from "react";
import { cn } from "../../lib/utils/cn";

type Props = {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "primary";
  className?: string;
};

/** Status / membership badge — wraps existing visual tokens without redesign. */
export default function Badge({ children, tone = "neutral", className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold",
        tone === "neutral" && "bg-[color-mix(in_srgb,var(--muted)_12%,transparent)] text-[var(--muted)]",
        tone === "success" && "bg-[#d1fae5] text-[#047857]",
        tone === "warning" && "bg-[#ffedd5] text-[#c2410c]",
        tone === "danger" && "bg-[#fee2e2] text-[#b91c1c]",
        tone === "primary" && "bg-[var(--accent-soft)] text-[var(--primary)]",
        className
      )}
    >
      {children}
    </span>
  );
}
