import { Button } from "@grasp-os/ui/components/button";
import { PageHeader } from "@grasp-os/ui/components/page-header";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  header: { width: "100%", maxWidth: 720 },
});

// Basic usage while the page loads: placeholders stand where the title and the line will be, in their
// place and size, and the actions stay. Turn `loading` off and nothing moves.
export default function PageHeaderLoading() {
  return (
    <PageHeader
      title="Spring launch"
      description="Everything the team ships in March, and who owns each part."
      loading
      actions={
        <>
          <Button variant="secondary">Share</Button>
          <Button>New task</Button>
        </>
      }
      style={layout.header}
    />
  );
}
