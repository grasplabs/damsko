import { Markdown } from "@grasp-os/ui/components-tw/markdown";

// What an answer must never do, drawn as plain text: raw HTML, a script link, a data link, a
// relative path, a picture that would load.
const risky = `This line holds <b onmouseover="alert(1)">raw HTML</b>, shown as the text it is.

<script>alert(1)</script>

A [script link](javascript:alert(1)), a [data link](data:text/html,<b>x</b>) and a [relative link](/settings) are words, not links.

A picture is never loaded: ![a tracking pixel](https://example.com/pixel.gif) shows its words.

A [safe link](https://example.com) and [an email](mailto:team@example.com) lead where they say.`;

export default function MarkdownSafe() {
  return <Markdown>{risky}</Markdown>;
}
