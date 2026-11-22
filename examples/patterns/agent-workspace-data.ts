// The scripted run on the agent workspace screen (agent-workspace.tsx): the question, the steps the
// agent takes, its answer with sources, the change it asks to make, and what it says once allowed.
import { FileDocIcon, FilePdfIcon, GlobeIcon } from "@grasp-os/ui/lib/icons";
import type { IconData } from "@grasp-os/ui/lib/icons";

/** A fixed moment, so the server and the browser draw the same date line. */
export const today = "2026-11-14T10:00:00Z";

export const question =
  "Update the pricing page for January, and check it against last quarter's numbers.";

/** One step the agent takes, with how long it takes in this script. */
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

/** The steps, in order; each works for its time, then is done. */
export const plan: PlanStep[] = [
  {
    id: "read-q3",
    title: "Read churn-q3.pdf",
    active: "Reading churn-q3.pdf",
    summary: "12 pages",
    ms: 1200,
  },
  {
    id: "search",
    title: "Searched the web",
    active: "Searching the web",
    summary: "SaaS price benchmarks",
    ms: 1500,
  },
  {
    id: "write",
    title: "Drafted pricing.md",
    active: "Drafting pricing.md",
    ms: 1100,
  },
];

/** One source the answer drew on. */
export interface WorkspaceSource {
  title: string;
  origin: string;
  href: string;
  icon: IconData;
}

export const sources: WorkspaceSource[] = [
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

/** The answer, in Markdown. */
export const answer =
  "Larger teams churned least last quarter, at 2.1% a month, so Team can rise from 12 to 13 a seat, inside the 10% the October decision allows. That still sits low among comparable plans. I drafted the change; it needs your yes before it goes live.";

/**
 * The one line over the steps while the change waits for a yes: the step drafted it, nothing is
 * changed yet. Once the change is allowed, the line says a file changed.
 */
export const drafted = "Searched once, read 1 file, drafted 1 change";
export const published = "Searched once, read 1 file, changed 1 file";

/** What the agent says to a message typed on this screen: it plays a set run, and says so. */
export const typedReply =
  "This screen plays a set run, so I cannot answer that here. Press Replay to watch me draft the January pricing change; nothing goes live without your yes.";

export const done =
  "Published. The new prices show on the pricing page from 1 January, and the old ones stay until then.";

export const change = {
  title: "pricing.md",
  before: [
    "# Pricing",
    "",
    "## Starter",
    "Free for up to 3 people.",
    "",
    "## Team",
    "12 a seat, a month.",
    "Billed every month.",
    "",
    "## Business",
    "Talk to us.",
    "",
  ].join("\n"),
  after: [
    "# Pricing",
    "",
    "## Starter",
    "Free for up to 3 people.",
    "",
    "## Team",
    "13 a seat, a month, from 1 January.",
    "Billed every month, or yearly at 2 months free.",
    "",
    "## Business",
    "Talk to us.",
    "",
  ].join("\n"),
};

/** The person's chats, newest first, for Search chats. The first is the one open here. */
export const chats = [
  { value: "january-pricing", label: "January pricing" },
  { value: "supplier-renewal", label: "Supplier contract renewal" },
  { value: "spring-hiring", label: "Spring hiring plan" },
  { value: "office-move", label: "Office move budget" },
];
