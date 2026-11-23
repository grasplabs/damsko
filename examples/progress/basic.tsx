import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@grasp-os/ui/components/progress";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  bar: { maxWidth: 400 },
});

export default function ProgressBasic() {
  return (
    <Progress value={60} style={layout.bar}>
      <ProgressLabel>Exporting the report</ProgressLabel>
      <ProgressValue />
    </Progress>
  );
}
