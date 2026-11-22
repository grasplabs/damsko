import { Button } from "@grasp-os/ui/components/button";
import { PageHeader } from "@grasp-os/ui/components/page-header";
import { DownloadIcon, Icon, LinkIcon, PlusIcon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  header: { width: "100%", maxWidth: 960 },
});

// A page with three actions, the main one last. On a phone the main one stays at the end of the
// title's row, the others fold into More beside it; narrowest, the main one is its icon, named by
// its words.
export default function PageHeaderActions() {
  return (
    <PageHeader
      title="Spring launch for the whole team"
      description="Everything the team ships in March, and who owns each part."
      actions={
        <>
          <Button variant="secondary">
            <Icon icon={DownloadIcon} />
            Export
          </Button>
          <Button variant="secondary">
            <Icon icon={LinkIcon} />
            Share
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
