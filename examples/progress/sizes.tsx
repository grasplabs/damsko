import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@grasp-os/ui/components/progress";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: 24, width: "100%", maxWidth: 400 },
});

export default function ProgressSizes() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Progress size="sm" value={25}>
        <ProgressLabel>Small</ProgressLabel>
        <ProgressValue />
      </Progress>
      <Progress value={65}>
        <ProgressLabel>Medium</ProgressLabel>
        <ProgressValue />
      </Progress>
      <Progress size="lg" value={100}>
        <ProgressLabel>Large</ProgressLabel>
        <ProgressValue />
      </Progress>
    </div>
  );
}
