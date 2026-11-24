import { Button } from "@grasp-os/ui/components/button";
import {
  CodeBlock,
  CodeBlockContent,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@grasp-os/ui/components/code-block";
import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import { Input } from "@grasp-os/ui/components/input";
import { Textarea } from "@grasp-os/ui/components/textarea";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";

const sample = `export function total(rows: { amount: number }[]) {
  return rows.reduce((sum, row) => sum + row.amount, 0);
}`;

const layout = stylex.create({
  column: { display: "grid", gap: 12, width: "100%" },
  row: { display: "flex", flexWrap: "wrap", gap: 8 },
});

/** How much is written each frame: all of it within about 300 frames. */
const stepFor = (length: number) => Math.max(8, Math.ceil(length / 300));

// Any code, of any length, in a language a block names: shown whole, or written out a little each
// frame as a model writes it. Whatever it holds, the page stays responsive.
export default function CodeBlockAny() {
  const [draft, setDraft] = useState(sample);
  const [language, setLanguage] = useState("tsx");
  const [code, setCode] = useState(sample);
  // How much has been written while it is written out; null when it is shown whole.
  const [written, setWritten] = useState<number | null>(null);
  useEffect(() => {
    if (written === null) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      const next = written + stepFor(code.length);
      setWritten(next >= code.length ? null : next);
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [written, code]);
  return (
    <div {...stylex.props(layout.column)}>
      <Field name="code">
        <FieldLabel>Code</FieldLabel>
        <Textarea
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
          }}
        />
      </Field>
      <Field name="language">
        <FieldLabel>Language</FieldLabel>
        <Input
          value={language}
          onChange={(event) => {
            setLanguage(event.target.value);
          }}
        />
      </Field>
      <div {...stylex.props(layout.row)}>
        <Button
          onClick={() => {
            setCode(draft);
            setWritten(null);
          }}
        >
          Show
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setCode(draft);
            setWritten(0);
          }}
        >
          Write it out
        </Button>
      </div>
      <CodeBlock language={language} streaming={written !== null}>
        <CodeBlockHeader>
          <CodeBlockTitle />
        </CodeBlockHeader>
        <CodeBlockContent lineNumbers>
          {written === null ? code : code.slice(0, written)}
        </CodeBlockContent>
      </CodeBlock>
    </div>
  );
}
