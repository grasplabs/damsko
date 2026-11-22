import { Progress } from "@grasp-os/ui/components/progress";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  bar: { maxWidth: 400 },
});

export default function ProgressUnknown() {
  return (
    <Progress
      label="Connecting to the workspace"
      value={null}
      style={layout.bar}
    />
  );
}
