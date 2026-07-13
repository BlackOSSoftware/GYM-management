import type { ReactNode } from "react";
import { cn } from "../../lib/utils/cn";

type Props = {
  children?: ReactNode;
  className?: string;
};

/** Matches existing `.empty` / module empty states. */
export default function EmptyState({ children = "No records found.", className }: Props) {
  return <div className={cn("empty", className)}>{children}</div>;
}
