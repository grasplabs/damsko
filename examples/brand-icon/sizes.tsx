import { BrandIcon } from "@grasp-os/ui/components/brand-icon";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

import { logos } from "./logos";

const layout = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space["4"],
  },
});

// Avatar's sizes, 24 to 48px, and the mark alone at the end, as it stands beside words.
export default function BrandIconsSizes() {
  return (
    <div {...stylex.props(layout.row)}>
      <BrandIcon {...logos.slack} size="xs" />
      <BrandIcon {...logos.slack} size="sm" />
      <BrandIcon {...logos.slack} size="default" />
      <BrandIcon {...logos.slack} size="lg" />
      <BrandIcon {...logos.slack} size="sm" tile={false} />
    </div>
  );
}
