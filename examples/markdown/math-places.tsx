import { Markdown } from "@grasp-os/ui/components/markdown";

// For the spec only (tests/markdown.spec.ts), at /examples/markdown/math-places; not on the page.
// A formula in a heading, a sentence, a list item and a table cell, one on lines of its own, and a
// flowchart: each formula at the size of the words round it, the diagram in the design's look.
const answer = `## Growth $$g = x$$

Growth is $$g = \\frac{r_2 - r_1}{r_1}$$, so the North grew by a quarter, and $$x$$ is its rate.

- In a list, $$x$$ is the rate.

| Region | Rate |
| --- | --- |
| North | $$x = 0.25$$ |

$$
x = \\frac{r_2 - r_1}{r_1}
$$

\`\`\`mermaid
flowchart LR
  Lead --> Deal --> Invoice
\`\`\``;

export default function MarkdownMathPlaces() {
  return <Markdown>{answer}</Markdown>;
}
