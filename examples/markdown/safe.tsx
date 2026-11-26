import { Markdown } from "@grasp-os/ui/components/markdown";

// What an answer must never do, drawn as plain text: raw HTML (its tags dropped, never elements), a
// script link, a data link, a picture that would load, a formula that would link.
const risky = `This line holds <b onmouseover="alert(1)">raw HTML</b>, shown as words without its tags.

<script>alert(1)</script>

A [script link](javascript:alert(1)) and a [data link](data:text/html,<b>x</b>) are words, not links.

A picture is never loaded: ![a tracking pixel](https://example.com/pixel.gif) shows its words.

A formula cannot lead anywhere: $$\\href{javascript:alert(1)}{click}$$ is its words.

\`\`\`mermaid
flowchart LR
  A["<b onclick=alert(1)>bold</b>"] --> B
  click A call alert(1)
\`\`\`

A [safe link](https://example.com), [an email](mailto:team@example.com) and [a page here](/components/markdown) lead where they say.`;

export default function MarkdownSafe() {
  return <Markdown>{risky}</Markdown>;
}
