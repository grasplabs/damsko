import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@grasp-os/ui/components/alert";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: 12, width: "100%", maxWidth: 560 },
});

// Every part is optional: a sentence alone, a title alone, or no icon.
export default function AlertCompositions() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Alert variant="warning">
        <AlertDescription>
          The mapping for this domain is not finished.
        </AlertDescription>
      </Alert>
      <Alert>
        <AlertTitle>Choose a team to compare its projects</AlertTitle>
      </Alert>
      <Alert icon={false}>
        <AlertDescription>
          New projects are shared with the whole workspace.
        </AlertDescription>
      </Alert>
    </div>
  );
}
