// The app shell's variables. StyleX resolves them only when imported straight from a .stylex.ts
// file, so they live here, beside the shell's parts.
import * as stylex from "@stylexjs/stylex";

export const appShellVars = stylex.defineVars({
  /**
   * Room kept at the end of the page's bar beyond its own, for what a product lays over the card's
   * end at the bar's height (a button of its own). Set it on an element round the page.
   */
  barEndRoom: "0px",
});
