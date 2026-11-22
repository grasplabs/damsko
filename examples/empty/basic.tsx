import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@grasp-os/ui/components/empty";
import { InboxIcon } from "@grasp-os/ui/lib/icons";

export default function EmptyBasic() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia icon={InboxIcon} />
        <EmptyTitle>No projects yet</EmptyTitle>
        <EmptyDescription>
          Projects appear here once someone in the workspace creates one.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
