// Markers for the brand book (stylex.when.ancestor): a part follows its wall's state without a
// child selector.
import * as stylex from "@stylexjs/stylex";

/** A wall: its pick-up shows under the pointer, or when focus is inside it. */
export const wallMarker = stylex.defineMarker();
/** A colour of the light: its copy shows under the pointer or with focus. */
