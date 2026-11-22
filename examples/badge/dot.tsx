import { Badge } from "@grasp-os/ui/components/badge";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  rows: { display: "grid", gap: space["2"], justifyItems: "start" },
});

// How serious, as a dot beside words in the text colour: a page full of them is not painted red.
// Alone, with no words, the dot is named by its variant.
export default function BadgeDot() {
  return (
    <div {...stylex.props(layout.rows)}>
      <Badge dot variant="destructive">
        3 errors
      </Badge>
      <Badge dot variant="warning">
        12 warnings
      </Badge>
      <Badge dot variant="info">
        Started at 09:12
      </Badge>
      <Badge dot variant="destructive" />
    </div>
  );
}
