import { Progress } from "@grasp-os/ui/components/progress";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  bar: { maxWidth: 400 },
});

export default function ProgressBasic() {
  return (
    <Progress label="Exporting the report" value={60} style={layout.bar} />
  );
}
