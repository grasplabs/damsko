import { Heading } from "@grasp-os/ui/components/heading";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  page: { display: "grid", gap: space[3], width: "100%", maxWidth: 480 },
});

// The level is the outline and the size the look: each level has a size of its own by default.
export default function HeadingOutline() {
  return (
    <div {...stylex.props(layout.page)}>
      <Heading level={1}>Reports</Heading>
      <Heading level={2}>Waiting for review</Heading>
      <Heading level={3}>Supplier review</Heading>
      <Heading level={4}>Notes from the meeting</Heading>
    </div>
  );
}
