import { Button } from "@grasp-os/ui/components/button";
import {
  Empty,
  EmptyHeader,
  EmptyDescription,
  EmptyTitle,
  EmptyContent,
} from "@grasp-os/ui/components/empty";
import { colors, radius, size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 17rem), 1fr))",
    gap: 16,
    width: "100%",
  },
  place: {
    display: "grid",
    minHeight: 340,
    borderRadius: radius.base,
    cornerShape: radius.shape,
    backgroundColor: colors.card,
    boxShadow: size.borderStrong,
    overflow: "hidden",
  },
});

// A place with the shortest words and one with the longest (a title on two lines, a sentence on
// three, a button): the words keep to the same short measure. The spec reads this page.
export default function EmptyClearing() {
  return (
    <div {...stylex.props(layout.grid)}>
      <div {...stylex.props(layout.place)}>
        <Empty>
          <EmptyHeader>
            <EmptyDescription>None yet.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
      <div {...stylex.props(layout.place)}>
        <Empty>
          <EmptyHeader>
            <EmptyTitle>
              No reports match the words you searched for in this workspace
            </EmptyTitle>
            <EmptyDescription>
              Check the spelling or try a shorter word. Reports from the archive
              are not searched here, and all 214 reports are still in their
              place.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm">Clear the search</Button>
          </EmptyContent>
        </Empty>
      </div>
    </div>
  );
}
