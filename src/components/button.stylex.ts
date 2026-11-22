// The button's marker: the parts inside a button (its sheen) follow the button's own hover and
// press through it (stylex.when.ancestor), without a selector that reaches into children. One
// marker per component, so a button inside another part never answers to that part's state.
import * as stylex from "@stylexjs/stylex";

export const buttonMarker = stylex.defineMarker();
