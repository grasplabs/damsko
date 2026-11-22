import { Button } from "@grasp-os/ui/components/button";
import { PageHeader } from "@grasp-os/ui/components/page-header";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  header: { width: "100%", maxWidth: 720 },
});

// A settings sub-page: its crumbs already say where you are, so the title is a step down, in the
// sans, with no lead (`size="xs"`).
export default function PageHeaderSubPage() {
  return (
    <PageHeader
      size="xs"
      title="AI providers"
      actions={
        <Button size="sm" variant="outline">
          Add a provider
        </Button>
      }
      style={layout.header}
    />
  );
}
