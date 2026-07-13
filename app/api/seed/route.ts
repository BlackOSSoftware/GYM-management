import { jsonError, jsonOk, requireApiSession } from "../../lib/api/http";
import { seedSampleDataService } from "../../lib/services/records";

export async function POST() {
  try {
    const session = await requireApiSession();
    const result = await seedSampleDataService(session.name);
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}
