import { Button } from "@grasp-os/ui/components/button";
import { Icon, TrashIcon } from "@grasp-os/ui/lib/icons";
import { size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

import { Not, Pair, Write } from "./pair";

const styles = stylex.create({
  pair: { width: "100%", maxWidth: 720, minWidth: 0 },
  // Wrapped onto two lines on a phone, the rows stand a finger apart.
  row: {
    display: "flex",
    flexWrap: "wrap",
    columnGap: space["2"],
    rowGap: `calc(${size.tapTarget} - ${size.controlSm})`,
  },
});

// Two rows, one Delete each. Named for their row, a person can say either and an agent can find
// either; both named Delete, neither can be told from the other.
export default function AccessibilityNamesApart() {
  return (
    <div {...stylex.props(styles.pair)}>
      <Pair>
        <Write why="each says which">
          <div {...stylex.props(styles.row)}>
            <Button variant="secondary" size="sm">
              <Icon icon={TrashIcon} />
              Delete Q3 report
            </Button>
            <Button variant="secondary" size="sm">
              <Icon icon={TrashIcon} />
              Delete Q4 report
            </Button>
          </div>
        </Write>
        <Not why="two of one name">
          <div {...stylex.props(styles.row)}>
            <Button variant="secondary" size="sm">
              <Icon icon={TrashIcon} />
              Delete
            </Button>
            <Button variant="secondary" size="sm">
              <Icon icon={TrashIcon} />
              Delete
            </Button>
          </div>
        </Not>
      </Pair>
    </div>
  );
}
