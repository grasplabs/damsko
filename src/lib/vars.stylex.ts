// The variables and markers every component shares. StyleX resolves a variable or a marker only
// when it is imported straight from a .stylex.ts file, so they live here, not in styles.ts.
import * as stylex from "@stylexjs/stylex";

import { duration, size } from "./tokens.stylex";

const REDUCED = "@media (prefers-reduced-motion: reduce)";

/**
 * The two values an icon reads from whoever holds it. StyleX does not let a parent style its
 * children, so a component that holds an icon sets these on itself and
 * every Icon inside follows: `{ [iconVars.size]: size.iconSm }`. Never size an icon from outside.
 */
export const iconVars = stylex.defineVars({
  /** Width and height of the icon. */
  size: size.iconSm,
  /** Stroke width, in the icon's 24-unit grid. */
  stroke: size.iconStroke,
});

/**
 * The times things move or fade, which become 0s when the person asks for reduced motion: a part
 * that would move, grow or fade is then simply there, and simply gone. Use these for movement, size
 * and fades:
 *
 *   transitionProperty: "opacity, transform",
 *   transitionDuration: { default: motionVars.ui, ":is([data-ending-style])": motionVars.leave },
 *
 * A colour easing under the pointer is not motion: keep `duration.hover` there. A spinner or a
 * progress bar that must keep a sign of life under reduced motion keeps a slow fade of its own.
 */
export const motionVars = stylex.defineVars({
  /** A press shrinking a control a little. */
  press: { default: duration.press, [REDUCED]: "0s" },
  /** A small change of place or shape (a chevron turning). */
  hover: { default: duration.hover, [REDUCED]: "0s" },
  /** A mark drawn in, words sliding in beside it. */
  mark: { default: duration.mark, [REDUCED]: "0s" },
  /** One state giving way to the next on a control. */
  swap: { default: duration.swap, [REDUCED]: "0s" },
  /** Something coming in at full length: a toast into its stack, a sheet from its side. */
  open: { default: duration.open, [REDUCED]: "0s" },
  /** Something opening (a popup, a panel). */
  ui: { default: duration.ui, [REDUCED]: "0s" },
  /** Something leaving, faster than it came. */
  leave: { default: duration.leave, [REDUCED]: "0s" },
  /** A beat to wait before something follows what moved first. */
  stagger: { default: duration.stagger, [REDUCED]: "0s" },
  /** A tooltip leaving. */
  tooltipLeave: { default: duration.tooltipLeave, [REDUCED]: "0s" },
  /** Words following their mark. */
  follow: { default: duration.resultFollow, [REDUCED]: "0s" },
  /** A confirmation settling into its new form. */
  settle: { default: duration.confirmationSettle, [REDUCED]: "0s" },
  /** A collapsible opening to its height. */
  collapsibleOpen: { default: duration.collapsibleOpen, [REDUCED]: "0s" },
  /** A switch's thumb travelling on its spring. */
  travel: { default: duration.switchTravel, [REDUCED]: "0s" },
  /** A switch's light following its thumb. */
  trail: { default: duration.switchTrail, [REDUCED]: "0s" },
  /** The command palette fading in. */
  searchOpen: { default: duration.searchOpen, [REDUCED]: "0s" },
  /** The command palette fading out. */
  searchClose: { default: duration.searchClose, [REDUCED]: "0s" },
  /** A popup opening (a menu, a list, a popover). */
  popup: { default: duration.popup, [REDUCED]: "0s" },
  /** A level slider's thumb snapping to a level. */
  snap: { default: duration.sliderLevelsSnap, [REDUCED]: "0s" },
});

/** The marker a control carries when its focus ring is drawn on a part inside it (`focusLabel`). */
export const focusMarker = stylex.defineMarker();

/** The marker of a list popup, so a part inside it can answer the popup's state (`listStyles`). */
export const listMarker = stylex.defineMarker();

/** The marker of a menu's panel, so an item can answer what the panel holds (`menuStyles`). */
export const menuMarker = stylex.defineMarker();

/**
 * On every Field: its label shows the required mark when the field holds a required control, and a
 * control inside answers the field's own state (a pointer anywhere on a horizontal row, the field
 * shown as wrong) through stylex.when.ancestor, without a selector that reaches into children.
 */
export const fieldControlMarker = stylex.defineMarker();

/**
 * The marker of the Toaster's region, so a layer can tell focus went into a toast (a popover stays
 * open while a toast's action is pressed): `closest` finds it by its class.
 */
export const toastRegionMarker = stylex.defineMarker();

/**
 * The marker of a layer's footer (a dialog's, an alert dialog's, a drawer's, a sheet's): on a phone
 * every Button in it takes an equal part of the line (button.tsx).
 */
export const layerFooterMarker = stylex.defineMarker();

/**
 * The marker of a card that holds a Trace row (Tool's): the row's trigger runs the card's width and
 * takes no fill under the pointer, only its words turn to ink, as a row that opens in a list does
 * (trace.tsx). A fill only as wide as the words would stand as a block of its own inside the card.
 */
export const traceCardMarker = stylex.defineMarker();
