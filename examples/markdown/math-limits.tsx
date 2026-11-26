import { Markdown } from "@grasp-os/ui/components/markdown";

// For the spec only (tests/markdown.spec.ts), at /examples/markdown/math-limits; not on the page.
// A formula longer than 4,000 characters stays its TeX, one that asks for a huge rule is drawn no
// bigger than KaTeX's `maxSize` allows, inside the column, and a matrix of 1,200 rows in a sentence
// is cut at ten lines' height.
const answer = `A long one: $$${"x+".repeat(3000)}x$$

A tall one: $$\\begin{matrix}${"1\\\\".repeat(1200)}1\\end{matrix}$$ and on.

A huge rule: $$\\rule{100000em}{100000em}$$ and on.

$$
\\rule{100000em}{100000em}
$$`;

export default function MarkdownMathLimits() {
  return <Markdown>{answer}</Markdown>;
}
