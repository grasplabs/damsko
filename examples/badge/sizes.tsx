import { Badge } from "@grasp-os/ui/components/badge";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

// Each size beside the text it is made for: `default` by a title, `sm` in a dense row of small text.
// The step between them is small on purpose; what tells them apart is the line each one sits in.
const layout = stylex.create({
  stack: { display: "grid", gap: space["4"], justifyItems: "start" },
  line: {
    display: "flex",
    alignItems: "center",
    gap: space["2"],
    margin: 0,
    color: colors.foreground,
  },
  title: {
    fontSize: font.textBase,
    lineHeight: font.textBaseLine,
    fontWeight: font.weightMedium,
  },
  dense: { fontSize: font.textSm, lineHeight: font.textSmLine },
  size: {
    color: colors.mutedForeground,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    fontWeight: font.weightNormal,
  },
});

export default function BadgeSizes() {
  return (
    <div {...stylex.props(layout.stack)}>
      <p {...stylex.props(layout.line, layout.title)}>
        Quarterly report
        <Badge variant="success">Ready</Badge>
        <span {...stylex.props(layout.size)}>default, by a title</span>
      </p>
      <p {...stylex.props(layout.line, layout.dense)}>
        Q3 pipeline
        <Badge size="sm" variant="success">
          Ready
        </Badge>
        <span {...stylex.props(layout.size)}>sm, in a dense row</span>
      </p>
    </div>
  );
}
