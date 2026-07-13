import type { ReactNode } from "react";
import { cn } from "../../lib/utils/cn";

type Props = {
  title: string;
  action?: string;
  children: ReactNode;
  className?: string;
};

/** Dashboard panel — keeps existing `.panel` styles for pixel-identical chrome. */
export default function Panel({ title, action, children, className }: Props) {
  return (
    <div className={cn("panel", className)}>
      <div className="panel-head">
        <h3>{title}</h3>
        {action ? <button type="button">{action}</button> : null}
      </div>
      {children}
    </div>
  );
}
