import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

import SettingsPage from "./settings-page";

const layout = stylex.create({
  phone: {
    width: 360,
    maxWidth: "100%",
    paddingInline: space["4"],
    boxSizing: "border-box",
  },
});

// The same page at a phone's width: the column takes the whole width, and each control keeps its own
// width beside its words, which wrap.
export default function SettingsPagePhone() {
  return (
    <div {...stylex.props(layout.phone)}>
      <SettingsPage />
    </div>
  );
}
