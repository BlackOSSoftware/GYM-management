import "server-only";
import bcrypt from "bcryptjs";
import { cleanDoc, getDb, logActivity, seedDefaultAdmin, toId } from "../db";
import { calculateExpiryFromPlan, planIncludesTrainer, normalizeMembershipPlan } from "../utils/membership";

export const ALLOWED_COLLECTIONS = new Set([
  "members",
  "visitors",
  "memberships",
  "trainers",
  "staff",
  "payments",
  "workouts",
  "diets",
  "equipment"
]);

const requiredFields: Record<string, string[]> = {
  members: ["name", "mobile", "membershipPlan", "startDate", "status"],
  visitors: ["name", "mobile", "visitDate", "status"],
  memberships: ["name", "durationType", "durationValue", "trainerIncluded", "price", "status"],
  trainers: ["name", "mobile", "specialization", "status"],
  staff: ["name", "designation", "status"],
  payments: ["memberName", "amount", "method", "type", "status", "paymentDate"],
  workouts: ["name", "category", "exerciseName", "status"],
  diets: ["name", "category", "status"],
  equipment: ["name", "category", "condition", "availability", "status"]
};

function normalizePayload(input: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null || value === "") continue;
    if (["price", "amount", "salary", "purchaseCost", "durationDays", "durationValue", "sets", "repetitions", "age", "discount", "planPrice", "billingAmount"].includes(key)) {
      out[key] = Number(value);
    } else {
      out[key] = typeof value === "string" ? value.trim() : value;
    }
  }
  return out;
}

function assertValid(collection: string, payload: Record<string, any>, _isNew: boolean) {
  const missing = (requiredFields[collection] || []).filter((key) => payload[key] === undefined || payload[key] === "");
  if (collection === "staff" && payload.designation === "Other" && !payload.customDesignation) {
    missing.push("customDesignation");
  }
  if (missing.length) throw new Error(`Required fields missing: ${missing.join(", ")}`);

  if (payload.mobile && !/^[0-9+\-\s]{8,15}$/.test(payload.mobile)) throw new Error("Mobile number is not valid");
  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) throw new Error("Email is not valid");
  for (const key of ["price", "amount", "salary", "purchaseCost", "durationDays", "durationValue", "age"]) {
    if (payload[key] !== undefined && (!Number.isFinite(payload[key]) || payload[key] < 0)) {
      throw new Error(`${key} must be a valid positive number`);
    }
  }
}

async function enrichPayload(collection: string, payload: Record<string, any>, id: string) {
  const db = await getDb();

  if (collection === "members") {
    if (!payload.memberId && !id) {
      const count = await db.collection("members").countDocuments();
      payload.memberId = `M-${String(1001 + count).padStart(4, "0")}`;
    }
    if (payload.membershipPlan) {
      const plan = await db.collection("memberships").findOne({ name: payload.membershipPlan });
      if (plan) {
        payload.planPrice = Number(plan.price || 0);
        const { durationType, durationValue } = normalizeMembershipPlan(plan);
        payload.membershipDurationType = durationType;
        payload.membershipDurationValue = durationValue;
        if (!planIncludesTrainer(plan)) payload.assignedTrainer = "";
      }
    }
    payload.discount = Number(payload.discount || 0);
    if (payload.planPrice !== undefined) {
      payload.billingAmount = Math.max(0, Number(payload.planPrice || 0) - payload.discount);
    }
    if (!payload.startDate && !id) {
      payload.startDate = new Date().toISOString().slice(0, 10);
    }
    if (payload.membershipPlan && payload.startDate) {
      const plan = await db.collection("memberships").findOne({ name: payload.membershipPlan });
      if (plan) payload.expiryDate = calculateExpiryFromPlan(payload.startDate, plan);
    }
  }

  if (collection === "memberships") {
    if (payload.durationType === "Days") {
      payload.durationDays = Number(payload.durationValue || 0);
    }
  }

  if (collection === "visitors") {
    if (!payload.visitorId && !id) {
      const count = await db.collection("visitors").countDocuments();
      payload.visitorId = `V-${String(1001 + count).padStart(4, "0")}`;
    }
    if (!payload.visitDate) payload.visitDate = new Date().toISOString().slice(0, 10);
  }

  if (collection === "payments" && payload.memberName) {
    const member = await db.collection("members").findOne({ name: payload.memberName });
    if (member) payload.memberId = member.memberId;
  }
}

export async function saveRecordService(collection: string, body: Record<string, any>, id: string, actor: string) {
  if (!ALLOWED_COLLECTIONS.has(collection)) throw new Error("Invalid collection");

  const db = await getDb();
  const payload = normalizePayload(body);
  payload.updatedAt = new Date();
  assertValid(collection, payload, !id);
  await enrichPayload(collection, payload, id);

  if (collection === "staff" && payload.username) {
    const existing = await db.collection("staff").findOne({ username: payload.username });
    if (existing && existing._id.toString() !== id) throw new Error("Username already exists");
  }

  if (collection === "members" && payload.memberId) {
    const existing = await db.collection("members").findOne({ memberId: payload.memberId });
    if (existing && existing._id.toString() !== id) throw new Error("Member ID already exists");
  }

  if (collection === "staff" && payload.password) {
    payload.passwordHash = await bcrypt.hash(payload.password, 10);
    delete payload.password;
  }

  if (collection === "payments" && !payload.invoiceNo) {
    payload.invoiceNo = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
  }

  if (id) {
    await db.collection(collection).updateOne({ _id: toId(id) }, { $set: payload });
    await logActivity("Update", collection, `${collection} record updated`, actor);
    return { ok: true, id };
  }

  payload.createdAt = new Date();
  const result = await db.collection(collection).insertOne(payload);
  await logActivity("Create", collection, `${collection} record created`, actor);
  return { ok: true, id: result.insertedId.toString() };
}

export async function deleteRecordService(collection: string, id: string, actor: string) {
  if (!ALLOWED_COLLECTIONS.has(collection)) throw new Error("Invalid collection");
  const db = await getDb();
  await db.collection(collection).deleteOne({ _id: toId(id) });
  await logActivity("Delete", collection, `${collection} record deleted`, actor);
  return { ok: true };
}

import type { Role } from "../types";

export async function loadAppDataService(session: { name: string; email: string; role: Role }) {
  const db = await getDb();
  const read = async (name: string, sort: Record<string, 1 | -1> = { createdAt: -1 }) =>
    cleanDoc(await db.collection(name).find({}).sort(sort).limit(name === "activityLogs" ? 50 : 500).toArray());

  return {
    session,
    members: await read("members"),
    visitors: await read("visitors"),
    memberships: await read("memberships"),
    trainers: await read("trainers"),
    staff: await read("staff"),
    payments: await read("payments"),
    workouts: await read("workouts"),
    diets: await read("diets"),
    equipment: await read("equipment"),
    logs: await read("activityLogs")
  };
}

export async function seedSampleDataService(actor: string) {
  const db = await getDb();
  await seedDefaultAdmin();
  const memberCount = await db.collection("members").countDocuments();
  if (memberCount > 0) return { ok: true, seeded: false };

  const now = new Date();
  const addDays = (n: number) => new Date(now.getTime() + n * 86400000).toISOString().slice(0, 10);
  await db.collection("memberships").insertMany([
    { name: "Daily Membership", durationType: "Days", durationValue: 1, durationDays: 1, trainerIncluded: "Without Trainer", price: 200, status: "Active", createdAt: now, updatedAt: now },
    { name: "Monthly Membership", durationType: "Months", durationValue: 1, durationDays: 30, trainerIncluded: "Without Trainer", price: 3000, status: "Active", createdAt: now, updatedAt: now },
    { name: "Quarterly Membership", durationType: "Months", durationValue: 3, durationDays: 90, trainerIncluded: "Without Trainer", price: 8000, status: "Active", createdAt: now, updatedAt: now },
    { name: "Annual Membership", durationType: "Months", durationValue: 12, durationDays: 365, trainerIncluded: "Without Trainer", price: 25000, status: "Active", createdAt: now, updatedAt: now },
    { name: "Personal Training Monthly", durationType: "Months", durationValue: 1, durationDays: 30, trainerIncluded: "With Trainer", price: 6000, status: "Active", createdAt: now, updatedAt: now }
  ]);
  await db.collection("trainers").insertMany([
    { name: "Amit Verma", mobile: "9988776655", email: "amit@gym.local", specialization: "Strength Training", experience: "6 Years", salary: 45000, status: "Active", createdAt: now, updatedAt: now },
    { name: "Neha Patel", mobile: "9870012345", email: "neha@gym.local", specialization: "Weight Loss", experience: "4 Years", salary: 38000, status: "Active", createdAt: now, updatedAt: now }
  ]);
  await db.collection("members").insertMany([
    { memberId: "M-1001", name: "Rahul Sharma", mobile: "9876543210", email: "rahul@example.com", gender: "Male", joiningDate: addDays(-20), startDate: addDays(-20), expiryDate: addDays(8), membershipPlan: "Monthly Membership", status: "Active", assignedTrainer: "Amit Verma", workoutPlan: "Strength Starter", dietPlan: "High Protein", emergencyContact: "9876543211", address: "Delhi", createdAt: now, updatedAt: now },
    { memberId: "M-1002", name: "Priya Singh", mobile: "9123456780", email: "priya@example.com", gender: "Female", joiningDate: addDays(-45), startDate: addDays(-45), expiryDate: addDays(-2), membershipPlan: "Monthly Membership", status: "Inactive", assignedTrainer: "Neha Patel", workoutPlan: "Weight Loss", dietPlan: "Balanced Diet", emergencyContact: "9123456781", address: "Noida", createdAt: now, updatedAt: now },
    { memberId: "M-1003", name: "Karan Singh", mobile: "9888776655", email: "karan@example.com", gender: "Male", joiningDate: addDays(-10), startDate: addDays(-10), expiryDate: addDays(5), membershipPlan: "Quarterly Membership", status: "Active", assignedTrainer: "Amit Verma", workoutPlan: "Muscle Gain", dietPlan: "Lean Bulk", emergencyContact: "9888776656", address: "Gurgaon", createdAt: now, updatedAt: now }
  ]);
  await db.collection("visitors").insertMany([
    { visitorId: "V-1001", name: "Rohit Gupta", mobile: "9000011111", email: "rohit@example.com", visitDate: addDays(0), source: "Walk-in", interest: "Monthly Membership", preferredPlan: "Monthly Membership", preferredTrainer: "Amit Verma", followUpDate: addDays(2), status: "Interested", remarks: "Asked for evening batch.", createdAt: now, updatedAt: now },
    { visitorId: "V-1002", name: "Sneha Agarwal", mobile: "9000022222", email: "sneha@example.com", visitDate: addDays(-1), source: "Referral", interest: "Weight Loss", preferredPlan: "Quarterly Membership", preferredTrainer: "Neha Patel", followUpDate: addDays(1), status: "Follow Up", remarks: "Wants diet consultation.", createdAt: now, updatedAt: now }
  ]);
  await db.collection("payments").insertMany([
    { memberName: "Rahul Sharma", invoiceNo: "INV-2026-1050", amount: 5000, method: "UPI", type: "Membership Renewal", status: "Paid", paymentDate: addDays(-1), createdAt: now, updatedAt: now },
    { memberName: "Priya Singh", invoiceNo: "INV-2026-1049", amount: 3000, method: "Card", type: "Membership", status: "Paid", paymentDate: addDays(-2), createdAt: now, updatedAt: now }
  ]);
  await db.collection("workouts").insertOne({ name: "Strength Starter", category: "Beginner", exerciseName: "Squat, Bench Press, Row", sets: 4, repetitions: 10, duration: "45 min", restTime: "60 sec", instructions: "Warm up first and keep form strict.", status: "Active", createdAt: now, updatedAt: now });
  await db.collection("diets").insertOne({ name: "High Protein", category: "Muscle Gain", breakfast: "Eggs and oats", lunch: "Rice, dal, chicken/paneer", dinner: "Salad and protein", snacks: "Fruit and nuts", supplements: "Whey optional", notes: "Hydrate well.", status: "Active", createdAt: now, updatedAt: now });
  await db.collection("equipment").insertOne({ name: "Treadmill", category: "Cardio", purchaseDate: addDays(-200), purchaseCost: 75000, vendor: "FitPro", condition: "Good", availability: "Available", maintenanceDate: addDays(20), status: "Active", createdAt: now, updatedAt: now });
  await logActivity("Seed", "System", "Sample gym data created", actor);
  return { ok: true, seeded: true };
}
