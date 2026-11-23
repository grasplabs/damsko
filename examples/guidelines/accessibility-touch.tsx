import { Button } from "@grasp-os/ui/components/button";
import {
  BoldIcon,
  Icon,
  ItalicIcon,
  UnderlineIcon,
} from "@grasp-os/ui/lib/icons";
import {
  colors,
  font,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";

const styles = stylex.create({
  // Room at the start and the top for the first dashed box, which stands half a press area's extra
  // past its button: so the boxes stay inside the column, and the example sits in the middle.
  column: {
    display: "grid",
    gap: space["6"],
    justifyItems: "start",
    boxSizing: "border-box",
    width: "100%",
    maxWidth: 360,
    minWidth: 0,
    paddingBlockStart: `calc((${size.tapTarget} - ${size.controlXs}) / 2)`,
    paddingInlineStart: `calc((${size.tapTarget} - ${size.controlXs}) / 2)`,
  },
  // Neighbours a finger apart: what each press area adds round its 28px button, once on each side.
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: `calc(${size.tapTarget} - ${size.controlXs})`,
  },
  // Drawn for this example only: the press area a touch screen gives, from the same token.
  holder: { position: "relative", display: "inline-flex" },
  area: {
    position: "absolute",
    insetBlock: `min(0px, calc((100% - ${size.tapTarget}) / 2))`,
    insetInline: `min(0px, calc((100% - ${size.tapTarget}) / 2))`,
    borderWidth: size.hairline,
    borderStyle: "dashed",
    borderColor: colors.mutedForeground,
    borderRadius: radius.mark,
    cornerShape: radius.shape,
    pointerEvents: "none",
  },
  note: {
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
  },
});

const Area = ({ children }: { children: ReactNode }) => (
  <span {...stylex.props(styles.holder)}>
    {children}
    <span aria-hidden="true" {...stylex.props(styles.area)} />
  </span>
);

// Each dashed box is 44px each way: the room a finger has on a touch screen, unseen round the
// drawn button. The 28px buttons stand 16px apart, so no two press areas overlap.
export default function AccessibilityTouch() {
  return (
    <div {...stylex.props(styles.column)}>
      <div {...stylex.props(styles.row)}>
        <Area>
          <Button size="icon-xs" variant="ghost" aria-label="Bold">
            <Icon icon={BoldIcon} />
          </Button>
        </Area>
        <Area>
          <Button size="icon-xs" variant="ghost" aria-label="Italic">
            <Icon icon={ItalicIcon} />
          </Button>
        </Area>
        <Area>
          <Button size="icon-xs" variant="ghost" aria-label="Underline">
            <Icon icon={UnderlineIcon} />
          </Button>
        </Area>
      </div>
      <Area>
        <Button size="sm" variant="outline">
          Add a comment
        </Button>
      </Area>
      <p {...stylex.props(styles.note)}>
        The dashed boxes are drawn for this example; on a page the area is
        unseen.
      </p>
    </div>
  );
}
