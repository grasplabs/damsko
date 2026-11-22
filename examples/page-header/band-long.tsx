import { PageHeader } from "@grasp-os/ui/components/page-header";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  header: { width: "100%", maxWidth: 960 },
});

// A banner outside a shell, with a long title and no actions: it stays where it is, its own room
// round its words, the dither behind the title and the line along its foot.
export default function PageHeaderBandLong() {
  return (
    <PageHeader
      variant="banner"
      title="Interviews with the finance team about the year-end close"
      description="Eight people, two weeks. Notes land here as each one is done."
      style={layout.header}
    />
  );
}
