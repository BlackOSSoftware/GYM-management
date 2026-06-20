export type Role = "Super Administrator" | "Manager" | "Reception Staff" | "Trainer";

export type AnyDoc = Record<string, any> & {
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AppData = {
  session: { name: string; email: string; role: Role };
  members: AnyDoc[];
  visitors: AnyDoc[];
  memberships: AnyDoc[];
  trainers: AnyDoc[];
  staff: AnyDoc[];
  payments: AnyDoc[];
  workouts: AnyDoc[];
  diets: AnyDoc[];
  equipment: AnyDoc[];
  logs: AnyDoc[];
};
