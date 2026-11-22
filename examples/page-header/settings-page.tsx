import { Button } from "@grasp-os/ui/components/button";
import { PageHeader } from "@grasp-os/ui/components/page-header";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  header: { width: "100%", maxWidth: 720 },
});

// A settings page: the page's serif at the middle size, no lead, as dense as a sub-page
// (`size="sm"`).
export default function PageHeaderSettingsPage() {
  return (
    <PageHeader
      size="sm"
      title="Profile"
      actions={
        <Button size="sm" variant="secondary">
          Save changes
        </Button>
      }
      style={layout.header}
    />
  );
}
