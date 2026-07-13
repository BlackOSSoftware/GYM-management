import { jsonError, jsonOk, requireApiSession } from "../../lib/api/http";
import { saveRecordService } from "../../lib/services/records";

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    const body = await request.json();
    const collection = String(body.collection || "");
    const id = String(body._id || "");
    const { collection: _c, _id: _i, ...payload } = body;
    const result = await saveRecordService(collection, payload, id, session.name);
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}
