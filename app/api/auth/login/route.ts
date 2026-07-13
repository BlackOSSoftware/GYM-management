import { jsonError, jsonOk } from "../../../lib/api/http";
import { login } from "../../../lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.username || "").trim();
    const password = String(body.password || "").trim();
    const result = await login(username, password);
    if (!result.ok) {
      return jsonOk({ ok: false, message: result.message }, 401);
    }
    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
