import { Button } from "@grasp-os/ui/components/button";
import { ButtonGroup } from "@grasp-os/ui/components/button-group";
import { Icon, LayoutGridIcon, ListIcon } from "@grasp-os/ui/lib/icons";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  column: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: space[4],
  },
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: space[3],
    alignItems: "center",
    justifyContent: "center",
  },
  said: {
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
    textAlign: "center",
  },
});

type View = "list" | "grid";
const said: Record<View, string> = {
  list: "Shown as a list",
  grid: "Shown as a grid",
};

// Button's heights: 32px in a dense toolbar, 36px by default, 44px where there is room. The group's
// corner follows its buttons' size. The three are one choice of view: the chosen one is pressed,
// and the line under them says which.
export default function ButtonGroupSizes() {
  const [view, setView] = useState<View>("list");
  return (
    <div {...stylex.props(layout.column)}>
      <div {...stylex.props(layout.row)}>
        {(["sm", "default", "lg"] as const).map((size) => (
          <ButtonGroup key={size} aria-label={`View, ${size}`}>
            <Button
              variant="ghost"
              size={size}
              aria-pressed={view === "list"}
              onClick={() => {
                setView("list");
              }}
            >
              <Icon icon={ListIcon} />
              List
            </Button>
            <Button
              variant="ghost"
              size={size}
              aria-pressed={view === "grid"}
              onClick={() => {
                setView("grid");
              }}
            >
              <Icon icon={LayoutGridIcon} />
              Grid
            </Button>
          </ButtonGroup>
        ))}
      </div>
      <p {...stylex.props(layout.said)}>{said[view]}</p>
    </div>
  );
}
