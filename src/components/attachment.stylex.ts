// What an AttachmentGroup reads from the part round it (attachment.tsx): the room its row keeps at
// each side, inside the sideways scroll. A prompt input sets it to its card's own inset, so the row
// runs to the card's edge and its files still start where the card's words do.
import * as stylex from "@stylexjs/stylex";

import { space } from "../lib/tokens.stylex";

export const attachmentVars = stylex.defineVars({
  /** The room at each side of the row: by default a focus ring's, as above and below. */
  inset: space["1"],
});
