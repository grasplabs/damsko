import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@grasp-os/ui/components/empty";
import { InboxIcon } from "@grasp-os/ui/lib/icons";

import { Not, Pair, Write } from "./pair";

// Why it is empty and what fills it, against a state that only says it is empty.
export default function WritingEmpty() {
  return (
    <Pair>
      <Write why="why, and what fills it">
        <Empty>
          <EmptyHeader>
            <EmptyMedia icon={InboxIcon} />
            <EmptyTitle>No projects yet</EmptyTitle>
            <EmptyDescription>
              Projects appear here once someone in the workspace creates one.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </Write>
      <Not why="says only that it is empty">
        <Empty>
          <EmptyHeader>
            <EmptyMedia icon={InboxIcon} />
            <EmptyTitle>No data</EmptyTitle>
            <EmptyDescription>Nothing to show.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </Not>
    </Pair>
  );
}
