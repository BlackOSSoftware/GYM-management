"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { nav, type ModuleKey } from "../lib/config/nav";
import type { AnyDoc, AppData } from "../lib/types";
import { deleteRecordApi } from "../lib/api/client";
import { useAppData } from "../hooks/useAppData";
import { buildStats } from "../lib/utils/stats";
import { memberFromVisitor, searchAll } from "../lib/utils/search";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import Dashboard from "../components/dashboard/Dashboard";
import ModuleView from "../components/modules/ModuleView";
import MemberView from "../components/modules/MemberView";
import RecordModal from "../components/modals/RecordModal";
import ViewModal from "../components/modals/ViewModal";
import Reports from "../components/reports/Reports";
import SettingsView from "../components/settings/SettingsView";

const validModules = new Set<ModuleKey>(nav.map((n) => n.key).concat(["dashboard", "reports", "settings"]));

function moduleFromUrl(page: string | null): ModuleKey {
  if (page && validModules.has(page as ModuleKey)) return page as ModuleKey;
  return "dashboard";
}

export default function AdminApp({ initialData }: { initialData?: AppData }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, loading, error, refresh } = useAppData(initialData);

  const [active, setActive] = useState<ModuleKey>(() => moduleFromUrl(searchParams.get("page")));
  const [query, setQuery] = useState(() => searchParams.get("q") || "");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editing, setEditing] = useState<{ collection: string; record?: AnyDoc } | null>(null);
  const [viewing, setViewing] = useState<{ collection: string; record: AnyDoc } | null>(null);

  const stats = useMemo(() => (data ? buildStats(data) : null), [data]);
  const globalResults = useMemo(() => (data ? searchAll(data as any, query) : []), [data, query]);

  useEffect(() => {
    const page = moduleFromUrl(searchParams.get("page"));
    const q = searchParams.get("q") || "";
    setActive(page);
    setQuery(q);
  }, [searchParams]);

  const updateUrl = (key: ModuleKey, filter = "") => {
    const params = new URLSearchParams();
    if (key !== "dashboard") params.set("page", key);
    if (filter) params.set("q", filter);
    const next = params.toString() ? `/?${params.toString()}` : "/";
    router.replace(next, { scroll: false });
  };

  const navigate = (key: ModuleKey, filter = "") => {
    setActive(key);
    setQuery(filter);
    setSidebarOpen(false);
    updateUrl(key, filter);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    updateUrl(active, value);
  };

  useEffect(() => {
    document.body.classList.toggle("sidebar-locked", sidebarOpen);
    return () => document.body.classList.remove("sidebar-locked");
  }, [sidebarOpen]);

  if (loading && !data) {
    return <div className="loading-screen">Loading dashboard...</div>;
  }

  if (error && !data) {
    return <div className="loading-screen error">{error}</div>;
  }

  if (!data || !stats) return null;

  const handleDelete = async (collection: string, id: string) => {
    await deleteRecordApi(collection, id);
    await refresh();
  };

  return (
    <div className={`app-shell${sidebarOpen ? " sidebar-open" : ""}`}>
      <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      <Sidebar active={active} onNavigate={navigate} onClose={() => setSidebarOpen(false)} />
      <main className="main">
        <Topbar
          active={active}
          query={query}
          userName={data.session.name}
          userRole={data.session.role}
          onQueryChange={handleQueryChange}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
        {active === "dashboard" ? (
          <Dashboard
            data={data}
            stats={stats}
            query={query}
            results={globalResults}
            onNavigate={navigate}
            onEdit={(collection) => setEditing({ collection })}
            onView={(key, row) => { navigate(key); setViewing({ collection: key, record: row }); }}
            onRefresh={refresh}
          />
        ) : active === "members" ? (
          <MemberView
            records={data.members}
            onAdd={() => setEditing({ collection: active })}
            onEdit={(record) => setEditing({ collection: active, record })}
            onView={(record) => setViewing({ collection: active, record })}
            onDelete={(id) => handleDelete("members", id)}
          />
        ) : active === "reports" ? (
          <Reports data={data} />
        ) : active === "settings" ? (
          <SettingsView data={data} />
        ) : (
          <ModuleView
            collection={active}
            records={(data as any)[active]}
            query={query}
            onAdd={() => setEditing({ collection: active })}
            onEdit={(record) => setEditing({ collection: active, record })}
            onView={(record) => setViewing({ collection: active, record })}
            onConvert={(record) => setEditing({ collection: "members", record: memberFromVisitor(record) })}
            onDelete={handleDelete}
          />
        )}
      </main>
      {editing ? <RecordModal editing={editing} data={data} onClose={() => setEditing(null)} onSaved={refresh} /> : null}
      {viewing ? <ViewModal viewing={viewing} data={data} onClose={() => setViewing(null)} onEdit={() => { setEditing(viewing); setViewing(null); }} /> : null}
    </div>
  );
}
