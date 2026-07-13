import { jsonError, jsonOk, requireApiSession } from "../../../../lib/api/http";
import { deleteRecordService } from "../../../../lib/services/records";

type Params = { params: Promise<{ collection: string; id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await requireApiSession();
    const { collection, id } = await params;
    const result = await deleteRecordService(collection, id, session.name);
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}
