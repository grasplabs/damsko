import { Progress } from "@grasp-os/ui/components/progress";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: 24, width: "100%", maxWidth: 400 },
});

export default function ProgressSizes() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Progress label="Small" size="sm" value={25} />
      <Progress label="Medium" value={65} />
      <Progress label="Large" size="lg" value={100} />
    </div>
  );
}
