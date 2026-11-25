import { Markdown } from "@grasp-os/ui/components/markdown";

// A model's fence of 3,000 lines: 1,500 entries, a blank line after each.
const answer = `The log:\n\n\`\`\`text\n${Array.from(
  { length: 1500 },
  (_, index) => `entry ${index + 1}\n`
).join("\n")}\`\`\``;

// For the spec only (tests/markdown.spec.ts), at /examples/markdown/long-code; not on the page.
// `codeMaxLines={false}` stops the fence folding, yet it draws only its first 2,000 lines: a
// model's output never draws without a bound.
export default function MarkdownLongCode() {
  return <Markdown codeMaxLines={false}>{answer}</Markdown>;
}
