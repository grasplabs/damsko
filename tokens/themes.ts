// Grasp's own themes, as colours. A theme is a named set of colour values on top of a mode (light
// or dark), nothing else: it never changes spacing, type sizes or corners, and no component knows a
// theme's name. It says two things:
//
//   neutrals  where the system's neutral family goes: every literal colour in it (the grounds'
//             tints, the lines, the hovers and fills, the quiet inks, written as the evergreen ink
//             at some opacity) moves to this hue and keeps this share of its chroma, so a theme
//             changes the whole family without naming each token
//   set       exact values for the tokens that carry it: the grounds and the inks, light and dark
//
// The brand's colours, the status colours and the app shell's own greys are never moved: the light
// is Grasp's in every theme (tokens/generate.ts). Each theme's block restates every colour token, so
// references like `tree-view-guide: {hairline}` follow the theme on any subtree.

/** A colour value for one token, light and dark, in oklch(). */
export interface ThemeColour {
  light?: string;
  dark?: string;
}

export interface Theme {
  /** Its name in code and in `data-theme`. */
  id: string;
  /** Where the neutral family moves. Leave it out to keep evergreen's. */
  neutrals?: { hue: number; chroma: number };
  /** Exact values, by token name. */
  set: Record<string, ThemeColour>;
}

export const themes: readonly Theme[] = [
  { id: "evergreen", set: {} },
  {
    id: "pine",
    neutrals: { hue: 178, chroma: 2 },
    set: {
      background: {
        light: "oklch(0.972 0.014 172)",
        dark: "oklch(0.215 0.058 178)",
      },
      muted: { light: "oklch(0.948 0.022 172)", dark: "oklch(0.25 0.066 178)" },
      card: { light: "oklch(0.988 0.008 172)", dark: "oklch(0.29 0.072 178)" },
      foreground: {
        light: "oklch(0.25 0.062 176)",
        dark: "oklch(0.965 0.022 165)",
      },
      "body-foreground": {
        light: "oklch(0.33 0.058 176)",
        dark: "oklch(0.89 0.032 165)",
      },
      "muted-foreground": {
        light: "oklch(0.45 0.052 176)",
        dark: "oklch(0.74 0.04 168)",
      },
      ring: { light: "oklch(0.42 0.06 176)", dark: "oklch(0.8 0.05 168)" },
      primary: { light: "oklch(0.36 0.075 177)" },
      "primary-active": {
        light: "oklch(0.3 0.068 177)",
        dark: "oklch(0.88 0.03 165)",
      },
      "checkbox-bg-hover": { light: "oklch(0.42 0.08 177)" },
      secondary: { light: "oklch(0.99 0.006 172)" },
      "secondary-active": { light: "oklch(0.93 0.026 172)" },
    },
  },
  {
    id: "paper",
    neutrals: { hue: 75, chroma: 0.22 },
    set: {
      background: {
        light: "oklch(0.982 0.007 85)",
        dark: "oklch(0.205 0.006 75)",
      },
      muted: { light: "oklch(0.958 0.01 85)", dark: "oklch(0.235 0.007 75)" },
      card: { light: "oklch(0.995 0.004 85)", dark: "oklch(0.265 0.008 75)" },
      foreground: {
        light: "oklch(0.23 0.008 70)",
        dark: "oklch(0.955 0.008 85)",
      },
      "body-foreground": {
        light: "oklch(0.33 0.008 70)",
        dark: "oklch(0.87 0.008 85)",
      },
      "muted-foreground": {
        light: "oklch(0.49 0.01 70)",
        dark: "oklch(0.72 0.01 80)",
      },
      ring: { light: "oklch(0.44 0.01 70)", dark: "oklch(0.78 0.01 80)" },
      primary: { light: "oklch(0.27 0.01 70)" },
      "primary-active": {
        light: "oklch(0.22 0.01 70)",
        dark: "oklch(0.86 0.008 85)",
      },
      "checkbox-bg-hover": { light: "oklch(0.34 0.01 70)" },
      "secondary-active": { light: "oklch(0.94 0.01 85)" },
    },
  },
];
