import {
  Activity,
  Apple,
  Briefcase,
  CalendarClock,
  CalendarDays,
  CreditCard,
  Dumbbell,
  FileBarChart,
  LayoutDashboard,
  Settings as SettingsIcon,
  ShieldCheck,
  UserCog,
  UserPlus,
  Users,
  Wrench
} from "lucide-react";

export type ModuleKey =
  | "dashboard"
  | "members"
  | "visitors"
  | "memberships"
  | "trainers"
  | "staff"
  | "payments"
  | "workouts"
  | "diets"
  | "equipment"
  | "reports"
  | "settings";

export const nav: { key: ModuleKey; label: string; icon: any }[] = [
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

export const moduleTitles: Record<ModuleKey, string> = {
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

export const quickActions = [
  ["members", "Add Member", Users],
  ["visitors", "Add Visitor", UserPlus],
  ["memberships", "New Membership", ShieldCheck],
  ["payments", "Record Payment", CreditCard],
  ["workouts", "Workout Plan", Dumbbell],
  ["diets", "Diet Plan", Apple],
  ["equipment", "Add Equipment", Wrench],
  ["reports", "View Reports", FileBarChart]
] as const;

export const statIcons = {
  Users,
  UserCog,
  UserPlus,
  ShieldCheck,
  CalendarClock,
  CalendarDays,
  Briefcase,
  Activity
};
