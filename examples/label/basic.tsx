import { Input } from "@grasp-os/ui/components/input";
import { Label } from "@grasp-os/ui/components/label";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  column: { display: "grid", gap: space[2], width: "100%", maxWidth: 360 },
});

// A name you can see for a control outside a Field, tied to it by `htmlFor`: a press on the name
// puts the caret in the field.
export default function LabelBasic() {
  return (
    <div {...stylex.props(layout.column)}>
      <Label htmlFor="label-team-name">Team name</Label>
      <Input id="label-team-name" defaultValue="Finance" />
    </div>
  );
}
