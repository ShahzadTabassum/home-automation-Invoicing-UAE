export const metadata = {
  title: "HAFZE Invoicing",
  description: "Internal quotation & invoice generator for Home Automation FZE LLC",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Arial, Helvetica, sans-serif", background: "#f4f6f8" }}>
        {children}
      </body>
    </html>
  );
}
