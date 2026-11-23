import { Button } from "@grasp-os/ui/components/button";
import { Text } from "@grasp-os/ui/components/text";
import { colors, radius, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  stack: { display: "grid", gap: space[3], justifyItems: "start" },
  head: {
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box",
    width: 200,
    paddingBlock: space[1],
    paddingInline: space[2],
    borderRadius: radius.xl,
    cornerShape: radius.shape,
    backgroundColor: colors.card,
    boxShadow: `inset 0 0 0 ${size.hairline} ${colors.border}`,
  },
  name: { flexGrow: 1, minWidth: 0 },
});

// A name that fits, renamed to one that does not, in a head that keeps its width: once the longer
// words are cut, the tooltip shows them whole.
export default function TextRename() {
  const [name, setName] = useState("Q3 plan");
  return (
    <div {...stylex.props(layout.stack)}>
      <div {...stylex.props(layout.head)}>
        <Text size="sm" weight="medium" truncate style={layout.name}>
          {name}
        </Text>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setName("Quarterly planning for the third quarter");
        }}
      >
        Use the full name
      </Button>
    </div>
  );
}
