// The token generator's rules (tokens/model.ts): how a token is named in CSS and in StyleX, which
// colours the brand list lets through, and how a theme moves the neutrals.
//   pnpm test scripts/tokens.test.ts
import { describe, expect, test } from "vitest";

import {
  cssVar,
  indexTokens,
  offBrand,
  stylexKey,
  themer,
} from "../tokens/model.ts";
import type { BrandList } from "../tokens/model.ts";
import { themes } from "../tokens/themes.ts";
import { brand, groups } from "../tokens/tokens.ts";
import type { Token } from "../tokens/tokens.ts";

const colour = (name: string, value: string, dark?: string): Token => ({
  name,
  category: "colors",
  value,
  ...(dark === undefined ? {} : { dark }),
  use: "",
});

// Two greens for the brand, at hues 150 and 170, so its family runs 140 to 180 with a tolerance of 10.
const tokens: Token[] = [
  colour("brand-ink", "oklch(0.27 0.05 170)"),
  colour("brand-lime", "oklch(0.94 0.1 150)"),
];
const list: BrandList = {
  colours: ["brand-ink", "brand-lime"],
  tolerance: 10,
  neutralChroma: 0.02,
  status: [{ name: "destructive", from: 20, to: 35 }],
};

describe(cssVar, () => {
  test("prefixes the name, so it never meets another kit's unprefixed variables", () => {
    expect(cssVar("background")).toBe("--damsko-background");
  });
});

describe(stylexKey, () => {
  test.each([
    ["muted-foreground", "colors", "mutedForeground"],
    ["font-weight-normal", "font", "weightNormal"],
    ["space-4", "space", "4"],
    ["radius", "radius", "base"],
    ["radius-full", "radius", "full"],
    ["shadow-sm-destructive", "shadow", "smDestructive"],
    ["bevel-ink", "shadow", "bevelInk"],
    ["app-shell-bar", "size", "appShellBar"],
  ] as const)("%s in %s is %s", (name, category, key) => {
    expect(stylexKey(name, category)).toBe(key);
  });
});

describe(offBrand, () => {
  test("lets through the brand's hue family, at any lightness and alpha", () => {
    const found = offBrand(
      [...tokens, colour("border", "oklch(0.29 0.05 178 / 0.1)")],
      list
    );
    expect(found).toStrictEqual([]);
  });

  test("lets through a neutral, whatever its hue, and a status hue", () => {
    const found = offBrand(
      [
        ...tokens,
        colour("card", "oklch(1 0 none)"),
        colour("muted", "oklch(0.97 0.006 300)"),
        colour("destructive", "oklch(0.53 0.18 28)"),
      ],
      list
    );
    expect(found).toStrictEqual([]);
  });

  test("finds a colour of no listed hue, in its dark value and inside a shadow", () => {
    const found = offBrand(
      [
        ...tokens,
        colour("accent", "oklch(0.5 0.03 160)", "oklch(0.8 0.09 290)"),
        colour("glow", "0 1px 2px oklch(0.5 0.12 250 / 0.3)"),
      ],
      list
    );
    expect(found).toStrictEqual([
      { token: "accent", colour: "oklch(0.8 0.09 290)" },
      { token: "glow", colour: "oklch(0.5 0.12 250 / 0.3)" },
    ]);
  });

  test("lets through every one of Damsko's own colours, lavender and the slider's among them", () => {
    const all = groups.flatMap((group) =>
      group.sets.flatMap((set) => set.tokens)
    );
    expect(offBrand(all, brand, themes)).toStrictEqual([]);
  });

  test("judges a theme's values as well", () => {
    const found = offBrand(
      [...tokens, colour("card", "oklch(1 0 none)")],
      list,
      [{ id: "plum", set: { card: { dark: "oklch(0.3 0.08 330)" } } }]
    );
    expect(found).toStrictEqual([
      { token: "card", colour: "oklch(0.3 0.08 330)" },
    ]);
  });
});

describe(indexTokens, () => {
  test("fails when two tokens share a name", () => {
    expect(() => indexTokens([...tokens, ...tokens])).toThrow(/share a name/u);
  });

  test("fails when a value names a token that does not exist", () => {
    expect(() =>
      indexTokens([
        ...tokens,
        colour("ring", "{brand-ink}"),
        colour("card", "{paper}"),
      ])
    ).toThrow(/names \{paper\}/u);
  });
});

describe(themer, () => {
  const byName = indexTokens([
    colour("background", "oklch(0.99 0.002 165)"),
    colour("border", "oklch(0.29 0.05 162 / 0.1)"),
    colour("brand-mint", "oklch(0.8 0.16 165)"),
    colour("primary", "oklch(0.27 0.05 170)"),
  ]);
  const pine = {
    id: "pine",
    neutrals: { hue: 178, chroma: 2 },
    set: { primary: { light: "oklch(0.36 0.075 177)" } },
  };

  test("moves a colour of the neutral family to the theme's hue, at its share of the chroma", () => {
    expect(themer(byName, pine).resolve("border", "light")).toBe(
      "oklch(0.29 0.1 178 / 0.1)"
    );
  });

  test("keeps the brand's colours as they are", () => {
    expect(themer(byName, pine).resolve("brand-mint", "light")).toBe(
      "oklch(0.8 0.16 165)"
    );
  });

  test("takes a value the theme sets, in light, and keeps the moved one in dark", () => {
    const { resolve } = themer(byName, pine);
    expect(resolve("primary", "light")).toBe("oklch(0.36 0.075 177)");
    expect(resolve("primary", "dark")).toBe("oklch(0.27 0.1 178)");
  });
});
