# HAFZE Invoicing — Quotation & Invoice Generator

Internal tool for Home Automation FZE LLC to generate Quotations and Tax Invoices
as downloadable PDF and Word (.docx) files, styled to match the company's official formats.

## Features
- Single-password login (no user database, just you)
- Toggle between "Quotation" and "Tax Invoice" document types
- Dynamic item rows with auto-calculated totals, VAT %, and grand total
- Editable notes / terms & conditions per document
- Downloads both PDF and Word with one click — no data is stored anywhere

## Running locally

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env.local` file in the project root with your login password:
   ```
   APP_PASSWORD=choose-a-strong-password
   ```

3. Start the dev server:
   ```
   npm run dev
   ```

4. Open http://localhost:3000 in your browser, log in with the password you set, and start
   generating documents.

## Deploying (e.g. to Vercel)

1. Push this project to a GitHub repo (private is fine).
2. Import the repo in Vercel.
3. In the Vercel project's Environment Variables, add:
   - `APP_PASSWORD` = your chosen password
4. Deploy. No database or extra services are required — everything runs as
   serverless functions.

## Notes
- Nothing is saved: every quotation/invoice is generated on the fly from what you
  type into the form and downloaded directly. If you want history/search later,
  a database can be added on top of this.
- Company details (name, phone, email, address, default signatory) live in
  `lib/company.js` — edit that file if any of those change.
- The Word (.docx) output includes the Arabic company name; the PDF output
  currently omits it because the default PDF font doesn't render Arabic glyphs
  (an Arabic-capable font can be added later if you want it in the PDF too).
