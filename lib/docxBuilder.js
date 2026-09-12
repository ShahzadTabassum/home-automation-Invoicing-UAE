import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  VerticalAlign,
  ImageRun,
  Header,
  Footer,
} from "docx";
import fs from "fs";
import path from "path";
import { COMPANY } from "./company";
import { amountToWords } from "./numberToWords";

const BRAND = "1D9CC5";
const BRAND_DARK = "12667F";
const INK = "12222B";

const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: "000000" };
const cellBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

let cachedLogoBuffer = null;
function getLogoBuffer() {
  if (!cachedLogoBuffer) {
    cachedLogoBuffer = fs.readFileSync(path.join(process.cwd(), "public", "logo-icon.png"));
  }
  return cachedLogoBuffer;
}

function buildHeader(isInvoice) {
  const logoBuffer = getLogoBuffer();
  const table = new Table({
    width: { size: 10800, type: WidthType.DXA },
    columnWidths: [1600, 6600, 2600],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 1600, type: WidthType.DXA },
            borders: noBorders,
            shading: { type: ShadingType.CLEAR, fill: BRAND },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new ImageRun({
                    data: logoBuffer,
                    transformation: { width: 50, height: 34 },
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 6600, type: WidthType.DXA },
            borders: noBorders,
            shading: { type: ShadingType.CLEAR, fill: BRAND },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                children: [new TextRun({ text: COMPANY.nameEn, bold: true, color: "FFFFFF", size: 30 })],
              }),
              new Paragraph({
                children: [new TextRun({ text: COMPANY.nameAr, color: "EAF7FC", size: 20 })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 2600, type: WidthType.DXA },
            borders: noBorders,
            shading: { type: ShadingType.CLEAR, fill: BRAND },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                shading: { type: ShadingType.CLEAR, fill: BRAND_DARK },
                children: [
                  new TextRun({
                    text: isInvoice ? "TAX INVOICE" : "QUOTATION",
                    bold: true,
                    color: "FFFFFF",
                    size: 22,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  return new Header({
    children: [
      table,
      new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 24, color: BRAND_DARK } },
        children: [],
      }),
      new Paragraph({ text: "" }),
    ],
  });
}

function buildFooter() {
  const table = new Table({
    width: { size: 10800, type: WidthType.DXA },
    columnWidths: [3600, 3600, 3600],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 3600, type: WidthType.DXA },
            borders: noBorders,
            shading: { type: ShadingType.CLEAR, fill: INK },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: `☏ ${COMPANY.phone}`, color: "FFFFFF", size: 16 })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 3600, type: WidthType.DXA },
            borders: noBorders,
            shading: { type: ShadingType.CLEAR, fill: INK },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: `✉ ${COMPANY.email}`, color: "FFFFFF", size: 16 })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 3600, type: WidthType.DXA },
            borders: noBorders,
            shading: { type: ShadingType.CLEAR, fill: INK },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: `⌂ ${COMPANY.location}`, color: "FFFFFF", size: 16 })],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  return new Footer({
    children: [
      new Paragraph({
        border: { top: { style: BorderStyle.SINGLE, size: 24, color: BRAND } },
        children: [],
      }),
      table,
    ],
  });
}

function cell(text, opts = {}) {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    borders: cellBorders,
    columnSpan: opts.colSpan,
    shading: opts.shade ? { type: ShadingType.CLEAR, fill: opts.shade } : undefined,
    children: [
      new Paragraph({
        alignment: opts.align || AlignmentType.LEFT,
        children: [new TextRun({ text: String(text), bold: !!opts.bold, size: 20 })],
      }),
    ],
  });
}

function multiLineCell(lines, opts = {}) {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    borders: cellBorders,
    columnSpan: opts.colSpan,
    children: (lines.length ? lines : [""]).map(
      (l) =>
        new Paragraph({
          alignment: opts.align || AlignmentType.LEFT,
          children: [new TextRun({ text: l, bold: !!opts.bold, size: 20 })],
        })
    ),
  });
}

function fmt(n) {
  return (Math.round((n + Number.EPSILON) * 100) / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export async function buildDocx(data) {
  const { docType, customerName, customerTRN, site, date, refNo, companyTRN, items, terms, signatory, signatoryPhone, vatPercent } = data;

  const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
  const vatAmount = subtotal * (vatPercent / 100);
  const grandTotal = subtotal + vatAmount;

  const isInvoice = docType === "invoice";
  const colWidths = [700, 4200, 1300, 1600, 1900];
  const tableWidth = colWidths.reduce((a, b) => a + b, 0);

  const headerParagraphs = [
    new Paragraph({
      children: [
        new TextRun({ text: "Customer: ", bold: true, size: 22 }),
        new TextRun({ text: customerName, size: 22 }),
      ],
    }),
  ];

  if (isInvoice && customerTRN) {
    headerParagraphs.push(
      new Paragraph({
        children: [new TextRun({ text: `TRN: ${customerTRN}`, size: 22 })],
      })
    );
  }

  headerParagraphs.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Site: ", bold: true, size: 22 }),
        new TextRun({ text: site, size: 22 }),
      ],
    })
  );

  headerParagraphs.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: `Date: ${date}`, size: 22 })],
    })
  );

  if (isInvoice) {
    headerParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "TAX INVOICE", bold: true, underline: {}, size: 26 })],
      })
    );
    headerParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: `TRN: ${companyTRN}`, bold: true, underline: {}, size: 22 })],
      })
    );
    headerParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: `Invoice No: ${refNo}`, size: 22 })],
      })
    );
    headerParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: "Currency: AED", size: 22 })],
      })
    );
  } else {
    headerParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: `Ref: ${refNo}`, size: 22 })],
      })
    );
    headerParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Quotation", bold: true, underline: {}, size: 26 })],
      })
    );
  }

  headerParagraphs.push(new Paragraph({ text: "" }));

  if (!isInvoice) {
    headerParagraphs.push(
      new Paragraph({
        children: [new TextRun({ text: "We have great pleasure to quote you the rock-bottom price as follows.", size: 22 })],
      })
    );
    headerParagraphs.push(new Paragraph({ text: "" }));
  }

  const itemRows = items.map(
    (it, idx) =>
      new TableRow({
        children: [
          cell(String(idx + 1).padStart(2, "0"), { width: colWidths[0], align: AlignmentType.CENTER }),
          multiLineCell(it.description.split("\n"), { width: colWidths[1] }),
          cell(fmt(it.price), { width: colWidths[2], align: AlignmentType.RIGHT }),
          cell(String(it.qty), { width: colWidths[3], align: AlignmentType.CENTER }),
          cell(fmt(it.price * it.qty), { width: colWidths[4], align: AlignmentType.RIGHT }),
        ],
      })
  );

  const totalLabel = isInvoice ? "Total Amount" : "TOTAL";
  const vatLabel = isInvoice ? `${vatPercent}% Vat` : "VAT";

  const table = new Table({
    width: { size: tableWidth, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          cell("S.N", { width: colWidths[0], bold: true, align: AlignmentType.CENTER, shade: "D9D9D9" }),
          cell("Description", { width: colWidths[1], bold: true, align: AlignmentType.CENTER, shade: "D9D9D9" }),
          cell("Price", { width: colWidths[2], bold: true, align: AlignmentType.CENTER, shade: "D9D9D9" }),
          cell("Qty", { width: colWidths[3], bold: true, align: AlignmentType.CENTER, shade: "D9D9D9" }),
          cell("Amount", { width: colWidths[4], bold: true, align: AlignmentType.CENTER, shade: "D9D9D9" }),
        ],
      }),
      ...itemRows,
      ...(!isInvoice
        ? [
            new TableRow({
              children: [multiLineCell(terms, { colSpan: 5, bold: true })],
            }),
          ]
        : []),
      new TableRow({
        children: [
          multiLineCell([""], { colSpan: 3 }),
          cell(totalLabel, { bold: true, align: AlignmentType.RIGHT }),
          cell(fmt(subtotal), { align: AlignmentType.RIGHT }),
        ],
      }),
      new TableRow({
        children: [
          multiLineCell([""], { colSpan: 3 }),
          cell(vatLabel, { bold: true, align: AlignmentType.RIGHT }),
          cell(fmt(vatAmount), { align: AlignmentType.RIGHT }),
        ],
      }),
      new TableRow({
        children: [
          isInvoice
            ? multiLineCell([`Total: ${amountToWords(grandTotal)}`], { colSpan: 3, bold: true })
            : multiLineCell([""], { colSpan: 3 }),
          cell("GRAND TOTAL", { bold: true, align: AlignmentType.RIGHT }),
          cell(fmt(grandTotal), { bold: true, align: AlignmentType.RIGHT }),
        ],
      }),
      ...(!isInvoice
        ? [
            new TableRow({
              children: [cell(`Total: ${amountToWords(grandTotal)}`, { colSpan: 5, bold: true })],
            }),
          ]
        : []),
    ],
  });

  const footerParagraphs = [new Paragraph({ text: "" })];

  if (isInvoice) {
    footerParagraphs.push(
      new Paragraph({
        children: [new TextRun({ text: "Terms & condition", bold: true, underline: {}, size: 20 })],
      })
    );
    terms.forEach((t, i) => {
      footerParagraphs.push(
        new Paragraph({
          children: [new TextRun({ text: `${i + 1}. ${t}`, size: 20 })],
        })
      );
    });
    footerParagraphs.push(new Paragraph({ text: "" }));
  } else {
    footerParagraphs.push(
      new Paragraph({
        children: [new TextRun({ text: "Awaiting your valuable confirmation soon and assuring you the best of our service, we remain.", size: 22 })],
      })
    );
    footerParagraphs.push(new Paragraph({ text: "" }));
  }

  footerParagraphs.push(new Paragraph({ children: [new TextRun({ text: "Regards,", size: 22 })] }));
  footerParagraphs.push(new Paragraph({ text: "" }));
  footerParagraphs.push(new Paragraph({ children: [new TextRun({ text: signatory, bold: true, size: 22 })] }));
  footerParagraphs.push(new Paragraph({ children: [new TextRun({ text: signatoryPhone, size: 22 })] }));

  if (!isInvoice) {
    footerParagraphs.push(new Paragraph({ text: "" }));
    footerParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: "Customer Approval: ___________________________", size: 22 })],
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: { page: { size: { width: 12240, height: 15840 } } },
        headers: { default: buildHeader(isInvoice) },
        footers: { default: buildFooter() },
        children: [...headerParagraphs, table, ...footerParagraphs],
      },
    ],
  });

  return doc;
}
