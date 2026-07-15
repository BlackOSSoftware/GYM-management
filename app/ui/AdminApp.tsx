"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { nav, type ModuleKey } from "../lib/config/nav";
import type { AnyDoc, AppData } from "../lib/types";
import { deleteRecordApi, saveRecordApi } from "../lib/api/client";
import { useAppData } from "../hooks/useAppData";
import { useCapacitorBack } from "../hooks/useCapacitorBack";
import { buildStats } from "../lib/utils/stats";
import { memberFromVisitor, searchAll } from "../lib/utils/search";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import Dashboard from "../components/dashboard/Dashboard";
import ModuleView from "../components/modules/ModuleView";
import MemberView from "../components/modules/MemberView";
import VisitorView from "../components/modules/VisitorView";
import MembershipView from "../components/modules/MembershipView";
import TrainerView from "../components/modules/TrainerView";
import StaffView from "../components/modules/StaffView";
import PaymentView from "../components/modules/PaymentView";
import WorkoutView from "../components/modules/WorkoutView";
import DietView from "../components/modules/DietView";
import EquipmentView from "../components/modules/EquipmentView";
import RecordModal from "../components/modals/RecordModal";
import MembershipFormModal from "../components/modals/MembershipFormModal";
import RenewMemberModal from "../components/modals/RenewMemberModal";
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

  const updateUrl = (key: ModuleKey, filter = "", historyMode: "push" | "replace" = "push") => {
    const params = new URLSearchParams();
    if (key !== "dashboard") params.set("page", key);
    if (filter) params.set("q", filter);
    const next = params.toString() ? `/?${params.toString()}` : "/";
    if (historyMode === "replace") {
      router.replace(next, { scroll: false });
    } else {
      router.push(next, { scroll: false });
    }
  };

  const navigate = useCallback((key: ModuleKey, filter = "") => {
    setActive(key);
    setQuery(filter);
    setSidebarOpen(false);
    updateUrl(key, filter, "push");
  // eslint-disable-next-line react-hooks/exhaustive-deps -- router stable enough; updateUrl uses latest
  }, [router]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    updateUrl(active, value, "replace");
  };

  useEffect(() => {
    document.body.classList.toggle("sidebar-locked", sidebarOpen);
    return () => document.body.classList.remove("sidebar-locked");
  }, [sidebarOpen]);

  const closeOverlay = useCallback(() => {
    if (viewing) {
      setViewing(null);
      return true;
    }
    if (editing) {
      setEditing(null);
      return true;
    }
    if (sidebarOpen) {
      setSidebarOpen(false);
      return true;
    }
    return false;
  }, [viewing, editing, sidebarOpen]);

  const goDashboard = useCallback(() => {
    navigate("dashboard");
  }, [navigate]);

  useCapacitorBack({
    onCloseOverlay: closeOverlay,
    isRoot: active === "dashboard",
    onGoBack: goDashboard
  });

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

  const deactivatePerson = async (collection: "trainers" | "staff", record: AnyDoc) => {
    if (!record._id) return;
    const { _id, passwordHash, ...rest } = record;
    await saveRecordApi({
      collection,
      _id,
      ...rest,
      status: "Inactive"
    });
    await refresh();
  };

  const duplicateMembership = (record: AnyDoc) => {
    const { _id, createdAt, updatedAt, ...rest } = record;
    setEditing({
      collection: "memberships",
      record: {
        ...rest,
        name: `${record.name || "Plan"} (Copy)`
      }
    });
  };

  return (
    <div className={`app-shell${sidebarOpen ? " sidebar-open" : ""}`}>
      <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      <Sidebar active={active} onNavigate={navigate} onClose={() => setSidebarOpen(false)} />
      <main className="main">
        <Topbar
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
            payments={data.payments}
            onAdd={() => setEditing({ collection: active })}
            onEdit={(record) => setEditing({ collection: active, record })}
            onView={(record) => setViewing({ collection: active, record })}
            onDelete={(id) => handleDelete("members", id)}
            onOpenSidebar={() => setSidebarOpen(true)}
          />
        ) : active === "visitors" ? (
          <VisitorView
            records={data.visitors}
            members={data.members}
            onAdd={() => setEditing({ collection: active })}
            onEdit={(record) => setEditing({ collection: active, record })}
            onView={(record) => setViewing({ collection: active, record })}
            onConvert={(record) => setEditing({ collection: "members", record: memberFromVisitor(record) })}
            onDelete={(id) => handleDelete("visitors", id)}
          />
        ) : active === "memberships" ? (
          <MembershipView
            records={data.memberships}
            members={data.members}
            onAdd={() => setEditing({ collection: "memberships" })}
            onEdit={(record) => setEditing({ collection: "memberships", record })}
            onView={(record) => setViewing({ collection: "memberships", record })}
            onDelete={(id) => handleDelete("memberships", id)}
            onDuplicate={duplicateMembership}
          />
        ) : active === "trainers" ? (
          <TrainerView
            records={data.trainers}
            members={data.members}
            onAdd={() => setEditing({ collection: "trainers" })}
            onEdit={(record) => setEditing({ collection: "trainers", record })}
            onView={(record) => setViewing({ collection: "trainers", record })}
            onDelete={(id) => handleDelete("trainers", id)}
            onDeactivate={(record) => deactivatePerson("trainers", record)}
          />
        ) : active === "staff" ? (
          <StaffView
            records={data.staff}
            onAdd={() => setEditing({ collection: "staff" })}
            onEdit={(record) => setEditing({ collection: "staff", record })}
            onView={(record) => setViewing({ collection: "staff", record })}
            onDelete={(id) => handleDelete("staff", id)}
            onDeactivate={(record) => deactivatePerson("staff", record)}
          />
        ) : active === "payments" ? (
          <PaymentView
            records={data.payments}
            onAdd={() => setEditing({ collection: "payments" })}
            onEdit={(record) => setEditing({ collection: "payments", record })}
            onView={(record) => setViewing({ collection: "payments", record })}
            onDelete={(id) => handleDelete("payments", id)}
          />
        ) : active === "workouts" ? (
          <WorkoutView
            records={data.workouts}
            onAdd={() => setEditing({ collection: "workouts" })}
            onEdit={(record) => setEditing({ collection: "workouts", record })}
            onView={(record) => setViewing({ collection: "workouts", record })}
            onDelete={(id) => handleDelete("workouts", id)}
          />
        ) : active === "diets" ? (
          <DietView
            records={data.diets}
            onAdd={() => setEditing({ collection: "diets" })}
            onEdit={(record) => setEditing({ collection: "diets", record })}
            onView={(record) => setViewing({ collection: "diets", record })}
            onDelete={(id) => handleDelete("diets", id)}
          />
        ) : active === "equipment" ? (
          <EquipmentView
            records={data.equipment}
            onAdd={() => setEditing({ collection: "equipment" })}
            onEdit={(record) => setEditing({ collection: "equipment", record })}
            onView={(record) => setViewing({ collection: "equipment", record })}
            onDelete={(id) => handleDelete("equipment", id)}
          />
        ) : active === "reports" ? (
          <Reports data={data} />
        ) : active === "settings" ? (
          <SettingsView />
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
      {editing?.collection === "memberships" ? (
        <MembershipFormModal
          record={editing.record}
          onClose={() => setEditing(null)}
          onSaved={refresh}
        />
      ) : editing?.collection === "members" && editing.record?._renewMode ? (
        <RenewMemberModal
          member={editing.record}
          data={data}
          onClose={() => setEditing(null)}
          onSaved={refresh}
        />
      ) : editing ? (
        <RecordModal editing={editing} data={data} onClose={() => setEditing(null)} onSaved={refresh} />
      ) : null}
      {viewing ? (
        <ViewModal
          viewing={viewing}
          data={data}
          onClose={() => setViewing(null)}
          onEdit={() => { setEditing(viewing); setViewing(null); }}
          onDuplicate={
            viewing.collection === "memberships"
              ? () => { duplicateMembership(viewing.record); setViewing(null); }
              : undefined
          }
          onDelete={
            (
              viewing.collection === "memberships" ||
              viewing.collection === "trainers" ||
              viewing.collection === "staff" ||
              viewing.collection === "workouts" ||
              viewing.collection === "diets" ||
              viewing.collection === "equipment"
            ) && viewing.record._id
              ? async () => {
                  await handleDelete(viewing.collection, viewing.record._id!);
                  setViewing(null);
                }
              : undefined
          }
          onDeactivate={
            (viewing.collection === "trainers" || viewing.collection === "staff") && viewing.record._id
              ? async () => {
                  await deactivatePerson(viewing.collection as "trainers" | "staff", viewing.record);
                  setViewing(null);
                }
              : undefined
          }
        />
      ) : null}
    </div>
  );
}
