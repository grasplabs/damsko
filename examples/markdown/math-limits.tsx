import { Markdown } from "@grasp-os/ui/components/markdown";

// For the spec only (tests/markdown.spec.ts), at /examples/markdown/math-limits; not on the page.
// A formula longer than 4,000 characters stays its TeX, and one that asks for a huge rule is drawn
// no bigger than KaTeX's `maxSize` allows, inside the column.
const answer = `A long one: $$${"x+".repeat(3000)}x$$

A huge rule: $$\\rule{100000em}{100000em}$$ and on.

$$
\\rule{100000em}{100000em}
$$`;

export default function MarkdownMathLimits() {
  return <Markdown>{answer}</Markdown>;
}
