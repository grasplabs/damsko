// What Card's parts read from what holds them.
import * as stylex from "@stylexjs/stylex";

import { font } from "../lib/tokens.stylex";

/**
 * What a card hands its parts: the title's and the description's type are the card's, until a
 * header over a CardContent sets a section's (a larger line, the interface's tracking).
 */
export const cardVars = stylex.defineVars({
  titleSize: font.headingXs,
  titleLine: font.headingXsLine,
  titleTracking: font.trackingUiTitle,
  descriptionSize: font.textBase,
  descriptionLine: font.textBaseTightLine,
});
