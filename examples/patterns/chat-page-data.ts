// The words and data of the chat page pattern (chat-page.tsx): one chat, its question, the
// assistant's steps, its answer in Markdown and its sources, and the person's other chats for the
// sidebar. Kept apart so the page stays about the parts.
import { FileDocIcon, FilePdfIcon, GlobeIcon } from "@grasp-os/ui/lib/icons";
import type { IconData } from "@grasp-os/ui/lib/icons";

/** A fixed moment, so the page reads the same on the server and in the browser on any day. */
export const today = "2026-11-17T09:12:00Z";

export const title = "Team plan price for next year";

export const question =
  "Should we raise the Team plan from 12 to 13 a seat next year? Look at churn and what others charge.";

/** One step the assistant takes while it works, with how long it takes in this script. */
export interface PlanStep {
  id: string;
  /** Once done ("Read churn-q3.pdf"). */
  title: string;
  /** While it runs ("Reading churn-q3.pdf"). */
  active: string;
  /** A quiet note after it ("12 pages"). */
  summary?: string;
  ms: number;
}

export const plan: PlanStep[] = [
  {
    id: "read-q3",
    title: "Read churn-q3.pdf",
    active: "Reading churn-q3.pdf",
    summary: "12 pages",
    ms: 1200,
  },
  {
    id: "wiki",
    title: "Read Pricing decisions",
    active: "Reading Pricing decisions",
    ms: 800,
  },
  {
    id: "search",
    title: "Searched the web",
    active: "Searching the web",
    summary: "SaaS price benchmarks",
    ms: 1400,
  },
];

/** The answer, in Markdown. */
export const answer = `**Yes, raise it to 13.** The numbers leave room for it.

- Teams of ten or more churned at 2.1% a month last quarter, half the rate of smaller teams [1](cite:1).
- Your own rule allows a rise of up to 10% while churn stays under 3% [2](cite:2); 12 to 13 is 8%.
- Comparable team plans sit between 12 and 16 a seat [3](cite:3), so 13 stays near the low end.

Tell existing customers before 1 December, so the new price starts with the year.`;

/** One source the answer drew on. */
export interface ChatSource {
  title: string;
  origin: string;
  href?: string;
  icon: IconData;
  /** Could not be opened: removed, or out of reach. */
  gone?: boolean;
}

/** The answer's sources; the third is gone in the "a source is gone" state. */
export const sources: ChatSource[] = [
  {
    title: "Churn by region, Q3",
    origin: "Finance drive, Reports",
    href: "#churn-q3",
    icon: FilePdfIcon,
  },
  {
    title: "Pricing decisions, October",
    origin: "Product wiki",
    href: "#pricing-decisions",
    icon: FileDocIcon,
  },
  {
    title: "SaaS price benchmarks 2026",
    origin: "benchmarks.example.org",
    href: "#benchmarks",
    icon: GlobeIcon,
  },
];

export const sourcesOneGone: ChatSource[] = sources.map((source, index) =>
  index === 2 ? { ...source, href: undefined, gone: true } : source
);

/** The person's other chats, for the sidebar's Chats group; the first is this one. */
export const chats = [
  { id: "price", title },
  {
    id: "invoices",
    title: "Supplier invoices for the second quarter, with the late ones first",
  },
  { id: "numbers", title: "Weekly numbers", working: true },
  { id: "launch", title: "Spring launch plan" },
  { id: "onboarding", title: "Onboarding checklist" },
];
