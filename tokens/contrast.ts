// Contrast, measured: oklch() to sRGB, alpha laid over its ground, then the WCAG 2 ratio. Used by
// the token generator, which writes the measured pairs into tokens.json and fails when a text pair
// drops under 4.5:1. Only the forms the tokens use are read: oklch(L C H) and oklch(L C H / A).

interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

const OKLCH =
  /^oklch\(\s*(?<lightness>[\d.]+%?)\s+(?<chroma>[\d.]+)\s+(?<hue>[\d.]+|none)\s*(?:\/\s*(?<alpha>[\d.]+%?))?\s*\)$/u;

const fraction = (value: string) =>
  value.endsWith("%") ? Number(value.slice(0, -1)) / 100 : Number(value);

/** Linear-light sRGB channel to its gamma-encoded value, clipped into gamut. */
const encode = (linear: number) => {
  const clipped = Math.min(1, Math.max(0, linear));
  return clipped <= 0.0031308
    ? 12.92 * clipped
    : 1.055 * clipped ** (1 / 2.4) - 0.055;
};

/** Parses an oklch() colour into gamma-encoded sRGB (0 to 1) with its alpha. */
export const parseOklch = (colour: string): Rgba => {
  const match = OKLCH.exec(colour.trim());
  if (match?.groups === undefined) {
    throw new Error(`Not an oklch() colour: ${colour}`);
  }
  const { groups } = match;
  const lightness = fraction(groups.lightness ?? "0");
  const chroma = Number(groups.chroma);
  const hue = groups.hue === "none" ? 0 : (Number(groups.hue) * Math.PI) / 180;
  const alpha = groups.alpha === undefined ? 1 : fraction(groups.alpha);
  const a = chroma * Math.cos(hue);
  const b = chroma * Math.sin(hue);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return {
    a: alpha,
    b: encode(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
    g: encode(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    r: encode(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
  };
};

/** A colour with alpha laid over an opaque ground (the browser blends in gamma-encoded sRGB). */
const over = (top: Rgba, ground: Rgba): Rgba => ({
  a: 1,
  b: top.b * top.a + ground.b * (1 - top.a),
  g: top.g * top.a + ground.g * (1 - top.a),
  r: top.r * top.a + ground.r * (1 - top.a),
});

const channel = (value: number) =>
  value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;

const luminance = ({ r, g, b }: Rgba) =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

/**
 * WCAG 2 contrast of a text colour on a ground, both oklch(); rounded to two decimals. A ground
 * with alpha needs `base`, the opaque ground it is laid over (the page it sits on).
 */
export const contrast = (
  text: string,
  ground: string,
  base?: string
): number => {
  let back = parseOklch(ground);
  if (back.a < 1) {
    if (base === undefined || base === "") {
      throw new Error(
        `A ground with alpha needs the ground under it: ${ground}`
      );
    }
    back = over(back, parseOklch(base));
  }
  const front = over(parseOklch(text), back);
  const [light, dark] = [luminance(front), luminance(back)].toSorted(
    (x, y) => y - x
  );
  return Math.round((((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05)) * 100) / 100;
};

/** The colour as a hex string (after clipping into sRGB), for people who need one. */
export const toHex = (colour: string): string => {
  const { r, g, b, a } = parseOklch(colour);
  const hex = [r, g, b, ...(a < 1 ? [a] : [])]
    .map((value) =>
      Math.round(value * 255)
        .toString(16)
        .padStart(2, "0")
    )
    .join("");
  return `#${hex}`;
};
