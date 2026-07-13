"use client";

import { Bell, LogOut, Mail, Menu, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { logoutApi } from "../../lib/api/client";
import { moduleTitles, type ModuleKey } from "../../lib/config/nav";

type Props = {
  active: ModuleKey;
  query: string;
  userName: string;
  userRole: string;
  onQueryChange: (value: string) => void;
  onOpenSidebar: () => void;
};

export default function Topbar({ active, query, userName, userRole, onQueryChange, onOpenSidebar }: Props) {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutApi();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button type="button" className="menu-btn" onClick={onOpenSidebar} aria-label="Open menu">
          <Menu size={22} />
        </button>
        <div className="title-text">
          <h1>{moduleTitles[active]}</h1>
          <span className="welcome-text">Welcome back, {userName}</span>
        </div>
      </div>

      <div className="topbar-search">
        <Search size={18} className="search-icon" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search members, invoices, trainers..."
        />
      </div>

      <div className="topbar-actions">
        <button type="button" className="icon-btn ghost-icon" aria-label="Notifications">
          <Bell size={20} />
        </button>
        <button type="button" className="icon-btn ghost-icon topbar-extra" aria-label="Messages">
          <Mail size={20} />
        </button>
        <div className="avatar topbar-extra">{userName.slice(0, 1)}</div>
        <div className="user-meta topbar-extra">
          <b>{userName}</b>
          <small>{userRole}</small>
        </div>
        <button type="button" className="icon-btn logout-btn" onClick={handleLogout} title="Logout" aria-label="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
