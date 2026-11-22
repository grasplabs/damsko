import { KeyValueList } from "@grasp-os/ui/components/key-value";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 320 },
});

// Side by side, for a short list in a small space: the value drops under its name when it must.
export default function KeyValueInline() {
  return (
    <KeyValueList
      orientation="horizontal"
      style={layout.box}
      items={[
        { id: "author", label: "Author", value: "You" },
        { id: "total-cost", label: "Total cost", value: "€ 4.20" },
        { id: "last-active", label: "Last active", value: "Today at 14:05" },
        {
          id: "workspace",
          label: "Workspace",
          value: "Quarterly review for the northern region",
        },
      ]}
    />
  );
}
