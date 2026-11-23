// The corners where a browser draws no squircle (Safari before 27, Firefox): `corner-shape` is not
// there, so every corner is a plain round one, and a radius sized for a squircle reads far rounder:
// 20px makes a 36px button a pill and a 28px icon button a circle. Under
// `@supports not (corner-shape: squircle)` tokens.css sets each squircle corner to the plain radius
// that reads like it (about 0.45 of it, the control corner capped at a quarter of a 36px control),
// set by eye beside Chromium at 2x. Components read the variables, so each follows; their
// `min(corner, height / 2)` caps keep working.
//
// Written into the token CSS by tokens/generate.ts; a name here that is not a token fails it.
export const cornerFallbacks: Record<string, string> = {
  radius: "9px",
  "radius-mark": "4px",
  "sidebar-card-radius": "11px",
};
