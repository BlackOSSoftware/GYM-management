import "server-only";
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "gym_management";

if (!uri) {
  throw new Error("MONGODB_URI is missing");
}
const mongoUri = uri;

let clientPromise: Promise<MongoClient> | undefined;

export function getClient() {
  if (!clientPromise) {
    clientPromise = new MongoClient(mongoUri).connect();
  }
  return clientPromise;
}

export async function getDb() {
  const client = await getClient();
  return client.db(dbName);
}

export function toId(id: string) {
  if (!ObjectId.isValid(id)) throw new Error("Invalid id");
  return new ObjectId(id);
}

export function cleanDoc<T extends Record<string, any>>(doc: T) {
  return JSON.parse(
    JSON.stringify(doc, (_key, value) => {
      if (value instanceof ObjectId) return value.toString();
      return value;
    })
  );
}

export async function seedDefaultAdmin() {
  const db = await getDb();
  const users = db.collection("staff");
  const existing = await users.findOne({ username: "admin" });
  if (existing) return;

  await users.insertOne({
    name: "Admin",
    username: "admin",
    email: "admin@gym.local",
    mobile: "9999999999",
    role: "Super Administrator",
    status: "Active",
    passwordHash: await bcrypt.hash("admin", 10),
    permissions: ["all"],
    salary: 0,
    address: "Main Office",
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

export async function logActivity(action: string, entity: string, details: string, user = "Admin") {
  const db = await getDb();
  await db.collection("activityLogs").insertOne({
    action,
    entity,
    details,
    user,
    createdAt: new Date()
  });
}
