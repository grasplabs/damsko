import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@grasp-os/ui/components/progress";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: 24, width: "100%", maxWidth: 400 },
});

export default function ProgressTones() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Progress variant="success" value={100}>
        <ProgressLabel>Imported</ProgressLabel>
        <ProgressValue />
      </Progress>
      <Progress variant="warning" value={40}>
        <ProgressLabel>Slower than usual</ProgressLabel>
        <ProgressValue />
      </Progress>
      <Progress
        variant="destructive"
        value={3}
        max={12}
        getAriaValueText={(value) => `${value} of 12 files`}
      >
        <ProgressLabel>Stopped at the third file</ProgressLabel>
        <ProgressValue />
      </Progress>
    </div>
  );
}
