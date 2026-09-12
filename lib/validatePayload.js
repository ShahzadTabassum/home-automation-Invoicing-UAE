export function validateAndNormalize(body) {
  const docType = body.docType === "invoice" ? "invoice" : "quotation";

  const items = Array.isArray(body.items)
    ? body.items
        .map((it) => ({
          description: String(it.description || "").trim(),
          price: Number(it.price) || 0,
          qty: Number(it.qty) || 0,
        }))
        .filter((it) => it.description.length > 0)
    : [];

  if (items.length === 0) {
    throw new Error("At least one item with a description is required.");
  }

  return {
    docType,
    customerName: String(body.customerName || "").trim(),
    customerTRN: String(body.customerTRN || "").trim(),
    site: String(body.site || "").trim(),
    date: String(body.date || "").trim(),
    refNo: String(body.refNo || "").trim(),
    companyTRN: String(body.companyTRN || "").trim(),
    vatPercent: Number(body.vatPercent) || 0,
    items,
    terms: Array.isArray(body.terms) ? body.terms.map((t) => String(t)) : [],
    signatory: String(body.signatory || "").trim(),
    signatoryPhone: String(body.signatoryPhone || "").trim(),
  };
}
