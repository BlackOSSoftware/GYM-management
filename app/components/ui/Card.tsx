import type { ReactNode } from "react";
import { cn } from "../../lib/utils/cn";

type Props = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Existing `.panel` chrome — classes keep pixel-identical styling. */
export default function Card({ title, action, children, className }: Props) {
  return (
    <div className={cn("panel", className)}>
      <div className="panel-head">
        <h3>{title}</h3>
        {action ?? null}
      </div>
      {children}
    </div>
  );
}
