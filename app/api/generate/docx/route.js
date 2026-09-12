import { Packer } from "docx";
import { buildDocx } from "../../../../lib/docxBuilder";
import { validateAndNormalize } from "../../../../lib/validatePayload";

export async function POST(request) {
  try {
    const body = await request.json();
    const data = validateAndNormalize(body);
    const doc = await buildDocx(data);
    const buffer = await Packer.toBuffer(doc);

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="document.docx"`,
      },
    });
  } catch (err) {
    return Response.json({ ok: false, error: err.message || "Failed to generate document" }, { status: 400 });
  }
}
