import { NextResponse } from "next/server";
import { getSession } from "../auth";

export async function requireApiSession() {
  const session = await getSession();
  if (!session) {
    throw new ApiError("Unauthorized", 401);
  }
  return session;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  const message = error instanceof Error ? error.message : "Server error";
  return NextResponse.json({ error: message }, { status: 500 });
}
