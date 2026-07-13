import { jsonError, jsonOk, requireApiSession } from "../../lib/api/http";
import { loadAppDataService } from "../../lib/services/records";

export async function GET() {
  try {
    const session = await requireApiSession();
    const data = await loadAppDataService(session);
    return jsonOk(data);
  } catch (error) {
    return jsonError(error);
  }
}
