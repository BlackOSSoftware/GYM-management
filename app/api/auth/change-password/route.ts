import { changePassword } from "../../../lib/auth";
import { jsonError, jsonOk, requireApiSession } from "../../../lib/api/http";

export async function POST(request: Request) {
  try {
    await requireApiSession();
    const body = await request.json();
    const result = await changePassword(
      String(body.oldPassword || ""),
      String(body.newPassword || "")
    );
    if (!result.ok) {
      return jsonOk({ ok: false, message: result.message }, 400);
    }
    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
