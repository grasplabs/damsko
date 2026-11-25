import { Markdown } from "@grasp-os/ui/components/markdown";

// Notes, as a model writes them at the end: each mark is numbered by where it first stands, leads to
// its note at the foot, and the note leads back.
const answer = `Revenue grew by a tenth[^growth] while churn fell for the third quarter running[^churn]. The growth[^growth] came mostly from the north.

[^churn]: Churn counts cancelled seats only, not downgrades.

[^growth]: Year on year, in euros, before currency effects.`;

export default function MarkdownFootnotes() {
  return <Markdown>{answer}</Markdown>;
}
