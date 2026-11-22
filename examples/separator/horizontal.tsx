import { Separator } from "@grasp-os/ui/components/separator";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: space["3"], width: "100%", maxWidth: 360 },
  title: { margin: 0, fontWeight: font.weightMedium },
  note: { margin: 0, color: colors.mutedForeground },
});

export default function SeparatorHorizontal() {
  return (
    <div {...stylex.props(layout.stack)}>
      <div>
        <p {...stylex.props(layout.title)}>Quarterly summary</p>
        <p {...stylex.props(layout.note)}>Updated on 3 November</p>
      </div>
      <Separator />
      <p {...stylex.props(layout.note)}>
        Sales held steady; the new region brought in its first customers.
      </p>
    </div>
  );
}
