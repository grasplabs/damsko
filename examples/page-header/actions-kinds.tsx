import { Button } from "@grasp-os/ui/components/button";
import { PageHeader } from "@grasp-os/ui/components/page-header";
import {
  ArchiveIcon,
  DownloadIcon,
  Icon,
  LinkIcon,
  PlusIcon,
  TrashIcon,
} from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  header: { width: "100%", maxWidth: 960 },
});

// Every kind of action a page header folds on a phone: Delete, destructive, stands last in More
// and apart; Export, at work, is busy there; Archive, disabled, stays
// disabled; Open report, a link, is a link item. The main action, New task, stays on the row.
export default function PageHeaderActionsKinds() {
  return (
    <PageHeader
      title="Spring launch"
      description="Everything the team ships in March."
      actions={
        <>
          <Button variant="destructive">
            <Icon icon={TrashIcon} />
            Delete
          </Button>
          <Button
            variant="outline"
            status="loading"
            successText="Exported"
            errorText="Could not export"
          >
            <Icon icon={DownloadIcon} />
            Export
          </Button>
          <Button variant="outline" disabled>
            <Icon icon={ArchiveIcon} />
            Archive
          </Button>
          <Button variant="outline" asChild>
            <a href="#report">
              <Icon icon={LinkIcon} />
              Open report
            </a>
          </Button>
          <Button>
            <Icon icon={PlusIcon} />
            New task
          </Button>
        </>
      }
      style={layout.header}
    />
  );
}
