import { Heading } from "@grasp-os/ui/components/heading";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: space[4], width: "100%" },
});

// From an opening title down to a section's inside a panel: four in the serif, the last two in the sans.
export default function HeadingSizes() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Heading level={1} size="xl">
        Welcome to the workspace
      </Heading>
      <Heading level={2} size="lg">
        Reports
      </Heading>
      <Heading level={3} size="default">
        This quarter
      </Heading>
      <Heading level={4} size="sm">
        Supplier review
      </Heading>
      <Heading level={4} size="xs">
        Team members
      </Heading>
      <Heading level={4} size="2xs">
        Notifications
      </Heading>
    </div>
  );
}
