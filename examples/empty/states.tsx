import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@grasp-os/ui/components/empty";
import { InboxIcon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";

// Every state in a box as tall as the tallest (a title's line is taller than a sentence's), its
// words in the middle: a row of states is one size.
const layout = stylex.create({
  box: {
    display: "grid",
    alignContent: "center",
    width: "100%",
    minHeight: 60,
  },
});

// One empty state in one state, at the inline size so it fits its cell. The docs draw it with a
// sentence or a title alone. It has no hover, focus or press: it is read.
export default function EmptyState({
  kind = "empty",
  title,
  icon = false,
  words = "Nothing pinned.",
}: {
  kind?: "empty" | "error";
  title?: string;
  icon?: boolean;
  words?: string | null;
}) {
  return (
    <div {...stylex.props(layout.box)}>
      <Empty size="sm" variant={kind === "error" ? "destructive" : "default"}>
        <EmptyHeader>
          <EmptyMedia icon={icon ? InboxIcon : undefined} />
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{words ?? undefined}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
