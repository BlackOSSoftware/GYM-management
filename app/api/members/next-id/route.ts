import { jsonError, jsonOk, requireApiSession } from "../../../lib/api/http";
import { getDb } from "../../../lib/db";
import { previewMemberId } from "../../../lib/utils/membership";

export async function GET() {
  try {
    await requireApiSession();
    const db = await getDb();
    const count = await db.collection("members").countDocuments();
    return jsonOk({ memberId: previewMemberId(count) });
  } catch (error) {
    return jsonError(error);
  }
}
