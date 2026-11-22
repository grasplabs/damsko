// The texts the Diff examples compare: a small module before and after an agent's edit.
export const before = `import { send } from "./mail";

export interface Invoice {
  id: string;
  customer: string;
  total: number;
}

export function dueDate(issued: Date): Date {
  const due = new Date(issued);
  due.setDate(due.getDate() + 30);
  return due;
}

export function format(invoice: Invoice): string {
  return \`\${invoice.id}: \${invoice.total}\`;
}

export async function remind(invoice: Invoice) {
  await send(invoice.customer, "Your invoice is due");
}

export function isLate(invoice: Invoice, today: Date) {
  return today > dueDate(new Date());
}
`;

export const after = `import { send } from "./mail";

export interface Invoice {
  id: string;
  customer: string;
  total: number;
  currency: "GBP" | "EUR";
}

export function dueDate(issued: Date, days = 30): Date {
  const due = new Date(issued);
  due.setDate(due.getDate() + days);
  return due;
}

export function format(invoice: Invoice): string {
  const amount = new Intl.NumberFormat("en-GB", { style: "currency", currency: invoice.currency });
  return \`\${invoice.id}: \${amount.format(invoice.total)}\`;
}

export async function remind(invoice: Invoice) {
  await send(invoice.customer, "Your invoice is due");
}

export function isLate(invoice: Invoice, issued: Date, today: Date) {
  return today > dueDate(issued);
}
`;
