// Markers for the foundations scenes: a part follows the state of its own card and of nothing
// else. (The default marker is also worn by the frame a scene stands in, so a part that followed
// it answered to a pointer anywhere over the scene.)
import * as stylex from "@stylexjs/stylex";

/** A card in "Lifted by what it does": its height's words follow its pointer, focus and press. */
export const liftCard = stylex.defineMarker();
