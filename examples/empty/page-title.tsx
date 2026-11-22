import { Button } from "@grasp-os/ui/components/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@grasp-os/ui/components/empty";
import { colors, radius, size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  pages: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 18rem), 1fr))",
    gap: 16,
    width: "100%",
  },
  page: {
    display: "grid",
    borderRadius: radius.base,
    cornerShape: radius.shape,
    backgroundColor: colors.card,
    boxShadow: size.borderStrong,
  },
});

// Two whole pages, side by side. Nothing at this address: the state is the page, so its title is
// the page's h1 (`level={1}`), drawn as any Empty title is. A route's error page does the
// same with `variant="destructive"` and `announce={false}`: it is read as a page, not said as a live update.
export default function EmptyPageTitle() {
  return (
    <div {...stylex.props(layout.pages)}>
      <div {...stylex.props(layout.page)}>
        <Empty size="lg">
          <EmptyHeader>
            <EmptyMedia illustration="lost" />
            <EmptyTitle level={1}>No page at this address</EmptyTitle>
            <EmptyDescription>
              It may have moved, or the link has a typo in it.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="secondary">Go to your projects</Button>
          </EmptyContent>
        </Empty>
      </div>
      <div {...stylex.props(layout.page)}>
        <Empty size="lg" variant="destructive" announce={false}>
          <EmptyHeader>
            <EmptyMedia />
            <EmptyTitle level={1}>This page did not load</EmptyTitle>
            <EmptyDescription>
              Nothing is lost. Check your connection, then try again.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="secondary">Try again</Button>
          </EmptyContent>
        </Empty>
      </div>
    </div>
  );
}
