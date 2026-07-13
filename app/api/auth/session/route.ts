import { jsonError, jsonOk } from "../../../lib/api/http";
import { getSession } from "../../../lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return jsonOk({ session: null }, 401);
    return jsonOk({ session });
  } catch (error) {
    return jsonError(error);
  }
}
