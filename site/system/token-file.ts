// The tokens as the docs read them: the token source (tokens/tokens.ts) resolved, named as the
// library ships them (`--damsko-…` in CSS, `colors.…` in StyleX), with each colour's hex, and the
// contrast pairs measured. Plain TypeScript, so the token blocks, the rows, the search index and
// the Markdown twins all read the same data.
import { toHex } from "../../tokens/contrast.ts";
import {
  camel,
  cssVar,
  indexTokens,
  isColourValue,
  measurePair,
  resolver,
  stylexKey,
} from "../../tokens/model.ts";
import { breakpoints, contrastPairs, groups } from "../../tokens/tokens.ts";
import type { Token } from "../../tokens/tokens.ts";

export interface TokenEntry {
  /** Its name, kebab case: `muted-foreground`. */
  name: string;
  /** Its CSS variable: `--damsko-muted-foreground`. */
  cssVar: string;
  /** Its StyleX name: `colors.mutedForeground`, `space[4]`. */
  stylex: string;
  use: string;
  /** The value, or the light one when it has a dark value. */
  value: string;
  dark?: string;
  hex?: string;
  darkHex?: string;
  /** The tokens its value names. */
  refs?: string[];
}

export interface TokenSetEntry {
  id: string;
  title: string;
  tokens: TokenEntry[];
}

export interface TokenGroupEntry {
  id: string;
  title: string;
  sets: TokenSetEntry[];
}

export interface ContrastEntry {
  text: string;
  on: string;
  kind: "text" | "large" | "ui";
  light: number;
  dark: number;
  floor: number;
  pass: boolean;
}

export interface BreakpointEntry {
  name: string;
  value: string;
  use: string;
}

const all: Token[] = groups.flatMap((group) =>
  group.sets.flatMap((set) => set.tokens)
);
const byName = indexTokens(all);
const resolve = resolver(byName);

/** A StyleX key as code: `colors.mutedForeground`, or `space[4]` for a key that is a number. */
const stylexName = (object: string, key: string) =>
  /^\d/u.test(key) ? `${object}[${key}]` : `${object}.${camel(key)}`;

const entryOf = (token: Token): TokenEntry => {
  const light = resolve(token.name, "light");
  const dark = resolve(token.name, "dark");
  const refs = [
    ...`${token.value} ${token.dark ?? ""}`.matchAll(/\{([a-z0-9-]+)\}/gu),
  ].map((match) => match[1] ?? "");
  return {
    name: token.name,
    cssVar: cssVar(token.name),
    stylex: stylexName(token.category, stylexKey(token.name, token.category)),
    use: token.use,
    value: light,
    ...(isColourValue(light) ? { hex: toHex(light) } : {}),
    ...(dark === light ? {} : { dark }),
    ...(dark !== light && isColourValue(dark) ? { darkHex: toHex(dark) } : {}),
    ...(refs.length > 0 ? { refs: [...new Set(refs)] } : {}),
  };
};

/** Every group of tokens, by set. */
export const tokenGroups: TokenGroupEntry[] = groups.map((group) => ({
  id: group.id,
  title: group.title,
  sets: group.sets.map((set) => ({
    id: set.id,
    title: set.title,
    tokens: set.tokens.map(entryOf),
  })),
}));

/** Every set, across the groups. */
export const tokenSets: TokenSetEntry[] = tokenGroups.flatMap(
  (group) => group.sets
);

/** Every token, by name. */
export const tokenEntries = new Map<string, TokenEntry>(
  tokenSets.flatMap((set) => set.tokens.map((entry) => [entry.name, entry]))
);

/** The contrast pairs, measured in light and dark. */
export const tokenContrast: ContrastEntry[] = contrastPairs.map((pair) => ({
  ...measurePair(pair, resolve),
  on: pair.on,
  text: pair.text,
}));

/** The widths where the layout changes, by Tailwind's names. */
export const tokenBreakpoints: BreakpointEntry[] = breakpoints.map((point) => ({
  name: point.name,
  value: point.value,
  use: point.use,
}));
