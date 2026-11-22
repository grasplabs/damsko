import { BrandIcon } from "@grasp-os/ui/components/brand-icon";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

import { logos } from "./logos";
import type { Brand } from "./logos";

const layout = stylex.create({
  rows: { display: "grid", rowGap: space["4"] },
  row: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space["3"],
  },
});

const shown: Brand[] = ["google", "slack", "figma", "github", "youtube", "x"];

// The brand's own colours, then the same shapes in the text colour. GitHub and X follow the ink in
// both rows, so they stand in light and dark.
export default function BrandIconsTones() {
  return (
    <div {...stylex.props(layout.rows)}>
      {(["brand", "mono"] as const).map((variant) => (
        <div key={variant} {...stylex.props(layout.row)}>
          {shown.map((brand) => (
            <BrandIcon
              key={brand}
              {...logos[brand]}
              variant={variant}
              size="default"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
