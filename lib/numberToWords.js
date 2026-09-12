const ones = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const tens = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

function chunkToWords(n) {
  let str = "";
  if (n >= 100) {
    str += ones[Math.floor(n / 100)] + " Hundred ";
    n %= 100;
  }
  if (n >= 20) {
    str += tens[Math.floor(n / 10)] + " ";
    n %= 10;
  }
  if (n > 0) {
    str += ones[n] + " ";
  }
  return str.trim();
}

function integerToWords(num) {
  if (num === 0) return "Zero";
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const rest = num;

  let parts = [];
  if (crore) parts.push(chunkToWords(crore) + " Crore");
  if (lakh) parts.push(chunkToWords(lakh) + " Lakh");
  if (thousand) parts.push(chunkToWords(thousand) + " Thousand");
  if (rest) parts.push(chunkToWords(rest));
  return parts.join(" ").trim();
}

// Converts a numeric AED amount into "AED <Words> ONLY" (fils spelled out too if present)
export function amountToWords(amount, currency = "AED") {
  const rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
  const wholePart = Math.floor(rounded);
  const fils = Math.round((rounded - wholePart) * 100);

  let words = `${currency} ${integerToWords(wholePart)}`;
  if (fils > 0) {
    words += ` and ${integerToWords(fils)} Fils`;
  }
  words += " ONLY";
  return words.toUpperCase();
}
