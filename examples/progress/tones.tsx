import { Progress } from "@grasp-os/ui/components/progress";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: 24, width: "100%", maxWidth: 400 },
});

export default function ProgressTones() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Progress label="Imported" variant="success" value={100} />
      <Progress label="Slower than usual" variant="warning" value={40} />
      <Progress
        label="Stopped at the third file"
        variant="destructive"
        value={3}
        max={12}
        getAriaValueText={(value) => `${value} of 12 files`}
      />
    </div>
  );
}
