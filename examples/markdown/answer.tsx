import { Markdown } from "@grasp-os/ui/components/markdown";

const answer = `## Summary of the comments

Twelve people commented on the **quarterly summary**. Most agree with the plan; two points need an answer.

1. The support numbers for *March* look low.
2. The move to the new office needs a date.

| Section | Comments | Open |
| :-- | --: | --: |
| Highlights | 5 | 0 |
| Risks | 4 | 2 |
| Next steps | 3 | 0 |

To share the report again, run \`share\` with the team's name:

\`\`\`ts
await report.share({ with: "support", notify: true });
\`\`\`

> Lena: "Can we add the survey results before Friday?"

See the [sharing guide](https://example.com/guides/sharing) for more.`;

export default function MarkdownAnswer() {
  return <Markdown>{answer}</Markdown>;
}
