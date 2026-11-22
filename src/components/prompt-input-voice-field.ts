// The voice's field on a canvas, for PromptInputVoice (prompt-input.tsx): the same fine line of
// pixels the CSS field draws, with a body round its middle that follows the sound at each frame.
// The sound is read from the product's own sampler, so sixty values a second cost no render. It
// draws only while it is told to run; with `still`, at most four times a second.

/** One dot in every PITCH square of CSS pixels, DOT across: the system's fine pixel grid. */
const PITCH = 3;
const DOT = 1.5;
/** How many rows the body stands each side of the line at its loudest. */
const ROWS = 4;
/** How fast the body follows a louder sound, and lets a quieter one go, a frame. */
const RISE = 0.5;
const FALL = 0.12;

export interface VoiceField {
  /** Stops drawing, for good. */
  stop: () => void;
}

/** How strongly a dot shows: full on the line's middle, fading to the ends and away from the line. */
const strength = (across: number, row: number, reach: number) => {
  const ends = Math.min(1, across * 4, (1 - across) * 4);
  if (row === 0) {
    return 0.5 * ends;
  }
  // The body: widest on the line, narrowing a row at a time, only as far as the sound reaches.
  const body = 1 - Math.abs(across - 0.5) * 2 * (1 + row / ROWS);
  return row <= reach && body > 0 ? Math.min(1, body * 2) * ends : 0;
};

/**
 * Draws the field on `canvas` from `sample` (the sound now, 0 to 1) until stopped. The colour is
 * the canvas's own `color`, read at each frame, so a theme or a turn that changes it is followed.
 */
export const startVoiceField = (
  canvas: HTMLCanvasElement,
  sample: () => number,
  still: boolean
): VoiceField => {
  const context = canvas.getContext("2d");
  let frame = 0;
  let level = 0;
  let last = 0;
  const draw = (now: number) => {
    frame = requestAnimationFrame(draw);
    if (context === null || (still && now - last < 250)) {
      return;
    }
    last = now;
    const heard = Math.min(Math.max(sample(), 0), 1);
    level += (heard - level) * (heard > level ? RISE : FALL);
    const scale = Math.max(1, Math.round(devicePixelRatio));
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width * scale || canvas.height !== height * scale) {
      canvas.width = width * scale;
      canvas.height = height * scale;
    }
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.clearRect(0, 0, width, height);
    context.fillStyle = getComputedStyle(canvas).color;
    const columns = Math.floor(width / PITCH);
    const middle = Math.floor(height / PITCH / 2);
    const reach = Math.round(level * ROWS);
    for (let row = -ROWS; row <= ROWS; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const alpha = strength(column / columns, Math.abs(row), reach);
        if (alpha > 0) {
          context.globalAlpha = alpha;
          context.fillRect(column * PITCH, (middle + row) * PITCH, DOT, DOT);
        }
      }
    }
  };
  frame = requestAnimationFrame(draw);
  return {
    stop: () => {
      cancelAnimationFrame(frame);
    },
  };
};
