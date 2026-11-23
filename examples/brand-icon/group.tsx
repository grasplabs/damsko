import { BrandIconGroup } from "@grasp-os/ui/components/brand-icon";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

import { logos } from "./logos";

const layout = stylex.create({
  stack: { display: "grid", gap: space["4"], justifyItems: "start" },
});

// The tools an agent reaches, as one row of tiles: three shown, then "+2" for the rest, named
// once ("Slack, Google Drive, Notion and 2 others"). Two, with nothing more; one with a brand
// with no mark, by its name; and the first at `default`.
export default function BrandIconGroups() {
  return (
    <div {...stylex.props(layout.stack)}>
      <BrandIconGroup
        items={[
          logos.slack,
          logos["google-drive"],
          logos.notion,
          logos.stripe,
          logos.github,
        ]}
      />
      <BrandIconGroup items={[logos.slack, logos["google-sheets"]]} />
      <BrandIconGroup
        items={[logos.slack, { name: "Acme CRM" }, logos.notion, logos.stripe]}
      />
      <BrandIconGroup
        items={[
          logos.slack,
          logos["google-drive"],
          logos.notion,
          logos.stripe,
          logos.github,
        ]}
        size="sm"
      />
    </div>
  );
}
