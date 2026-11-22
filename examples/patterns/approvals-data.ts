// The requests the approvals inbox shows: what agents in a small workspace are waiting to hear.
// Plain data, so the screen (approvals-inbox.tsx) is only finished components drawing it.

/** Where a request stands. */
export type ApprovalStatus = "waiting" | "approved" | "declined" | "expired";

/** How a request was answered, by whom and when; or that it still waits, or ran out. */
export type ApprovalDecision =
  | { status: "waiting" }
  | { status: "approved" | "declined"; by: string; at: Date | string }
  | { status: "expired"; at: string };

/** One thing a yes would change: a file, a person, money or a system. */
export interface ApprovalEffect {
  kind: "file" | "person" | "money" | "system";
  label: string;
  detail?: string;
  /** What cannot be taken back once it is done. */
  irreversible?: boolean;
}

/** How much is at stake, which picks how a yes is confirmed (docs/patterns/confirmations.mdx). */
export type Stake = "undoable" | "moderate" | "grave";

export interface ApprovalItem {
  id: string;
  agent: string;
  title: string;
  /** The words on Approve, when they can say the act. */
  approveLabel?: string;
  /** What it touches, in a few words for the table ("3 files"). */
  touches: string;
  kind: "files" | "people" | "money" | "systems";
  affects: ApprovalEffect[];
  stake: Stake;
  /** Minutes ago it was asked, for sorting; the words for showing. */
  minutes: number;
  askedAt: string;
  expiresIn?: string;
  decision: ApprovalDecision;
  /** A change to read before answering. */
  diff?: { title: string; before: string; after: string };
}

const termsBefore = `export const terms = {
  dueInDays: 30,
  reminderAfterDays: 7,
  lateFee: 0,
};
`;
const termsAfter = `export const terms = {
  dueInDays: 14,
  reminderAfterDays: 3,
  lateFee: 0,
};
`;

export const requests: ApprovalItem[] = [
  {
    id: "r1",
    agent: "Finance agent",
    title: "Pay Northwind Supplies £1,240.00 for invoice 2024-118",
    approveLabel: "Pay £1,240",
    touches: "£1,240.00",
    kind: "money",
    affects: [
      {
        kind: "money",
        label: "£1,240.00",
        detail: "From the operations account",
        irreversible: true,
      },
      {
        kind: "person",
        label: "Northwind Supplies",
        detail: "Gets an email with the receipt",
      },
    ],
    stake: "grave",
    minutes: 2,
    askedAt: "2 min ago",
    expiresIn: "Expires in 1 hour",
    decision: { status: "waiting" },
  },
  {
    id: "r2",
    agent: "Build agent",
    title: "Change the invoice terms to 14 days",
    touches: "1 file",
    kind: "files",
    affects: [
      {
        kind: "file",
        label: "billing/terms.ts",
        detail: "Due in 14 days, reminder after 3",
      },
    ],
    stake: "undoable",
    minutes: 6,
    askedAt: "6 min ago",
    decision: { status: "waiting" },
    diff: { title: "billing/terms.ts", before: termsBefore, after: termsAfter },
  },
  {
    id: "r3",
    agent: "Outreach agent",
    title: "Email the spring update to 1,240 customers",
    approveLabel: "Send the email",
    touches: "1,240 people",
    kind: "people",
    affects: [
      {
        kind: "person",
        label: "1,240 customers",
        detail: "On the Spring update list",
        irreversible: true,
      },
    ],
    stake: "moderate",
    minutes: 14,
    askedAt: "14 min ago",
    decision: { status: "waiting" },
  },
  {
    id: "r4",
    agent: "Research agent",
    title: "Move 3 reports into the Archive folder",
    touches: "3 files",
    kind: "files",
    affects: [
      {
        kind: "file",
        label: "Quarterly summary.pdf",
        detail: "From Reports to Archive",
      },
      {
        kind: "file",
        label: "Supplier list for the spring.xlsx",
        detail: "From Reports to Archive",
      },
      {
        kind: "file",
        label: "Team survey results.pdf",
        detail: "From Reports to Archive",
      },
    ],
    stake: "undoable",
    minutes: 32,
    askedAt: "32 min ago",
    decision: { status: "waiting" },
  },
  {
    id: "r5",
    agent: "Build agent",
    title: "Delete the staging database backup from June",
    approveLabel: "Delete the backup",
    touches: "Staging database",
    kind: "systems",
    affects: [
      {
        kind: "system",
        label: "Staging database",
        detail: "The June backup, 42 GB",
        irreversible: true,
      },
    ],
    stake: "grave",
    minutes: 58,
    askedAt: "58 min ago",
    decision: { status: "waiting" },
  },
  {
    id: "r6",
    agent: "People agent",
    title: "Give Jonas Weber edit access to Finance",
    touches: "1 person",
    kind: "people",
    affects: [
      {
        kind: "person",
        label: "Jonas Weber",
        detail: "Gets edit access to Finance",
      },
    ],
    stake: "undoable",
    minutes: 75,
    askedAt: "1 hour ago",
    decision: { status: "waiting" },
  },
  {
    id: "r7",
    agent: "Research agent",
    title: "Rename the project to Spring launch",
    touches: "1 project",
    kind: "systems",
    affects: [
      {
        kind: "system",
        label: "Project Northwind 2025",
        detail: "Renamed for everyone",
      },
    ],
    stake: "undoable",
    minutes: 190,
    askedAt: "3 hours ago",
    decision: { status: "approved", by: "Amara Okafor", at: "14:02" },
  },
  {
    id: "r8",
    agent: "People agent",
    title: "Invite 4 people to the workspace",
    touches: "4 people",
    kind: "people",
    affects: [
      {
        kind: "person",
        label: "4 people",
        detail: "Get an invitation by email",
      },
    ],
    stake: "undoable",
    minutes: 260,
    askedAt: "4 hours ago",
    decision: { status: "declined", by: "You", at: "11:40" },
  },
  {
    id: "r9",
    agent: "Office agent",
    title: "Book the large meeting room for Friday",
    touches: "1 room",
    kind: "systems",
    affects: [
      {
        kind: "system",
        label: "Large meeting room",
        detail: "Friday, 10:00 to 12:00",
      },
    ],
    stake: "undoable",
    minutes: 1500,
    askedAt: "Yesterday",
    decision: { status: "expired", at: "yesterday at 17:00" },
  },
];
