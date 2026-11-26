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
import { useState } from "react";

const sample = `export function total(rows: { amount: number }[]) {
  return rows.reduce((sum, row) => sum + row.amount, 0);
}`;

const layout = stylex.create({
  column: { display: "grid", gap: 12, width: "100%" },
  row: { display: "flex", flexWrap: "wrap", gap: 8 },
});

// Many blocks on one page, as in a long answer: each is read in its turn, those on the screen
// first, and a block Prism cannot read in time holds up the others only a little.
export default function CodeBlockMany() {
  const [draft, setDraft] = useState(sample);
  const [language, setLanguage] = useState("tsx");
  const [blocks, setBlocks] = useState<
    { id: number; code: string; language: string }[]
  >([]);
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
            setBlocks((now) => [
              ...now,
              { id: now.length, code: draft, language },
            ]);
          }}
        >
          Add a block
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setBlocks([]);
          }}
        >
          Remove all
        </Button>
      </div>
      {blocks.map((block) => (
        <CodeBlock key={block.id} language={block.language}>
          <CodeBlockHeader>
            <CodeBlockTitle>{`Block ${block.id + 1}`}</CodeBlockTitle>
          </CodeBlockHeader>
          <CodeBlockContent lineNumbers>{block.code}</CodeBlockContent>
        </CodeBlock>
      ))}
    </div>
  );
}
