import { Text } from "@grasp-os/ui/components/text";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: space[2], width: "100%", maxWidth: 480 },
});

// Four colours, from what is read first to what is read last. Weight says a name or a label.
export default function TextTones() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Text color="default" weight="medium">
        Quarterly summary
      </Text>
      <Text color="secondary">
        The numbers for the third quarter, with the notes from the review.
      </Text>
      <Text color="muted">Shared with the whole workspace.</Text>
      <Text color="subtle" size="sm">
        14 pages
      </Text>
    </div>
  );
}
