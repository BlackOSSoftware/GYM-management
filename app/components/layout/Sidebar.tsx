"use client";

import { Dumbbell } from "lucide-react";
import { nav, type ModuleKey } from "../../lib/config/nav";
import { cn } from "../../lib/utils/cn";
import ThemeToggle from "./ThemeToggle";

type Props = {
  active: ModuleKey;
  onNavigate: (key: ModuleKey) => void;
  onClose: () => void;
};

export default function Sidebar({ active, onNavigate, onClose }: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="logo">
          <span className="logo-icon"><Dumbbell size={26} /></span>
          <div className="logo-text">
            <strong>GYM</strong>
            <small>MANAGEMENT</small>
          </div>
        </div>
        <button type="button" className="sidebar-close" onClick={onClose} aria-label="Close menu">×</button>
      </div>

      <div className="sidebar-label">Main Menu</div>
      <nav>
        {nav.map((item) => (
          <button
            key={item.key}
            type="button"
            className={cn(active === item.key && "active")}
            onClick={() => onNavigate(item.key)}
          >
            <span className="nav-icon"><item.icon size={18} /></span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <ThemeToggle />
      </div>
    </aside>
  );
}
