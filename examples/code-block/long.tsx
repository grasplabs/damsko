import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@grasp-os/ui/components/code-block";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const code = `{
  "report": "Requests closed per month",
  "team": "Support",
  "months": [
${months.map((month, index) => `    { "month": "${month}", "closed": ${40 + ((index * 7) % 23)} }`).join(",\n")}
  ],
  "total": 612
}`;

// Longer than 18 lines: folded under Show more, with a fade where it is cut.
export default function CodeBlockLong() {
  return (
    <CodeBlock language="json">
      <CodeBlockHeader>
        <CodeBlockTitle>closed-per-month.json</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={code} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent lineNumbers>{code}</CodeBlockContent>
    </CodeBlock>
  );
}
