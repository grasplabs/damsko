import { Button } from "@grasp-os/ui/components/button";
import { EllipsisIcon, FolderIcon, Icon } from "@grasp-os/ui/lib/icons";
import { colors, radius, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  heads: { display: "grid", gap: space["3"], justifyItems: "start" },
  // A narrow panel's head: the name may shrink, More always stays in view.
  head: {
    display: "flex",
    alignItems: "center",
    gap: space["1"],
    boxSizing: "border-box",
    paddingBlock: space["1"],
    paddingInline: space["2"],
    borderRadius: radius.base,
    cornerShape: radius.shape,
    backgroundColor: colors.card,
    boxShadow: `inset 0 0 0 ${size.hairline} ${colors.border}`,
  },
  narrow: { width: 120 },
  wide: { width: 240 },
});

// A long name in a narrow head: on one line, cut with an ellipsis, whole in its name.
export default function ButtonTruncate() {
  return (
    <div {...stylex.props(layout.heads)}>
      <div
        role="group"
        aria-label="Narrow head"
        {...stylex.props(layout.head, layout.narrow)}
      >
        <Button truncate size="sm" variant="ghost">
          <Icon icon={FolderIcon} />
          Quarterly planning
        </Button>
        <Button size="icon-sm" variant="ghost" aria-label="More actions">
          <Icon icon={EllipsisIcon} />
        </Button>
      </div>
      <div
        role="group"
        aria-label="Wide head"
        {...stylex.props(layout.head, layout.wide)}
      >
        <Button truncate size="sm" variant="ghost">
          <Icon icon={FolderIcon} />
          Quarterly planning
        </Button>
        <Button size="icon-sm" variant="ghost" aria-label="More actions">
          <Icon icon={EllipsisIcon} />
        </Button>
      </div>
    </div>
  );
}
