// The files the DiffViewerFiles examples compare: an index route edited, a server file added, an old
// file deleted. Whole texts per file.
import type { DiffViewerFile } from "@grasp-os/ui/components/diff-viewer";

const indexBefore = `import { createFileRoute } from "@tanstack/react-router";

import { ExpenseList } from "../components/expense-list";

export const Route = createFileRoute("/")({
  component: Home,
});

/** The total of the open expenses, in euros, for the page's lead. */
function totalOf(expenses: { amount: number }[]) {
  let total = 0;
  for (const expense of expenses) {
    total += expense.amount;
  }
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
  }).format(total);
}

function Home() {
  return (
    <main>
      <h1>Expenses</h1>
      <ExpenseList />
    </main>
  );
}
`;

const indexAfter = `import { createFileRoute } from "@tanstack/react-router";

import { ExpenseList } from "../components/expense-list";
import { listExpenses } from "../server/expenses";

export const Route = createFileRoute("/")({
  loader: () => listExpenses({ data: { status: "open" } }),
  component: Home,
});

/** The total of the open expenses, in euros, for the page's lead. */
function totalOf(expenses: { amount: number }[]) {
  let total = 0;
  for (const expense of expenses) {
    total += expense.amount;
  }
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
  }).format(total);
}

function Home() {
  const expenses = Route.useLoaderData();
  return (
    <main>
      <h1>Open expenses</h1>
      <ExpenseList expenses={expenses} emptyLabel="Nothing waits for approval. New expenses show here as soon as someone submits one." />
    </main>
  );
}
`;

const serverAfter = `import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { db } from "./db";

const Filter = z.object({ status: z.enum(["open", "approved", "paid"]) });

export const listExpenses = createServerFn({ method: "GET" })
  .validator(Filter)
  .handler(async ({ data }) => {
    return db.expense.findMany({
      where: { status: data.status },
      orderBy: { submittedAt: "desc" },
    });
  });
`;

const mockBefore = `export const expenses = [
  { id: "e1", title: "Train to Utrecht", amount: 24.6, status: "open" },
  { id: "e2", title: "Team lunch", amount: 86.0, status: "approved" },
  { id: "e3", title: "Monitor", amount: 219.0, status: "paid" },
];
`;

export const files: DiffViewerFile[] = [
  {
    path: "apps/web/src/routes/index.tsx",
    oldValue: indexBefore,
    newValue: indexAfter,
  },
  {
    path: "apps/web/src/server/expenses.ts",
    newValue: serverAfter,
  },
  {
    path: "apps/web/src/data/mock-expenses.ts",
    oldValue: mockBefore,
  },
];
