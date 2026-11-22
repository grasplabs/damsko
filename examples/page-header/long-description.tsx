import { Button } from "@grasp-os/ui/components/button";
import { PageHeader } from "@grasp-os/ui/components/page-header";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  header: { width: "100%", maxWidth: 720 },
});

// A description someone wrote may run long: `descriptionLineClamp={2}` cuts it short after two lines,
// and a pointer's tooltip and a screen reader still have the whole text.
export default function PageHeaderLongDescription() {
  return (
    <PageHeader
      title="Spring launch"
      description="Everything the team ships in March: the new price list, the launch post and its newsletter, the short video for the shops, samples for every store, the photographer's day, and the press release that goes out on the last Friday, once the shops have heard it from us first."
      descriptionLineClamp={2}
      actions={<Button>New task</Button>}
      style={layout.header}
    />
  );
}
