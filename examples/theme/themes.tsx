import { themeIds } from "@grasp-os/ui/components/theme-toggle";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

import { ThemePanel } from "./panel";

const styles = stylex.create({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 17rem), 1fr))",
    gap: space["4"],
    width: "100%",
    minWidth: 0,
  },
});

// The three themes, light and dark, each on its own subtree beside the others; then a fourth row,
// a proposal: Pine taken further, with a dither on its grounds.
export default function ThemesBoard() {
  return (
    <div {...stylex.props(styles.grid)}>
      {themeIds.flatMap((theme) =>
        (["light", "dark"] as const).map((mode) => (
          <ThemePanel key={`${theme}-${mode}`} theme={theme} mode={mode} />
        ))
      )}
      {(["light", "dark"] as const).map((mode) => (
        <ThemePanel
          key={`pine-dither-${mode}`}
          theme="pine"
          mode={mode}
          title="Pine, dithered (proposal)"
          dithered
        />
      ))}
    </div>
  );
}
