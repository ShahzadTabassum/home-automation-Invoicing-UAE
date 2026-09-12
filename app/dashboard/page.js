"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COMPANY } from "../../lib/company";

const DEFAULT_QUOTATION_TERMS = [
  "We will install New Machine with Same old Frame Glass Door Panels.",
  "Delivery Time: 07 Days after receiving LPO.",
  "Payment Term: 50 % Advance 50% on work completion.",
  "STANDARD 1 YEAR WARRANTY ON MANUFACTURAL DEFECTS",
  "Validity Time: 30 days from the date of issuance.",
];

const DEFAULT_INVOICE_TERMS = [
  "Vat @ 5% is include",
  "There is one years warranty for new parts",
  "warranty will be avoid immediately in case of accident, flood and/or if unauthorised persons will operate the system",
  "Old items, remotes, Batteries & wirings are not covered by warranty",
];

function newItem() {
  return { id: crypto.randomUUID(), description: "", price: "", qty: "1" };
}

function todayStr() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [docType, setDocType] = useState("quotation"); // quotation | invoice
  const [customerName, setCustomerName] = useState("");
  const [customerTRN, setCustomerTRN] = useState("");
  const [site, setSite] = useState("");
  const [date, setDate] = useState(todayStr());
  const [refNo, setRefNo] = useState("");
  const [companyTRN, setCompanyTRN] = useState(COMPANY.invoiceTRN);
  const [items, setItems] = useState([newItem()]);
  const [terms, setTerms] = useState(DEFAULT_QUOTATION_TERMS.join("\n"));
  const [signatory, setSignatory] = useState(COMPANY.signatory);
  const [signatoryPhone, setSignatoryPhone] = useState(COMPANY.signatoryPhone);
  const [vatPercent, setVatPercent] = useState("5");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  function switchDocType(type) {
    setDocType(type);
    setTerms((type === "quotation" ? DEFAULT_QUOTATION_TERMS : DEFAULT_INVOICE_TERMS).join("\n"));
  }

  function updateItem(id, field, value) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, newItem()]);
  }

  function removeItem(id) {
    setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.id !== id) : prev));
  }

  const subtotal = items.reduce((sum, it) => {
    const p = parseFloat(it.price) || 0;
    const q = parseFloat(it.qty) || 0;
    return sum + p * q;
  }, 0);
  const vatRate = (parseFloat(vatPercent) || 0) / 100;
  const vatAmount = subtotal * vatRate;
  const grandTotal = subtotal + vatAmount;

  function buildPayload() {
    return {
      docType,
      customerName,
      customerTRN,
      site,
      date,
      refNo,
      companyTRN,
      vatPercent: parseFloat(vatPercent) || 0,
      items: items.map((it) => ({
        description: it.description,
        price: parseFloat(it.price) || 0,
        qty: parseFloat(it.qty) || 0,
      })),
      terms: terms.split("\n").filter((t) => t.trim().length > 0),
      signatory,
      signatoryPhone,
    };
  }

  async function handleGenerate(kind) {
    setErrorMsg("");
    if (!customerName.trim()) {
      setErrorMsg("Please enter a customer name.");
      return;
    }
    if (items.every((it) => !it.description.trim())) {
      setErrorMsg("Please add at least one item description.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/generate/${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate document");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      const ext = kind === "pdf" ? "pdf" : "docx";
      const label = docType === "quotation" ? "Quotation" : "Invoice";
      const safeRef = (refNo || "draft").replace(/[^a-zA-Z0-9-_]/g, "");
      a.href = url;
      a.download = `${label}_${safeRef}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "24px 16px 80px" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "20px", color: "#0b5ed7" }}>
            {COMPANY.nameEn}
          </h1>
          <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#666" }}>
            Quotation & Invoice Generator
          </p>
        </div>
        <button onClick={handleLogout} style={styles.linkButton}>
          Log out
        </button>
      </header>

      <div style={styles.card}>
        <div style={styles.toggleRow}>
          <button
            onClick={() => switchDocType("quotation")}
            style={docType === "quotation" ? styles.toggleActive : styles.toggleInactive}
          >
            Quotation
          </button>
          <button
            onClick={() => switchDocType("invoice")}
            style={docType === "invoice" ? styles.toggleActive : styles.toggleInactive}
          >
            Tax Invoice
          </button>
        </div>

        <div style={styles.grid2}>
          <Field label="Customer Name">
            <input style={styles.input} value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. Fast Express Building Contracting LLC" />
          </Field>
          <Field label="Site">
            <input style={styles.input} value={site} onChange={(e) => setSite(e.target.value)} placeholder="e.g. Al Ain" />
          </Field>

          {docType === "invoice" && (
            <Field label="Customer TRN">
              <input style={styles.input} value={customerTRN} onChange={(e) => setCustomerTRN(e.target.value)} placeholder="e.g. 100224144400003" />
            </Field>
          )}
          {docType === "invoice" && (
            <Field label="Company TRN (shown on invoice)">
              <input style={styles.input} value={companyTRN} onChange={(e) => setCompanyTRN(e.target.value)} />
            </Field>
          )}

          <Field label="Date">
            <input style={styles.input} value={date} onChange={(e) => setDate(e.target.value)} placeholder="DD-MM-YYYY" />
          </Field>
          <Field label={docType === "quotation" ? "Reference No." : "Invoice No."}>
            <input style={styles.input} value={refNo} onChange={(e) => setRefNo(e.target.value)} placeholder={docType === "quotation" ? "e.g. NA 202506" : "e.g. 20145"} />
          </Field>
        </div>

        <h3 style={styles.sectionTitle}>Items</h3>
        {items.map((it, idx) => (
          <div key={it.id} style={styles.itemRow}>
            <div style={{ flex: 1 }}>
              <textarea
                style={styles.textarea}
                value={it.description}
                onChange={(e) => updateItem(it.id, "description", e.target.value)}
                placeholder={"Description (use new lines for sub-items)\ne.g.\nSupply & Installation of...\nDOORTECH Kit\nSafety sensor 1nos"}
                rows={3}
              />
            </div>
            <div style={{ width: "110px" }}>
              <input
                style={styles.input}
                type="number"
                step="0.01"
                value={it.price}
                onChange={(e) => updateItem(it.id, "price", e.target.value)}
                placeholder="Price"
              />
            </div>
            <div style={{ width: "70px" }}>
              <input
                style={styles.input}
                type="number"
                step="1"
                value={it.qty}
                onChange={(e) => updateItem(it.id, "qty", e.target.value)}
                placeholder="Qty"
              />
            </div>
            <div style={{ width: "100px", textAlign: "right", fontSize: "14px", paddingTop: "8px" }}>
              {((parseFloat(it.price) || 0) * (parseFloat(it.qty) || 0)).toFixed(2)}
            </div>
            <button onClick={() => removeItem(it.id)} style={styles.removeButton} title="Remove item">
              ✕
            </button>
          </div>
        ))}
        <button onClick={addItem} style={styles.addButton}>
          + Add item
        </button>

        <div style={styles.totalsBox}>
          <div style={styles.totalsRow}>
            <span>Subtotal</span>
            <span>{subtotal.toFixed(2)} AED</span>
          </div>
          <div style={styles.totalsRow}>
            <span>
              VAT %{" "}
              <input
                type="number"
                step="0.1"
                value={vatPercent}
                onChange={(e) => setVatPercent(e.target.value)}
                style={{ width: "50px", marginLeft: "6px" }}
              />
            </span>
            <span>{vatAmount.toFixed(2)} AED</span>
          </div>
          <div style={{ ...styles.totalsRow, fontWeight: 700, borderTop: "1px solid #ddd", paddingTop: "6px" }}>
            <span>Grand Total</span>
            <span>{grandTotal.toFixed(2)} AED</span>
          </div>
        </div>

        <h3 style={styles.sectionTitle}>
          {docType === "quotation" ? "Notes" : "Terms & Conditions"}
        </h3>
        <textarea
          style={{ ...styles.textarea, width: "100%", boxSizing: "border-box" }}
          rows={5}
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
        />

        <div style={styles.grid2}>
          <Field label="Signed By">
            <input style={styles.input} value={signatory} onChange={(e) => setSignatory(e.target.value)} />
          </Field>
          <Field label="Signatory Phone">
            <input style={styles.input} value={signatoryPhone} onChange={(e) => setSignatoryPhone(e.target.value)} />
          </Field>
        </div>

        {errorMsg && <p style={{ color: "#c0392b", fontSize: "14px" }}>{errorMsg}</p>}

        <div style={styles.actionsRow}>
          <button disabled={busy} onClick={() => handleGenerate("pdf")} style={styles.primaryButton}>
            {busy ? "Generating..." : "Download PDF"}
          </button>
          <button disabled={busy} onClick={() => handleGenerate("docx")} style={styles.secondaryButton}>
            {busy ? "Generating..." : "Download Word"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
  },
  toggleRow: { display: "flex", gap: "8px", marginBottom: "20px" },
  toggleActive: {
    padding: "8px 18px",
    borderRadius: "8px",
    border: "none",
    background: "#0b5ed7",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
  },
  toggleInactive: {
    padding: "8px 18px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    background: "#fff",
    color: "#333",
    cursor: "pointer",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0 16px",
  },
  label: { display: "block", fontSize: "12px", color: "#555", marginBottom: "4px" },
  input: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  textarea: {
    padding: "8px 10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
    fontFamily: "inherit",
    resize: "vertical",
  },
  sectionTitle: { marginTop: "24px", marginBottom: "10px", fontSize: "15px", color: "#333" },
  itemRow: { display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "8px" },
  removeButton: {
    border: "none",
    background: "#f4f4f4",
    borderRadius: "6px",
    width: "32px",
    height: "32px",
    cursor: "pointer",
    color: "#c0392b",
  },
  addButton: {
    border: "1px dashed #999",
    background: "#fff",
    borderRadius: "6px",
    padding: "8px 14px",
    cursor: "pointer",
    fontSize: "13px",
    marginTop: "4px",
  },
  totalsBox: {
    marginTop: "16px",
    background: "#f9fafb",
    borderRadius: "8px",
    padding: "12px 16px",
    maxWidth: "320px",
    marginLeft: "auto",
  },
  totalsRow: { display: "flex", justifyContent: "space-between", fontSize: "14px", padding: "4px 0" },
  actionsRow: { display: "flex", gap: "12px", marginTop: "24px" },
  primaryButton: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#0b5ed7",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
  },
  secondaryButton: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #0b5ed7",
    background: "#fff",
    color: "#0b5ed7",
    fontWeight: 600,
    cursor: "pointer",
  },
  linkButton: {
    border: "none",
    background: "none",
    color: "#0b5ed7",
    cursor: "pointer",
    fontSize: "13px",
  },
};
