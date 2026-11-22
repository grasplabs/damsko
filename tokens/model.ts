// What the token files are made from: the tokens of tokens/tokens.ts resolved, named and checked,
// and the themes of tokens/themes.ts laid over them. Pure functions of their arguments, so the
// generator and its tests share them; tokens/generate.ts writes the files.
import { contrast, parseOklch } from "./contrast.ts";
import type { Theme } from "./themes.ts";
import type { Category, ContrastPair, HueBand, Token } from "./tokens.ts";

export type Scheme = "light" | "dark";

export const camel = (name: string) =>
  name.replaceAll(/-(?<next>[a-z0-9])/gu, (_match, next: string) =>
    next.toUpperCase()
  );

/** The CSS variable of a token: prefixed, so it never meets another kit's `--background`. */
export const cssVar = (name: string) => `--damsko-${name}`;

// The categories whose word starts their tokens' names: the word is the object's name in StyleX,
// so it is not said twice (`--damsko-font-sans` is `font.sans`, `--damsko-space-4` is `space[4]`).
const CATEGORY_WORDS: Partial<Record<Category, string>> = {
  duration: "duration",
  font: "font",
  radius: "radius",
  shadow: "shadow",
  space: "space",
};

/** A token's key in its StyleX object: its name in camel case, less its category's word. */
export const stylexKey = (name: string, category: Category) => {
  const word = CATEGORY_WORDS[category];
  if (word === undefined) {
    return camel(name);
  }
  if (name === word) {
    return "base";
  }
  return camel(
    name.startsWith(`${word}-`) ? name.slice(word.length + 1) : name
  );
};

export const REF = /\{(?<ref>[a-z0-9-]+)\}/gu;
// A colour in a value: an oklch() written out, or a reference to another token.
export const COLOUR = /oklch\([^)]*\)|\{[a-z0-9-]+\}/gu;
export const OKLCH = /oklch\([^)]*\)/gu;

const refsOf = (token: Token) =>
  [...`${token.value} ${token.dark ?? ""}`.matchAll(REF)].map(
    (match) => match.groups?.ref ?? ""
  );

/** The tokens by name, with every name unique and every reference to a token that exists. */
export const indexTokens = (tokens: readonly Token[]) => {
  const byName = new Map(tokens.map((token) => [token.name, token]));
  if (byName.size !== tokens.length) {
    throw new Error("Two tokens share a name. Every name must be unique.");
  }
  for (const token of tokens) {
    for (const ref of refsOf(token)) {
      const target = byName.get(ref);
      if (target === undefined) {
        throw new Error(`${token.name} names {${ref}}, which does not exist.`);
      }
    }
  }
  return byName;
};

/** A token's raw light and dark values. */
export interface Values {
  value: string;
  dark?: string;
}

/** Follows every reference of a token, in a scheme, through the values `valuesOf` gives. */
export const resolver = (
  byName: ReadonlyMap<string, Token>,
  valuesOf: (token: Token) => Values = (token) => token
) => {
  const resolve = (
    name: string,
    scheme: Scheme,
    seen: string[] = []
  ): string => {
    if (seen.includes(name)) {
      throw new Error(
        `Token references go round in a circle: ${[...seen, name].join(" > ")}.`
      );
    }
    const token = byName.get(name);
    if (token === undefined) {
      throw new Error(`Cannot resolve {${name}}.`);
    }
    const { value, dark } = valuesOf(token);
    const raw =
      scheme === "dark" && dark !== undefined && dark !== "" ? dark : value;
    return raw.replace(REF, (_match, ref: string) =>
      resolve(ref, scheme, [...seen, name])
    );
  };
  return resolve;
};

export const isColourValue = (value: string) => value.startsWith("oklch(");

/** A single colour: an oklch() or a reference to a colour token. */
const isOneColour = (
  value: string,
  isColourToken: (name: string) => boolean
) => {
  const ref = /^\{(?<name>[a-z0-9-]+)\}$/u.exec(value)?.groups?.name;
  return ref === undefined
    ? /^oklch\([^)]*\)$/u.test(value)
    : isColourToken(ref);
};

/**
 * A value as CSS: references as `var()` of the name `nameOf` gives, and a colour or a shadow with a
 * dark value through light-dark(), which takes colours only. A colour token is wrapped whole; a
 * shadow is written once, with each colour that differs wrapped in place, so it still follows the
 * color-scheme of the element that uses it. Light and dark must then differ in colours only.
 */
export const cssValue = (
  name: string,
  { value, dark }: Values,
  varOf: (ref: string) => string,
  isColourToken: (ref: string) => boolean
) => {
  const toCss = (text: string) =>
    text.replace(REF, (_match, ref: string) => `var(${varOf(ref)})`);
  if (dark === undefined || dark === "" || dark === value) {
    return toCss(value);
  }
  if (isOneColour(value, isColourToken) && isOneColour(dark, isColourToken)) {
    return `light-dark(${toCss(value)}, ${toCss(dark)})`;
  }
  const light = value.match(COLOUR) ?? [];
  const darks = dark.match(COLOUR) ?? [];
  if (
    light.length === 0 ||
    light.length !== darks.length ||
    value.replace(COLOUR, "c") !== dark.replace(COLOUR, "c")
  ) {
    throw new Error(
      `Token ${name}: its light and dark values must differ in their colours only.`
    );
  }
  let index = 0;
  return value.replace(COLOUR, (colour) => {
    const other = darks[index] ?? colour;
    index += 1;
    if (other === colour) {
      return toCss(colour);
    }
    if (
      !(isOneColour(colour, isColourToken) && isOneColour(other, isColourToken))
    ) {
      throw new Error(
        `Token ${name}: ${colour} and ${other} are not both colours.`
      );
    }
    return `light-dark(${toCss(colour)}, ${toCss(other)})`;
  });
};

// ---- The brand check ---------------------------------------------------------------------------

/** A brand list, as tokens/tokens.ts writes it. */
export interface BrandList {
  colours: readonly string[];
  tolerance: number;
  neutralChroma: number;
  status: readonly HueBand[];
}

/** A number in an oklch() colour, 0 for `none`. */
const number = (value: string | undefined) =>
  value === undefined || value === "none" ? 0 : Number(value);

/** An oklch() colour's chroma and hue. */
const partsOf = (colour: string) => {
  const parts =
    /^oklch\(\s*[\d.]+%?\s+(?<chroma>[\d.]+|none)\s+(?<hue>[\d.]+|none)/u.exec(
      colour
    )?.groups;
  if (parts === undefined) {
    throw new Error(`Not an oklch() colour: ${colour}`);
  }
  return { chroma: number(parts.chroma), hue: number(parts.hue) };
};

/** Whether a hue lies in a band, reading the band round the circle when `from` is past `to`. */
const inBand = (hue: number, { from, to }: HueBand) =>
  from <= to ? hue >= from && hue <= to : hue >= from || hue <= to;

/**
 * Every literal colour of Damsko's tokens (and of the themes' values) that is not on the brand
 * list: not a neutral, not of the brand colours' hue family, not a status hue.
 */
export const offBrand = (
  tokens: readonly Token[],
  list: BrandList,
  themes: readonly Theme[] = []
) => {
  const byName = new Map(tokens.map((token) => [token.name, token]));
  const hues = list.colours.map((name) => {
    const token = byName.get(name);
    if (token === undefined || !isColourValue(token.value)) {
      throw new Error(
        `Brand colour ${name} is not a token with an oklch() value.`
      );
    }
    return partsOf(token.value).hue;
  });
  const family: HueBand = {
    name: "brand",
    from: Math.min(...hues) - list.tolerance,
    to: Math.max(...hues) + list.tolerance,
  };
  const passes = (colour: string) => {
    const { chroma, hue } = partsOf(colour);
    return (
      chroma < list.neutralChroma ||
      inBand(hue, family) ||
      list.status.some((band) => inBand(hue, band))
    );
  };
  const found: { token: string; colour: string }[] = [];
  const judge = (name: string, text: string) => {
    for (const colour of text.match(OKLCH) ?? []) {
      if (!passes(colour)) {
        found.push({ token: name, colour });
      }
    }
  };
  for (const token of tokens) {
    judge(token.name, `${token.value} ${token.dark ?? ""}`);
  }
  for (const theme of themes) {
    for (const [name, colour] of Object.entries(theme.set)) {
      const target = byName.get(name);
      if (target !== undefined) {
        judge(name, `${colour.light ?? ""} ${colour.dark ?? ""}`);
      }
    }
  }
  return found;
};

// ---- Themes ------------------------------------------------------------------------------------

// Never moved by a theme: the brand's light, mint and lime, the accents and status colours (all of
// them above the neutrals' chroma), and the sidebar's own greys.
const fixed = (name: string) => /^(?:brand|sidebar)-/u.test(name);

/** Moves one oklch() colour of the evergreen neutral family to a theme's hue and chroma. */
const moveNeutral = (colour: string, theme: Theme): string => {
  if (!theme.neutrals) {
    return colour;
  }
  const parts =
    /^oklch\(\s*(?<lightness>[\d.]+)\s+(?<chroma>[\d.]+|none)\s+(?<hue>[\d.]+|none)\s*(?<alpha>\/\s*[\d.]+)?\s*\)$/u.exec(
      colour
    )?.groups;
  if (parts === undefined) {
    return colour;
  }
  const chroma = parts.chroma === "none" ? 0 : Number(parts.chroma);
  const hue = parts.hue === "none" ? 0 : Number(parts.hue);
  const neutral = chroma < 0.07 && (chroma === 0 || (hue >= 120 && hue <= 185));
  if (!neutral || chroma === 0) {
    return colour;
  }
  const moved = Math.round(chroma * theme.neutrals.chroma * 1000) / 1000;
  const alpha =
    parts.alpha === undefined ? "" : ` ${parts.alpha.replaceAll(/\s+/gu, " ")}`;
  return `oklch(${parts.lightness} ${moved} ${theme.neutrals.hue}${alpha})`;
};

const round = (n: number) => Math.round(n * 1000) / 1000;

/** One oklch() colour stepped in lightness and chroma, its hue kept. */
const step = (colour: string, lightness: number, chroma: number): string => {
  const parts =
    /^oklch\(\s*(?<lightness>[\d.]+)\s+(?<chroma>[\d.]+|none)\s+(?<hue>[\d.]+|none)/u.exec(
      colour
    )?.groups;
  if (parts === undefined) {
    return colour;
  }
  const c = parts.chroma === "none" ? 0 : Number(parts.chroma);
  const hue = parts.hue === "none" ? 0 : parts.hue;
  return `oklch(${round(Number(parts.lightness) + lightness)} ${round(Math.max(0, c + chroma))} ${hue})`;
};

// The sidebar's page card in a theme, from the theme's own paper, so a product on a theme gets a
// card that matches it with nothing of its own: by day the card is the paper; at night a step
// up from it. Only in a theme's block: with no theme, the system's neutral greys stand.
const CARD_FROM_PAPER: Record<
  string,
  (paper: { light: string; dark: string }) => { light: string; dark: string }
> = {
  "sidebar-card": (paper) => ({
    light: paper.light,
    dark: step(paper.dark, 0.025, 0),
  }),
};

/** Whether a token carries colour: a colour, a shadow, or a reference to one. */
export const carriesColour = (token: Token) =>
  /oklch|\{/u.test(`${token.value} ${token.dark ?? ""}`);

/** A theme's values for every token, and the resolver of a token's colour in it. */
export const themer = (byName: ReadonlyMap<string, Token>, theme: Theme) => {
  /** A token's raw light and dark values in the theme, before the sidebar's card is made from the paper. */
  const ownValues = (token: Token): Values => {
    const set = theme.set[token.name];
    const move = (value: string) =>
      fixed(token.name)
        ? value
        : value.replace(OKLCH, (colour) => moveNeutral(colour, theme));
    const value = set?.light ?? move(token.value);
    if (set?.dark !== undefined) {
      return { value, dark: set.dark };
    }
    if (token.dark !== undefined && token.dark !== "") {
      return { value, dark: move(token.dark) };
    }
    return set?.light === undefined
      ? { value }
      : { value, dark: move(token.value) };
  };
  const paperIn = resolver(byName, ownValues);
  const values = (token: Token): Values => {
    const fromPaper = CARD_FROM_PAPER[token.name];
    if (fromPaper !== undefined && theme.set[token.name] === undefined) {
      const shell = fromPaper({
        light: paperIn("background", "light"),
        dark: paperIn("background", "dark"),
      });
      return { value: shell.light, dark: shell.dark };
    }
    return ownValues(token);
  };
  return { values, resolve: resolver(byName, values) };
};

// ---- Contrast ----------------------------------------------------------------------------------

export const FLOOR = { large: 3, text: 4.5, ui: 3 } as const;

/** A pair measured in a theme (or none), light and dark. A ground with alpha is laid over the page. */
export const measurePair = (
  pair: ContrastPair,
  resolve: (name: string, scheme: Scheme) => string
) => {
  const ratio = (scheme: Scheme) => {
    const ground = resolve(pair.on, scheme);
    const base =
      parseOklch(ground).a < 1 ? resolve("background", scheme) : undefined;
    return contrast(resolve(pair.text, scheme), ground, base);
  };
  const light = ratio("light");
  const dark = ratio("dark");
  const floor = FLOOR[pair.kind];
  return { ...pair, dark, floor, light, pass: light >= floor && dark >= floor };
};
