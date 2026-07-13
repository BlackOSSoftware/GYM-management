import { jsonError, jsonOk, requireApiSession } from "../../../lib/api/http";
import { getDb } from "../../../lib/db";
import { previewVisitorId } from "../../../lib/utils/membership";

export async function GET() {
  try {
    await requireApiSession();
    const db = await getDb();
    const count = await db.collection("visitors").countDocuments();
    return jsonOk({ visitorId: previewVisitorId(count) });
  } catch (error) {
    return jsonError(error);
  }
}
