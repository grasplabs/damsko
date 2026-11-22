import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@grasp-os/ui/components/empty";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: 16, width: "100%" },
});

// `lg` stands for a whole list, `default` for a card or a tab, `sm` for a small box.
export default function EmptySizes() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Empty size="lg">
        <EmptyHeader>
          <EmptyTitle>No reports yet</EmptyTitle>
          <EmptyDescription>
            Reports appear here once a review is closed.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
      <Empty size="default">
        <EmptyHeader>
          <EmptyTitle>No files</EmptyTitle>
          <EmptyDescription>
            Files shared in this project appear here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
      <Empty size="sm">
        <EmptyHeader>
          <EmptyDescription>Nothing pinned.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
