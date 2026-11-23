import { BrandIcon } from "@grasp-os/ui/components/brand-icon";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

import { logos } from "./logos";

const layout = stylex.create({
  stack: { display: "grid", gap: space["4"], justifyItems: "start" },
  row: { display: "flex", alignItems: "center", gap: space["3"] },
});

const sizes = ["xs", "sm", "default", "lg"] as const;

// A brand with no mark ("Acme CRM"): `label` alone, with no `logo`, and the tile shows its
// first letter on its quiet ground, in the same squircle as a mark beside it, at every size.
export default function BrandIconFallback() {
  return (
    <div {...stylex.props(layout.stack)}>
      {sizes.map((size) => (
        <div key={size} {...stylex.props(layout.row)}>
          <BrandIcon {...logos.slack} size={size} />
          <BrandIcon name="Acme CRM" size={size} />
          <BrandIcon {...logos.notion} size={size} />
        </div>
      ))}
    </div>
  );
}
