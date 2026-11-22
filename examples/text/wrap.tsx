import { Button } from "@grasp-os/ui/components/button";
import { Text } from "@grasp-os/ui/components/text";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: space[3], width: "100%", maxWidth: 260 },
  row: { display: "flex", alignItems: "center", gap: space[2], minWidth: 0 },
  words: { flexGrow: 1, minWidth: 0 },
});

const address = "anna.de.vries@contosofinance.example";

const rows = [
  { name: "wrap", wrap: "wrap", truncate: false },
  { name: "anywhere", wrap: "anywhere", truncate: false },
  { name: "truncate", wrap: "wrap", truncate: true },
] as const;

// One long address in a narrow row beside a button: wrapped over two lines (`wrap`), or one line
// cut with an ellipsis, read whole by a screen reader and shown whole in a tooltip while it is cut
// (`truncate`). `anywhere` lets it break at any letter where a box sizes to what it holds.
export default function TextWrap() {
  return (
    <div {...stylex.props(layout.stack)}>
      {rows.map(({ name, wrap, truncate }) => (
        <div key={name} data-wrap={name} {...stylex.props(layout.row)}>
          <Text size="sm" wrap={wrap} truncate={truncate} style={layout.words}>
            {address}
          </Text>
          <Button size="sm" variant="outline">
            Remove
          </Button>
        </div>
      ))}
    </div>
  );
}
