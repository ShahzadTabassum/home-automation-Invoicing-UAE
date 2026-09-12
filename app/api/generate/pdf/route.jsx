import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoiceDocument } from "../../../../lib/pdfBuilder";
import { validateAndNormalize } from "../../../../lib/validatePayload";

export async function POST(request) {
  try {
    const body = await request.json();
    const data = validateAndNormalize(body);
    const buffer = await renderToBuffer(<InvoiceDocument data={data} />);

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="document.pdf"`,
      },
    });
  } catch (err) {
    return Response.json({ ok: false, error: err.message || "Failed to generate document" }, { status: 400 });
  }
}
