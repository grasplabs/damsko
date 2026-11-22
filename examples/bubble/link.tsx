import { Bubble, BubbleContent } from "@grasp-os/ui/components/bubble";
import { Link } from "@grasp-os/ui/components/link";
import * as stylex from "@stylexjs/stylex";

import { layout } from "./layout";

// A link among the words of a filled Bubble: reached by Tab, its ring in the ink that is seen on
// the fill, light and dark.
export default function BubbleLink() {
  return (
    <div {...stylex.props(layout.column)}>
      <Bubble align="end">
        <BubbleContent>
          The numbers are in the <Link href="#report">quarterly report</Link> on
          page four.
        </BubbleContent>
      </Bubble>
    </div>
  );
}
