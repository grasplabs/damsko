import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@grasp-os/ui/components/progress";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  bar: { maxWidth: 400 },
});

export default function ProgressUnknown() {
  return (
    <Progress value={null} style={layout.bar}>
      <ProgressLabel>Connecting to the workspace</ProgressLabel>
      <ProgressValue />
    </Progress>
  );
}
