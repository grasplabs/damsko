import { Markdown } from "@grasp-os/ui/components/markdown";

const answer = `Retry the request once the server says when:

\`\`\`ts
export async function withRetry(call: () => Promise<Response>, tries = 3) {
  for (let attempt = 1; ; attempt++) {
    const response = await call();
    if (response.status !== 429 || attempt === tries) return response;
    const wait = Number(response.headers.get("Retry-After") ?? 1);
    await new Promise((resolve) => setTimeout(resolve, wait * 1000));
  }
}
\`\`\`

And the same check from a shell:

\`\`\`bash
curl -sI https://example.com/api | grep -i retry-after
\`\`\``;

// Fenced code: CodeBlock in the fence's language, its name over it, Download and Copy beside it.
export default function MarkdownCode() {
  return <Markdown>{answer}</Markdown>;
}
