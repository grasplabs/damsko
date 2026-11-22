import { ProgressCircle } from "@grasp-os/ui/components/progress";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  row: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 24 },
});

export default function ProgressRings() {
  return (
    <div {...stylex.props(layout.row)}>
      <ProgressCircle size="sm" label="Saving" value={50} />
      <ProgressCircle label="Uploading" value={50} />
      <ProgressCircle size="lg" label="Uploading the photos" value={25} />
      <ProgressCircle size="lg" label="Syncing" value={65} />
      <ProgressCircle label="Connecting" value={null} />
    </div>
  );
}
