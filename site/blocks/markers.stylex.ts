// Markers let a part of a block follow the state of an ancestor (stylex.when.ancestor) without a
// child selector. One per kind of state, so nested blocks never answer to each other's.
import * as stylex from "@stylexjs/stylex";

/** A control that says what it did: its label and marks react to data-action-state. */
export const actionMarker = stylex.defineMarker();
/** A stage: its box reacts to the ground and the view chosen. */
export const stageMarker = stylex.defineMarker();
/** A closed row: its plus and its content react to [open] and to the pointer. */
export const rowMarker = stylex.defineMarker();
/** A link that moves as one piece: its name, number and arrow react to the pointer. */
export const linkMarker = stylex.defineMarker();
/** A heading: its anchor shows under the pointer. */
export const headingMarker = stylex.defineMarker();
/** A block of code: its cut and its "Show all" react to [data-expanded]. */
export const codeMarker = stylex.defineMarker();
/** The sidebar: its moving bar shows once it has been placed ([data-bar-ready]). */
export const navMarker = stylex.defineMarker();
