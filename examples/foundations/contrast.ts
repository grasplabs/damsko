// Contrast as the page draws it: the Colour scenes measure their figures from the colours the
// browser has computed, never from a list, so a token changed is a figure changed.

/** A colour as the browser draws it, in sRGB 0 to 255 with its alpha, through a 1px canvas. */
const rgb = (canvas: CanvasRenderingContext2D, colour: string) => {
  canvas.clearRect(0, 0, 1, 1);
  canvas.fillStyle = colour;
  canvas.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0, a = 255] = canvas.getImageData(0, 0, 1, 1).data;
  return [r, g, b, a / 255];
};

/** A see-through ink laid over its ground, as the eye sees it. */
const over = ([r, g, b, a]: number[], [R, G, B]: number[]) =>
  [r, g, b].map(
    (value, index) =>
      (value ?? 0) * (a ?? 1) + ([R, G, B][index] ?? 0) * (1 - (a ?? 1))
  );

const luminance = ([r, g, b]: number[]) =>
  [r, g, b]
    .map((value) => (value ?? 0) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    .reduce((sum, c, index) => sum + c * [0.2126, 0.7152, 0.0722][index]!, 0);

/** A measurer for one pass: `ratio(ink, ground)` in WCAG's terms, both as computed colours. */
export const measurer = () => {
  const canvas = document
    .createElement("canvas")
    .getContext("2d", { willReadFrequently: true });
  return (ink: string, ground: string) => {
    if (!canvas) {
      return null;
    }
    const back = rgb(canvas, ground);
    const fore = luminance(over(rgb(canvas, ink), back));
    const [high, low] = [fore, luminance(back)].sort((a, b) => b - a);
    return (high! + 0.05) / (low! + 0.05);
  };
};

/** "12.4:1", to one place, never rounded up over a limit it does not reach. */
export const asRatio = (ratio: number | null) =>
  ratio === null ? "" : `${(Math.floor(ratio * 10) / 10).toFixed(1)}:1`;
