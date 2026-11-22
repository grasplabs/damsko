import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@grasp-os/ui/components/empty";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: 16, width: "100%" },
});

// It did not load: never read as an empty list. Its own title, unless you give it a better one.
export default function EmptyError() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Empty variant="destructive">
        <EmptyHeader>
          <EmptyMedia />
          <EmptyTitle />
          <EmptyDescription>
            Try again in a moment, or open the page again.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
      <Empty variant="destructive">
        <EmptyHeader>
          <EmptyMedia />
          <EmptyTitle>This section is unavailable</EmptyTitle>
          <EmptyDescription>Open the page again to see it.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
