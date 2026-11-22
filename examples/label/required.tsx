import { Input } from "@grasp-os/ui/components/input";
import { Label } from "@grasp-os/ui/components/label";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  column: { display: "grid", gap: space[2], width: "100%", maxWidth: 360 },
});

// `required` shows the quiet mark after the words, for the eye only: the control's own `required`
// says it to a screen reader. The mark is never part of the label's text.
export default function LabelRequired() {
  return (
    <div {...stylex.props(layout.column)}>
      <Label htmlFor="label-project-code" required>
        Project code
      </Label>
      <Input id="label-project-code" required />
    </div>
  );
}
