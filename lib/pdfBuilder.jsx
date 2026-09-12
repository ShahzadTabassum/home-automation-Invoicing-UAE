import React from "react";
import { Document, Page, Text, View, StyleSheet, Image, Svg, Path } from "@react-pdf/renderer";
import { COMPANY } from "./company";
import { amountToWords } from "./numberToWords";
import { LOGO_ICON_BASE64 } from "./logoBase64";

const BRAND = "#1D9CC5";
const BRAND_DARK = "#12667F";
const INK = "#12222B";

const PHONE_PATH =
  "M6 2c-1 0-2 1-2 2c0 8 6 14 14 14c1 0 2-1 2-2v-3c0-1-1-2-2-2l-3-1c-1 0-2 0-2 1l-1 1c-2-1-4-3-5-5l1-1c1 0 1-1 1-2l-1-3c0-1-1-2-2-2z";
const MAIL_PATH = "M2 5h20v14H2z M2 5l10 8l10-8";
const PIN_PATH =
  "M12 2c-4 0-7 3-7 7c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z M12 12a3 3 0 1 1 0 -6a3 3 0 0 1 0 6z";

function Icon({ d, size = 10 }) {
  return (
    <Svg viewBox="0 0 24 24" style={{ width: size, height: size }}>
      <Path d={d} fill="#ffffff" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  page: { fontSize: 10, fontFamily: "Helvetica", paddingBottom: 54 },
  body: { paddingHorizontal: 36 },

  headerBanner: {
    backgroundColor: BRAND,
    paddingVertical: 14,
    paddingHorizontal: 28,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  headerAccent: { height: 4, backgroundColor: BRAND_DARK, marginBottom: 16 },
  logoBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerCompanyName: { color: "#ffffff", fontSize: 16, fontWeight: 700 },
  headerCompanyNameAr: { color: "#eaf7fc", fontSize: 10, marginTop: 2 },
  headerDocTag: {
    marginLeft: "auto",
    color: "#ffffff",
    fontSize: 16,
    fontWeight: 700,
    backgroundColor: BRAND_DARK,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 4,
  },

  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  bold: { fontWeight: 700 },
  underline: { textDecoration: "underline" },
  center: { textAlign: "center" },
  right: { textAlign: "right" },
  spacer: { height: 10 },

  table: { borderWidth: 1, borderColor: "#000", marginTop: 8 },
  tr: { flexDirection: "row" },
  th: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    backgroundColor: "#d9d9d9",
    padding: 4,
    fontWeight: 700,
    fontSize: 10,
  },
  td: {
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderColor: "#000",
    padding: 4,
    fontSize: 10,
  },
  colSN: { width: "6%" },
  colDesc: { width: "48%" },
  colPrice: { width: "14%" },
  colQty: { width: "12%" },
  colAmount: { width: "20%", borderRightWidth: 0 },
  noteCell: {
    borderTopWidth: 1,
    borderColor: "#000",
    padding: 4,
    fontSize: 9.5,
    fontWeight: 700,
  },

  footerBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: INK,
    borderTopWidth: 3,
    borderTopColor: BRAND,
    paddingVertical: 10,
    paddingHorizontal: 28,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerItem: { flexDirection: "row", alignItems: "center" },
  footerIconWrap: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: BRAND,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  footerText: { color: "#ffffff", fontSize: 8.5 },
});

function fmt(n) {
  return (Math.round((n + Number.EPSILON) * 100) / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function Header({ isInvoice }) {
  return (
    <>
      <View style={styles.headerBanner}>
        <View style={styles.logoBadge}>
          <Image src={LOGO_ICON_BASE64} style={{ width: 30, height: 20 }} />
        </View>
        <View>
          <Text style={styles.headerCompanyName}>{COMPANY.nameEn}</Text>
        </View>
        <Text style={styles.headerDocTag}>{isInvoice ? "TAX INVOICE" : "QUOTATION"}</Text>
      </View>
      <View style={styles.headerAccent} />
    </>
  );
}

function Footer() {
  return (
    <View style={styles.footerBar} fixed>
      <View style={styles.footerItem}>
        <View style={styles.footerIconWrap}>
          <Icon d={PHONE_PATH} />
        </View>
        <Text style={styles.footerText}>{COMPANY.phone}</Text>
      </View>
      <View style={styles.footerItem}>
        <View style={styles.footerIconWrap}>
          <Icon d={MAIL_PATH} />
        </View>
        <Text style={styles.footerText}>{COMPANY.email}</Text>
      </View>
      <View style={styles.footerItem}>
        <View style={styles.footerIconWrap}>
          <Icon d={PIN_PATH} />
        </View>
        <Text style={styles.footerText}>{COMPANY.location}</Text>
      </View>
    </View>
  );
}

export function InvoiceDocument({ data }) {
  const { docType, customerName, customerTRN, site, date, refNo, companyTRN, items, terms, signatory, signatoryPhone, vatPercent } = data;
  const isInvoice = docType === "invoice";

  const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
  const vatAmount = subtotal * (vatPercent / 100);
  const grandTotal = subtotal + vatAmount;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header isInvoice={isInvoice} />

        <View style={styles.body}>
          <View style={styles.row}>
            <View style={{ width: "70%" }}>
              <Text><Text style={styles.bold}>Customer: </Text>{customerName}</Text>
              {isInvoice && customerTRN ? <Text>TRN: {customerTRN}</Text> : null}
              <Text><Text style={styles.bold}>Site: </Text>{site}</Text>
            </View>
            <View style={{ width: "30%" }}>
              {isInvoice ? (
                <>
                  <Text style={styles.right}>Date: {date}</Text>
                  <Text style={styles.right}>Invoice No: {refNo}</Text>
                  <Text style={styles.right}>Currency: AED</Text>
                </>
              ) : (
                <Text style={styles.right}>Ref: {refNo}</Text>
              )}
            </View>
          </View>

          {isInvoice ? (
            <Text style={[styles.center, styles.bold, styles.underline]}>TRN: {companyTRN}</Text>
          ) : (
            <>
              <Text>Date: {date}</Text>
              <View style={styles.spacer} />
              <Text>We have great pleasure to quote you the rock-bottom price as follows.</Text>
            </>
          )}

          <View style={styles.table}>
            <View style={styles.tr}>
              <Text style={[styles.th, styles.colSN, styles.center]}>S.N</Text>
              <Text style={[styles.th, styles.colDesc, styles.center]}>Description</Text>
              <Text style={[styles.th, styles.colPrice, styles.center]}>Price</Text>
              <Text style={[styles.th, styles.colQty, styles.center]}>Qty</Text>
              <Text style={[styles.th, styles.colAmount, styles.center, { borderRightWidth: 0 }]}>Amount</Text>
            </View>

            {items.map((it, idx) => (
              <View style={styles.tr} key={idx} wrap={false}>
                <Text style={[styles.td, styles.colSN, styles.center]}>{String(idx + 1).padStart(2, "0")}</Text>
                <View style={[styles.td, styles.colDesc]}>
                  {it.description.split("\n").map((line, i) => (
                    <Text key={i}>{line}</Text>
                  ))}
                </View>
                <Text style={[styles.td, styles.colPrice, styles.right]}>{fmt(it.price)}</Text>
                <Text style={[styles.td, styles.colQty, styles.center]}>{it.qty}</Text>
                <Text style={[styles.td, styles.colAmount, styles.right, { borderRightWidth: 0 }]}>
                  {fmt(it.price * it.qty)}
                </Text>
              </View>
            ))}

            {!isInvoice && (
              <View style={styles.tr}>
                <View style={[styles.noteCell, { width: "100%", borderRightWidth: 0 }]}>
                  <Text>NOTE:</Text>
                  <View style={{ height: 4 }} />
                  {terms.map((t, i) => (
                    <Text key={i}>{t}</Text>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.tr}>
              <View style={[styles.td, { width: "60%", borderRightWidth: 0 }]} />
              <Text style={[styles.td, { width: "20%", borderRightWidth: 1 }, styles.right, styles.bold]}>
                {isInvoice ? "Total Amount" : "TOTAL"}
              </Text>
              <Text style={[styles.td, { width: "20%", borderRightWidth: 0 }, styles.right]}>{fmt(subtotal)}</Text>
            </View>
            <View style={styles.tr}>
              <View style={[styles.td, { width: "60%", borderRightWidth: 0 }]} />
              <Text style={[styles.td, { width: "20%", borderRightWidth: 1 }, styles.right, styles.bold]}>
                {isInvoice ? `${vatPercent}% Vat` : "VAT"}
              </Text>
              <Text style={[styles.td, { width: "20%", borderRightWidth: 0 }, styles.right]}>{fmt(vatAmount)}</Text>
            </View>
            <View style={styles.tr}>
              <View style={[styles.td, { width: "60%", borderRightWidth: 0 }]}>
                {isInvoice ? <Text style={styles.bold}>Total: {amountToWords(grandTotal)}</Text> : null}
              </View>
              <Text style={[styles.td, { width: "20%", borderRightWidth: 1 }, styles.right, styles.bold]}>
                GRAND TOTAL
              </Text>
              <Text style={[styles.td, { width: "20%", borderRightWidth: 0 }, styles.right, styles.bold]}>
                {fmt(grandTotal)}
              </Text>
            </View>
            {!isInvoice && (
              <View style={styles.tr}>
                <Text style={[styles.td, { width: "100%", borderRightWidth: 0 }, styles.bold]}>
                  Total: {amountToWords(grandTotal)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.spacer} />

          {isInvoice ? (
            <>
              <Text style={[styles.bold, styles.underline]}>Terms & condition</Text>
              {terms.map((t, i) => (
                <Text key={i}>
                  {i + 1}. {t}
                </Text>
              ))}
              <View style={styles.spacer} />
            </>
          ) : (
            <>
              <Text>Awaiting your valuable confirmation soon and assuring you the best of our service, we remain.</Text>
              <View style={styles.spacer} />
            </>
          )}

          <Text>Regards,</Text>
          <View style={{ height: 6 }} />
          <Text style={styles.bold}>{signatory}</Text>
          <Text>{signatoryPhone}</Text>

          {!isInvoice && (
            <>
              <View style={styles.spacer} />
              <Text style={styles.right}>Customer Approval: ___________________________</Text>
            </>
          )}
        </View>

        <Footer />
      </Page>
    </Document>
  );
}
