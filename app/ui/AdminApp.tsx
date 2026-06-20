"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Apple,
  Bell,
  CalendarDays,
  Briefcase,
  CalendarClock,
  CreditCard,
  Dumbbell,
  Eye,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Plus,
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  Trash2,
  UserCog,
  UserPlus,
  Users,
  Wrench
} from "lucide-react";
import { deleteRecord, logoutAction, saveRecord, seedSampleData } from "../actions";
import type { AnyDoc, AppData } from "../lib/types";

type ModuleKey = "dashboard" | "members" | "visitors" | "memberships" | "trainers" | "staff" | "payments" | "workouts" | "diets" | "equipment" | "reports" | "settings";

const nav: { key: ModuleKey; label: string; icon: any }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "members", label: "Members", icon: Users },
  { key: "visitors", label: "Visitors", icon: UserPlus },
  { key: "memberships", label: "Memberships", icon: ShieldCheck },
  { key: "trainers", label: "Trainers", icon: UserCog },
  { key: "staff", label: "Staff", icon: Briefcase },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "workouts", label: "Workouts", icon: Dumbbell },
  { key: "diets", label: "Diet Plans", icon: Apple },
  { key: "equipment", label: "Equipment", icon: Wrench },
  { key: "reports", label: "Reports", icon: FileBarChart },
  { key: "settings", label: "Settings", icon: SettingsIcon }
];

const moduleTitles: Record<ModuleKey, string> = {
  dashboard: "Dashboard",
  members: "Member Management",
  visitors: "Visitor Management",
  memberships: "Membership Management",
  trainers: "Trainer Management",
  staff: "Staff & Access Control",
  payments: "Payment Management",
  workouts: "Workout Management",
  diets: "Diet Management",
  equipment: "Equipment Management",
  reports: "Reports & Analytics",
  settings: "Security & Activity Logs"
};

type SelectOption = string | { label: string; value: string };
type FieldConfig = { name: string; label: string; type?: string; options?: SelectOption[]; required?: boolean; readOnly?: boolean };

const fields: Record<string, FieldConfig[]> = {
  members: [
    { name: "memberId", label: "Member ID" }, { name: "name", label: "Full Name", required: true }, { name: "mobile", label: "Mobile", required: true },
    { name: "email", label: "Email", type: "email" }, { name: "gender", label: "Gender", options: ["Male", "Female", "Other"] },
    { name: "dob", label: "Date of Birth", type: "date" }, { name: "address", label: "Address" }, { name: "emergencyContact", label: "Emergency Contact" },
    { name: "membershipPlan", label: "Membership Plan", required: true }, { name: "planPrice", label: "Plan Price", type: "number", readOnly: true }, { name: "discount", label: "Discount", type: "number" }, { name: "billingAmount", label: "Final Billing Amount", type: "number", readOnly: true }, { name: "joiningDate", label: "Joining Date", type: "date" },
    { name: "startDate", label: "Start Date", type: "date", required: true }, { name: "expiryDate", label: "Expiry Date", type: "date", readOnly: true },
    { name: "status", label: "Status", options: ["Active", "Inactive", "Frozen"], required: true }, { name: "assignedTrainer", label: "Assigned Trainer" },
    { name: "workoutPlan", label: "Workout Plan" }, { name: "dietPlan", label: "Diet Plan" }, { name: "profilePhoto", label: "Profile Photo URL" }
  ],
  visitors: [
    { name: "visitorId", label: "Visitor ID" }, { name: "name", label: "Full Name", required: true }, { name: "mobile", label: "Mobile", required: true },
    { name: "email", label: "Email", type: "email" }, { name: "gender", label: "Gender", options: ["Male", "Female", "Other"] }, { name: "age", label: "Age", type: "number" },
    { name: "address", label: "Address" }, { name: "visitDate", label: "Visit Date", type: "date", required: true }, { name: "source", label: "Lead Source", options: ["Walk-in", "Referral", "Instagram", "Facebook", "Google", "Phone Call", "Website", "Other"] },
    { name: "interest", label: "Interest / Goal", options: ["Weight Loss", "Muscle Gain", "Strength Training", "Cardio", "General Fitness", "Personal Training", "Diet Consultation"] },
    { name: "preferredPlan", label: "Preferred Membership" }, { name: "preferredTrainer", label: "Preferred Trainer" },
    { name: "trialDate", label: "Trial Date", type: "date" }, { name: "followUpDate", label: "Follow Up Date", type: "date" },
    { name: "status", label: "Status", options: ["New", "Interested", "Follow Up", "Trial Booked", "Converted", "Not Interested"], required: true },
    { name: "remarks", label: "Remarks" }
  ],
  memberships: [
    { name: "name", label: "Plan Name", required: true }, { name: "durationDays", label: "Duration Days", type: "number", required: true }, { name: "price", label: "Price", type: "number", required: true },
    { name: "status", label: "Status", options: ["Active", "Inactive"], required: true }, { name: "description", label: "Description" }
  ],
  trainers: [
    { name: "name", label: "Full Name", required: true }, { name: "mobile", label: "Mobile", required: true }, { name: "email", label: "Email", type: "email" },
    { name: "address", label: "Address" }, { name: "experience", label: "Experience" }, { name: "specialization", label: "Specialization", required: true },
    { name: "salary", label: "Salary", type: "number" }, { name: "status", label: "Status", options: ["Active", "Inactive"], required: true }, { name: "profilePhoto", label: "Profile Photo URL" }
  ],
  staff: [
    { name: "name", label: "Full Name", required: true }, { name: "username", label: "Username", required: true }, { name: "password", label: "New Password", type: "password" },
    { name: "mobile", label: "Mobile" }, { name: "email", label: "Email", type: "email" }, { name: "address", label: "Address" },
    { name: "role", label: "Role", options: ["Super Administrator", "Manager", "Reception Staff", "Trainer"], required: true },
    { name: "salary", label: "Salary", type: "number" }, { name: "status", label: "Status", options: ["Active", "Inactive"], required: true }
  ],
  payments: [
    { name: "memberName", label: "Member Name", required: true }, { name: "invoiceNo", label: "Invoice Number" }, { name: "amount", label: "Amount", type: "number", required: true },
    { name: "method", label: "Method", options: ["Cash", "UPI", "Bank Transfer", "Credit Card", "Debit Card", "Card"], required: true },
    { name: "type", label: "Payment Type", options: ["Membership", "Membership Renewal", "Refund", "Pending Due"], required: true },
    { name: "status", label: "Status", options: ["Paid", "Pending", "Refunded"], required: true }, { name: "paymentDate", label: "Payment Date", type: "date", required: true }, { name: "notes", label: "Notes" }
  ],
  workouts: [
    { name: "name", label: "Plan Name", required: true }, { name: "category", label: "Category", options: ["Weight Loss", "Muscle Gain", "Strength Training", "Cardio", "Beginner", "Intermediate", "Advanced"], required: true },
    { name: "exerciseName", label: "Exercises" }, { name: "sets", label: "Sets", type: "number" }, { name: "repetitions", label: "Repetitions", type: "number" },
    { name: "duration", label: "Duration" }, { name: "restTime", label: "Rest Time" }, { name: "instructions", label: "Instructions" }, { name: "trainerNotes", label: "Trainer Notes" }, { name: "status", label: "Status", options: ["Active", "Inactive"], required: true }
  ],
  diets: [
    { name: "name", label: "Plan Name", required: true }, { name: "category", label: "Template", required: true }, { name: "breakfast", label: "Breakfast" }, { name: "lunch", label: "Lunch" },
    { name: "dinner", label: "Dinner" }, { name: "snacks", label: "Snacks" }, { name: "supplements", label: "Supplements" }, { name: "notes", label: "Nutrition Notes" },
    { name: "recommendations", label: "Trainer Recommendations" }, { name: "status", label: "Status", options: ["Active", "Inactive"], required: true }
  ],
  equipment: [
    { name: "name", label: "Equipment Name", required: true }, { name: "category", label: "Category", required: true }, { name: "purchaseDate", label: "Purchase Date", type: "date" },
    { name: "purchaseCost", label: "Purchase Cost", type: "number" }, { name: "vendor", label: "Vendor" },
    { name: "condition", label: "Condition", options: ["Excellent", "Good", "Needs Service", "Damaged"], required: true },
    { name: "availability", label: "Availability", options: ["Available", "In Use", "Under Maintenance"], required: true },
    { name: "maintenanceDate", label: "Next Maintenance", type: "date" }, { name: "serviceHistory", label: "Service / Repair Records" }, { name: "status", label: "Status", options: ["Active", "Inactive"] }
  ]
};

const tableColumns: Record<string, string[]> = {
  members: ["memberId", "name", "mobile", "membershipPlan", "billingAmount", "expiryDate", "status"],
  visitors: ["visitorId", "name", "mobile", "source", "preferredPlan", "followUpDate", "status"],
  memberships: ["name", "durationDays", "price", "status"],
  trainers: ["name", "mobile", "specialization", "experience", "salary", "status"],
  staff: ["name", "username", "role", "mobile", "status"],
  payments: ["invoiceNo", "memberName", "amount", "method", "status", "paymentDate"],
  workouts: ["name", "category", "exerciseName", "duration", "status"],
  diets: ["name", "category", "breakfast", "lunch", "status"],
  equipment: ["name", "category", "condition", "availability", "maintenanceDate", "status"]
};

function optionsFrom(rows: AnyDoc[], key = "name", formatter?: (row: AnyDoc) => SelectOption) {
  return rows.map((row) => formatter ? formatter(row) : row[key]).filter(Boolean);
}

function fieldsFor(collection: string, data: AppData) {
  return (fields[collection] || []).map((field) => {
    if (collection === "members" && field.name === "membershipPlan") return { ...field, options: optionsFrom(data.memberships, "name", (plan) => ({ value: plan.name, label: `${plan.name} - ${currency(Number(plan.price || 0))} / ${plan.durationDays || 0} days` })) };
    if (collection === "members" && field.name === "assignedTrainer") return { ...field, options: ["", ...optionsFrom(data.trainers)] };
    if (collection === "members" && field.name === "workoutPlan") return { ...field, options: ["", ...optionsFrom(data.workouts)] };
    if (collection === "members" && field.name === "dietPlan") return { ...field, options: ["", ...optionsFrom(data.diets)] };
    if (collection === "visitors" && field.name === "preferredPlan") return { ...field, options: ["", ...optionsFrom(data.memberships, "name", (plan) => ({ value: plan.name, label: `${plan.name} - ${currency(Number(plan.price || 0))}` }))] };
    if (collection === "visitors" && field.name === "preferredTrainer") return { ...field, options: ["", ...optionsFrom(data.trainers)] };
    if (collection === "payments" && field.name === "memberName") return { ...field, options: optionsFrom(data.members, "name", (member) => ({ value: member.name, label: `${member.name} - Due ${currency(Number(member.billingAmount || 0))}` })) };
    return field;
  });
}

function searchAll(data: AppData, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const collections: { key: ModuleKey; rows: AnyDoc[] }[] = [
    { key: "members", rows: data.members },
    { key: "visitors", rows: data.visitors },
    { key: "payments", rows: data.payments },
    { key: "trainers", rows: data.trainers },
    { key: "memberships", rows: data.memberships },
    { key: "workouts", rows: data.workouts },
    { key: "diets", rows: data.diets },
    { key: "equipment", rows: data.equipment },
    { key: "staff", rows: data.staff }
  ];
  return collections.flatMap(({ key, rows }) =>
    rows
      .filter((row) => searchableText(row).includes(q))
      .slice(0, 6)
      .map((row) => ({ key, row }))
  ).slice(0, 24);
}

export default function AdminApp({ data }: { data: AppData }) {
  const router = useRouter();
  const [active, setActive] = useState<ModuleKey>("dashboard");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<{ collection: string; record?: AnyDoc } | null>(null);
  const [viewing, setViewing] = useState<{ collection: string; record: AnyDoc } | null>(null);
  const [isPending, startTransition] = useTransition();
  const stats = useMemo(() => buildStats(data), [data]);
  const globalResults = useMemo(() => searchAll(data, query), [data, query]);

  const quick = [
    ["members", "Add Member", Users], ["visitors", "Add Visitor", UserPlus], ["memberships", "New Membership", ShieldCheck], ["payments", "Record Payment", CreditCard],
    ["workouts", "Workout Plan", Dumbbell], ["diets", "Diet Plan", Apple], ["equipment", "Add Equipment", Wrench], ["reports", "View Reports", FileBarChart]
  ] as const;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="logo"><span><Dumbbell size={28} /></span><strong>GYM<br /><small>MANAGEMENT</small></strong></div>
        <nav>{nav.map((item) => <button key={item.key} className={active === item.key ? "active" : ""} onClick={() => setActive(item.key)}><item.icon size={20} />{item.label}</button>)}</nav>
        <div className="health-card"><b>Stay Strong,<br />Stay Healthy!</b><Dumbbell size={44} /><button>View Progress</button></div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="title-row"><Menu size={22} /><h1>{moduleTitles[active]}</h1><span>Welcome back, {data.session.name}</span></div>
          <div className="search"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search members, invoices, trainers..." /></div>
          <div className="top-actions"><Bell size={20} /><Mail size={20} /><div className="avatar">A</div><div><b>{data.session.name}</b><small>{data.session.role}</small></div><form action={logoutAction}><button className="icon-btn" title="Logout"><LogOut size={18} /></button></form></div>
        </header>
        {active === "dashboard" ? (
          <Dashboard data={data} stats={stats} quick={quick} query={query} results={globalResults} setActive={setActive} setQuery={setQuery} setEditing={setEditing} setViewing={setViewing} />
        ) : active === "reports" ? (
          <Reports data={data} stats={stats} />
        ) : active === "settings" ? (
          <SettingsView data={data} />
        ) : (
          <ModuleView collection={active} records={(data as any)[active]} query={query} onDelete={(collection: string, id: string) => startTransition(async () => { await deleteRecord(collection, id); router.refresh(); })} onView={(record: AnyDoc) => setViewing({ collection: active, record })} onConvert={(record: AnyDoc) => setEditing({ collection: "members", record: memberFromVisitor(record) })} onEdit={(record: AnyDoc) => setEditing({ collection: active, record })} onAdd={() => setEditing({ collection: active })} />
        )}
      </main>
      {editing ? <RecordModal editing={editing} data={data} onClose={() => setEditing(null)} pending={isPending} startTransition={startTransition} refresh={() => router.refresh()} /> : null}
      {viewing ? <ViewModal viewing={viewing} data={data} onClose={() => setViewing(null)} onEdit={() => { setEditing(viewing); setViewing(null); }} /> : null}
    </div>
  );
}

function Dashboard({ data, stats, quick, query, results, setActive, setQuery, setEditing, setViewing }: any) {
  return (
    <div className="content">
      {query.trim() ? <GlobalSearchResults results={results} setActive={setActive} setViewing={setViewing} /> : null}
      <section className="stat-grid">{stats.cards.map((card: any) => <button className="stat-card stat-button" key={card.label} onClick={() => { setActive(card.target); setQuery(card.filter || ""); }}><span className={card.color}><card.icon size={27} /></span><div><p>{card.label}</p><b>{card.value}</b><small>{card.sub}</small></div></button>)}</section>
      <section className="dashboard-grid">
        <Panel title="Revenue Overview" action="This Month"><h2>{currency(stats.monthRevenue)}</h2><small className="green">+18.6% vs Last Month</small><div className="bar-chart">{stats.revenueBars.map((n: number, i: number) => <i key={i} style={{ height: `${Math.max(12, n)}%` }} />)}</div></Panel>
        <Panel title="Membership Expiry Overview"><div className="donut" style={{ background: `conic-gradient(#20c67a 0 ${stats.activePct}%, #ffc247 ${stats.activePct}% ${stats.activePct + stats.expiringPct}%, #ff8730 ${stats.activePct + stats.expiringPct}% ${stats.activePct + stats.expiringPct + 8}%, #ff4545 0)` }} /><ul className="legend"><li><b className="green-dot" />Active <span>{stats.activeMemberships}</span></li><li><b className="yellow-dot" />Expiring in 30 Days <span>{stats.expiring30}</span></li><li><b className="red-dot" />Expired <span>{stats.expiredMemberships}</span></li></ul></Panel>
        <Panel title="Quick Access"><div className="quick-grid">{quick.map(([key, label, Icon]: any) => <button key={label} onClick={() => key === "reports" ? setActive("reports") : setEditing({ collection: key })}><Icon size={24} />{label}</button>)}</div></Panel>
      </section>
      <section className="triple-grid"><MiniList title="Recent Member Registrations" rows={data.members.slice(0, 5)} columns={["name", "memberId", "status"]} /><MiniList title="Recent Payments" rows={data.payments.slice(0, 5)} columns={["memberName", "amount", "method"]} /><MiniList title="Upcoming Membership Expiries" rows={stats.upcoming} columns={["name", "membershipPlan", "expiryDate"]} /></section>
      {data.members.length === 0 ? <form action={seedSampleData} className="empty-seed"><button className="primary-btn">Load Sample Data</button></form> : null}
    </div>
  );
}

function ModuleView({ collection, records, query, onAdd, onEdit, onView, onConvert, onDelete }: any) {
  const filtered = records.filter((r: AnyDoc) => searchableText(r).includes(query.trim().toLowerCase()));
  return <div className="content"><div className="module-head"><div><h2>{moduleTitles[collection as ModuleKey]}</h2><p>{filtered.length} records found{query ? ` for "${query}"` : ""}</p></div><button className="primary-btn" onClick={onAdd}><Plus size={18} /> Add New</button></div><DataTable collection={collection} rows={filtered} onView={onView} onEdit={onEdit} onConvert={onConvert} onDelete={onDelete} /></div>;
}

function DataTable({ collection, rows, onEdit, onView, onConvert, onDelete }: any) {
  const columns = tableColumns[collection] || [];
  return <div className="table-card"><table><thead><tr>{columns.map((c: string) => <th key={c}>{label(c)}</th>)}<th>Actions</th></tr></thead><tbody>{rows.map((row: AnyDoc) => <tr key={row._id}>{columns.map((c: string) => <td key={c}>{formatValue(row[c], c)}</td>)}<td className="actions"><button onClick={() => onView(row)} title="View"><Eye size={15} /> View</button><button onClick={() => onEdit(row)}>Edit</button>{collection === "visitors" ? <button onClick={() => onConvert(row)}><UserPlus size={15} /> Convert</button> : null}<button className="danger" onClick={() => onDelete(collection, row._id!)}><Trash2 size={15} /></button>{collection === "payments" ? <button onClick={() => printInvoice(row)}>Invoice</button> : null}</td></tr>)}</tbody></table>{rows.length === 0 ? <div className="empty">No matching records.</div> : null}</div>;
}

function RecordModal({ editing, data, onClose, pending, startTransition, refresh }: any) {
  const config = fieldsFor(editing.collection, data);
  const today = new Date().toISOString().slice(0, 10);
  const initial = useMemo(() => {
    const record = editing.record || {};
    const out: Record<string, any> = {};
    for (const field of config) out[field.name] = record[field.name] ?? "";
    if (editing.collection === "members") {
      out.joiningDate ||= today;
      out.startDate ||= today;
      const plan = data.memberships.find((p: AnyDoc) => p.name === out.membershipPlan) || data.memberships[0];
      if (!out.membershipPlan && plan) out.membershipPlan = plan.name;
      if (plan) {
        out.planPrice = Number(plan.price || 0);
        out.billingAmount = Math.max(0, Number(plan.price || 0) - Number(out.discount || 0));
        out.expiryDate ||= calculateExpiry(out.startDate, Number(plan.durationDays || 30));
      }
    }
    if (editing.collection === "visitors") {
      out.visitDate ||= today;
      out.status ||= "New";
    }
    if (editing.collection === "payments") out.paymentDate ||= today;
    return out;
  }, [config, data.memberships, editing.collection, editing.record, today]);
  const [values, setValues] = useState<Record<string, any>>(initial);
  const [error, setError] = useState("");
  const changeValue = (name: string, value: string) => {
    setValues((current) => {
      const next = { ...current, [name]: value };
      if (editing.collection === "members") {
        const plan = data.memberships.find((p: AnyDoc) => p.name === (name === "membershipPlan" ? value : next.membershipPlan));
        if (plan) {
          next.planPrice = Number(plan.price || 0);
          next.billingAmount = Math.max(0, Number(plan.price || 0) - Number(next.discount || 0));
          if (next.startDate) next.expiryDate = calculateExpiry(next.startDate, Number(plan.durationDays || 30));
        }
      }
      if (editing.collection === "payments" && name === "memberName") {
        const member = data.members.find((m: AnyDoc) => m.name === value);
        if (member) next.amount = Number(member.billingAmount || member.planPrice || 0);
      }
      return next;
    });
  };
  return <div className="modal-backdrop"><form className="modal" action={(fd) => startTransition(async () => { setError(""); try { await saveRecord(fd); refresh(); onClose(); } catch (err: any) { setError(err?.message || "Record save failed"); } })}><div className="modal-head"><h2>{editing.record ? "Edit" : "Add"} {label(editing.collection)}</h2><button type="button" onClick={onClose}>x</button></div><input type="hidden" name="collection" value={editing.collection} /><input type="hidden" name="_id" value={editing.record?._id || ""} />{error ? <div className="form-error">{error}</div> : null}<div className="form-grid">{config.map((f) => <label key={f.name}><span className="field-label">{f.label}{f.required ? <i>*</i> : null}</span>{f.options ? <select name={f.name} required={f.required} value={values[f.name] ?? ""} onChange={(e) => changeValue(f.name, e.target.value)}><option value="" disabled={f.required}>Select {f.label}</option>{f.options.filter(Boolean).map((o) => <option key={optionValue(o)} value={optionValue(o)}>{optionLabel(o)}</option>)}</select> : <input name={f.name} type={f.type || "text"} required={f.required} readOnly={f.readOnly} min={f.type === "number" ? 0 : undefined} pattern={f.name === "mobile" ? "[0-9+\\-\\s]{8,15}" : undefined} value={values[f.name] ?? ""} onChange={(e) => changeValue(f.name, e.target.value)} />}</label>)}</div><div className="modal-actions"><button type="button" onClick={onClose}>Cancel</button><button className="primary-btn" disabled={pending}>{pending ? "Saving..." : "Save Record"}</button></div></form></div>;
}

function Reports({ data, stats }: { data: AppData; stats: any }) {
  const exportCsv = (name: string, rows: AnyDoc[]) => {
  const cols = Array.from(new Set(rows.flatMap((r: AnyDoc) => Object.keys(r).filter((k) => k !== "passwordHash"))));
    const csv = [cols.join(","), ...rows.map((r: AnyDoc) => cols.map((c: string) => JSON.stringify(r[c] ?? "")).join(","))].join("\n");
    download(`${name}.csv`, csv);
  };
  return <div className="content"><section className="report-grid"><Panel title="Membership Reports"><p>Active: {stats.activeMembers}</p><p>Inactive: {stats.inactiveMembers}</p><p>Expired: {stats.expiredMemberships}</p><p>Upcoming Renewal: {stats.expiring30}</p><button onClick={() => exportCsv("members-report", data.members)}>CSV Export</button></Panel><Panel title="Visitor Reports"><p>Total Visitors: {data.visitors.length}</p><p>Follow Ups: {data.visitors.filter((v: AnyDoc) => v.status === "Follow Up" || v.followUpDate).length}</p><p>Converted: {data.visitors.filter((v: AnyDoc) => v.status === "Converted").length}</p><button onClick={() => exportCsv("visitors-report", data.visitors)}>CSV Export</button></Panel><Panel title="Revenue Reports"><p>Daily Revenue: {currency(stats.todayRevenue)}</p><p>Monthly Revenue: {currency(stats.monthRevenue)}</p><p>Outstanding Dues: {currency(stats.pendingRevenue)}</p><button onClick={() => exportCsv("payments-report", data.payments)}>Excel/CSV Export</button></Panel><Panel title="Trainer Reports"><p>Total Trainers: {data.trainers.length}</p><p>Assignments: {data.members.filter((m: AnyDoc) => m.assignedTrainer).length}</p><button onClick={() => exportCsv("trainer-report", data.trainers)}>CSV Export</button></Panel><Panel title="Equipment Reports"><p>Inventory: {data.equipment.length}</p><p>Maintenance: {data.equipment.filter((e: AnyDoc) => e.availability === "Under Maintenance").length}</p><button onClick={() => exportCsv("equipment-report", data.equipment)}>CSV Export</button></Panel></section></div>;
}

function SettingsView({ data }: { data: AppData }) {
  return <div className="content"><section className="settings-grid"><Panel title="Access Control"><p>Role based staff accounts are managed from Staff module.</p><p>Current role: {data.session.role}</p><p>Session: Secure HTTP-only cookie</p></Panel><Panel title="Audit Logs"><div className="log-list">{data.logs.map((log) => <div key={log._id}><b>{log.action}</b><span>{log.entity}</span><small>{log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}</small></div>)}</div></Panel></section></div>;
}

function Panel({ title, action, children }: any) {
  return <div className="panel"><div className="panel-head"><h3>{title}</h3>{action ? <button>{action}</button> : null}</div>{children}</div>;
}

function MiniList({ title, rows, columns }: any) {
  return <Panel title={title}><div className="mini-list">{rows.map((r: AnyDoc) => <div key={r._id}>{columns.map((c: string, i: number) => <span key={c} className={i === 0 ? "main-text" : ""}>{formatValue(r[c], c)}</span>)}</div>)}</div></Panel>;
}

function GlobalSearchResults({ results, setActive, setViewing }: any) {
  return <section className="search-results"><div className="panel-head"><h3>Search Results</h3><span>{results.length} matches</span></div>{results.length ? <div className="result-grid">{results.map(({ key, row }: any) => <button key={`${key}-${row._id}`} onClick={() => { setActive(key); setViewing({ collection: key, record: row }); }}><small>{moduleTitles[key as ModuleKey]}</small><b>{row.name || row.memberName || row.invoiceNo || row.memberId}</b><span>{row.mobile || row.email || row.status || row.category || row.method}</span></button>)}</div> : <div className="empty">No result found. Try member name, mobile, invoice number, trainer or plan name.</div>}</section>;
}

function ViewModal({ viewing, data, onClose, onEdit }: any) {
  const { collection, record } = viewing;
  const memberPayments = collection === "members" ? data.payments.filter((p: AnyDoc) => p.memberName === record.name || p.memberId === record.memberId) : [];
  const trainer = collection === "members" ? data.trainers.find((t: AnyDoc) => t.name === record.assignedTrainer) : null;
  const workout = collection === "members" ? data.workouts.find((w: AnyDoc) => w.name === record.workoutPlan) : null;
  const diet = collection === "members" ? data.diets.find((d: AnyDoc) => d.name === record.dietPlan) : null;

  return <div className="modal-backdrop"><section className="modal view-modal"><div className="modal-head"><h2>{record.name || record.memberName || record.invoiceNo || label(collection)}</h2><button type="button" onClick={onClose}>x</button></div><div className="profile-top"><div className="profile-avatar">{(record.name || record.memberName || "G").slice(0, 1)}</div><div><h3>{record.name || record.memberName || record.invoiceNo}</h3><p>{moduleTitles[collection as ModuleKey]} • {record.status || "Active"}</p></div></div><div className="detail-grid">{Object.entries(record).filter(([key]) => !["_id", "passwordHash"].includes(key)).map(([key, value]) => <div key={key}><small>{label(key)}</small><span>{formatValue(value, key)}</span></div>)}</div>{collection === "members" ? <div className="linked-grid"><Panel title="Assigned Trainer">{trainer ? <DetailBlock row={trainer} keys={["name", "mobile", "specialization", "experience"]} /> : <p>No trainer assigned</p>}</Panel><Panel title="Workout Plan">{workout ? <DetailBlock row={workout} keys={["name", "category", "exerciseName", "duration"]} /> : <p>No workout assigned</p>}</Panel><Panel title="Diet Plan">{diet ? <DetailBlock row={diet} keys={["name", "category", "breakfast", "lunch", "dinner"]} /> : <p>No diet assigned</p>}</Panel><Panel title="Payment History">{memberPayments.length ? <div className="compact-list">{memberPayments.map((p: AnyDoc) => <div key={p._id}><b>{p.invoiceNo}</b><span>{currency(Number(p.amount || 0))}</span><small>{p.paymentDate}</small></div>)}</div> : <p>No payment recorded</p>}</Panel></div> : null}<div className="modal-actions"><button type="button" onClick={onClose}>Close</button><button className="primary-btn" type="button" onClick={onEdit}>Edit</button></div></section></div>;
}

function DetailBlock({ row, keys }: { row: AnyDoc; keys: string[] }) {
  return <div className="detail-block">{keys.map((key) => <p key={key}><small>{label(key)}</small><span>{formatValue(row[key], key)}</span></p>)}</div>;
}

function buildStats(data: AppData) {
  const now = new Date();
  const inDays = (date?: string) => date ? Math.ceil((new Date(date).getTime() - now.getTime()) / 86400000) : 9999;
  const activeMembers = data.members.filter((m) => m.status === "Active").length;
  const visitorFollowUps = data.visitors.filter((v) => v.status === "Follow Up" || v.followUpDate).length;
  const inactiveMembers = data.members.length - activeMembers;
  const expiredMemberships = data.members.filter((m) => inDays(m.expiryDate) < 0).length;
  const expiring30 = data.members.filter((m) => inDays(m.expiryDate) >= 0 && inDays(m.expiryDate) <= 30).length;
  const upcoming = data.members.filter((m) => inDays(m.expiryDate) >= 0).sort((a, b) => inDays(a.expiryDate) - inDays(b.expiryDate)).slice(0, 5);
  const paid = data.payments.filter((p) => p.status !== "Refunded");
  const monthRevenue = paid.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const pendingRevenue = data.payments.filter((p) => p.status === "Pending").reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const todayRevenue = paid.filter((p) => p.paymentDate === now.toISOString().slice(0, 10)).reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const activeMemberships = data.memberships.filter((m) => m.status === "Active").length || activeMembers;
  const total = Math.max(1, activeMembers + expiredMemberships + expiring30);
  return {
    activeMembers, inactiveMembers, expiredMemberships, expiring30, upcoming, monthRevenue, pendingRevenue, todayRevenue, activeMemberships,
    activePct: (activeMembers / total) * 100, expiringPct: (expiring30 / total) * 100,
    revenueBars: [12, 18, 42, 39, 68, 55, 48, 73, 86, 74, 79, 66, 92, 98],
    cards: [
      { label: "Total Members", value: data.members.length, sub: "All Members", icon: Users, color: "purple", target: "members", filter: "" },
      { label: "Active Members", value: activeMembers, sub: "Active Members", icon: Users, color: "green", target: "members", filter: "Active" },
      { label: "Inactive Members", value: inactiveMembers, sub: "Inactive Members", icon: UserCog, color: "orange", target: "members", filter: "Inactive" },
      { label: "Total Visitors", value: data.visitors.length, sub: "All Enquiries", icon: UserPlus, color: "blue", target: "visitors", filter: "" },
      { label: "Visitor Follow Ups", value: visitorFollowUps, sub: "Needs Follow Up", icon: CalendarDays, color: "yellow", target: "visitors", filter: "Follow Up" },
      { label: "Total Memberships", value: data.memberships.length, sub: "All Memberships", icon: ShieldCheck, color: "blue", target: "memberships", filter: "" },
      { label: "Active Memberships", value: activeMemberships, sub: "Active Memberships", icon: ShieldCheck, color: "green", target: "memberships", filter: "Active" },
      { label: "Expired Memberships", value: expiredMemberships, sub: "Expired", icon: CalendarClock, color: "red", target: "members", filter: "Inactive" },
      { label: "Upcoming Expiries", value: expiring30, sub: "Next 30 Days", icon: CalendarClock, color: "yellow", target: "members", filter: "" },
      { label: "Total Trainers", value: data.trainers.length, sub: "All Trainers", icon: UserCog, color: "purple", target: "trainers", filter: "" },
      { label: "Total Staff", value: data.staff.length, sub: "All Staff Members", icon: Briefcase, color: "blue", target: "staff", filter: "" },
      { label: "Revenue (This Month)", value: currency(monthRevenue), sub: "Total Revenue", icon: Activity, color: "green", target: "payments", filter: "Paid" }
    ]
  };
}

function label(key: string) { return key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()); }
function currency(n: number) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0); }
function formatValue(value: any, key: string) { if (value == null) return "-"; if (["amount", "price", "salary", "purchaseCost", "planPrice", "billingAmount"].includes(key)) return currency(Number(value)); return String(value); }
function searchableText(row: AnyDoc) { return Object.entries(row).filter(([key]) => !["passwordHash"].includes(key)).map(([, value]) => String(value ?? "")).join(" ").toLowerCase(); }
function optionValue(option: SelectOption) { return typeof option === "string" ? option : option.value; }
function optionLabel(option: SelectOption) { return typeof option === "string" ? option : option.label; }
function calculateExpiry(startDate: string, durationDays: number) { const date = new Date(startDate); if (Number.isNaN(date.getTime())) return ""; date.setDate(date.getDate() + durationDays); return date.toISOString().slice(0, 10); }
function memberFromVisitor(visitor: AnyDoc) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    name: visitor.name || "",
    mobile: visitor.mobile || "",
    email: visitor.email || "",
    gender: visitor.gender || "",
    address: visitor.address || "",
    membershipPlan: visitor.preferredPlan || "",
    assignedTrainer: visitor.preferredTrainer || "",
    joiningDate: today,
    startDate: today,
    status: "Active",
    discount: 0
  };
}
function download(filename: string, text: string) { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "text/csv" })); a.download = filename; a.click(); URL.revokeObjectURL(a.href); }
function printInvoice(payment: AnyDoc) { const html = `<h1>Gym Management Invoice</h1><p><b>Invoice:</b> ${payment.invoiceNo}</p><p><b>Member:</b> ${payment.memberName}</p><p><b>Amount:</b> ${currency(Number(payment.amount))}</p><p><b>Method:</b> ${payment.method}</p><p><b>Date:</b> ${payment.paymentDate || ""}</p>`; const w = window.open("", "_blank"); if (w) { w.document.write(html); w.print(); } }
