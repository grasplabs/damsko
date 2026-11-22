"use client";

import { colors } from "@grasp-os/ui/lib/tokens.stylex";
// Embers, after the website's security hero: a still
// grid of tiny glyphs in the two bottom corners of a band, whose sizes swell and shrink as soft noise
// rises through them, so heat seems to climb while nothing moves. One WebGL pass draws every glyph
// as a point; the strongest, nearest the corner, are small crosses. The same field (seeded, 5px
// spacing, 24 levels), the same shaders and the same timing as the website.
//
// Cost: one canvas, one draw of a few thousand points a frame, at the screen's rate, only while on
// screen and the tab is shown; capped at 2x pixels. On a phone and under reduced motion it draws one
// still frame. Without WebGL the band stays plain. The colour is the canvas's CSS `color` (a token).
import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef } from "react";

const SPACING = 5;
const MIN_SIZE = 0.3;
const SIZE_RANGE = 3.4;
const RISE = 24;
const SWELL = 0.85;
const LEVELS = 24;

const VERTEX = `
attribute vec4 aCell;
attribute float aCross;
uniform vec2 uSize;
uniform float uTime;
uniform float uRatio;
varying float vSize;
varying float vSprite;
varying float vCross;
varying float vAlpha;

float hash(vec2 p) {
  p = fract(p * vec2(234.34, 435.35));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0)), f.x), f.y);
}

void main() {
  float side = step(uSize.x * 0.5, aCell.x) * 5.3;
  float y = aCell.y - uTime * ${RISE.toFixed(1)};
  float heat = noise(vec2(aCell.x / 26.0 + side, y / 60.0)) * 0.7
             + noise(vec2(aCell.x / 10.0 + side + aCell.w, y / 22.0)) * 0.3;
  float swell = 1.0 + (heat - 0.5) * ${SWELL.toFixed(2)} * smoothstep(0.0, 1.5, uTime);
  float strength = clamp(aCell.z * swell, 0.0, 1.0);
  vSize = (${MIN_SIZE.toFixed(2)} + strength * ${SIZE_RANGE.toFixed(2)}) * uRatio;
  vSprite = ceil((${(MIN_SIZE + SIZE_RANGE).toFixed(2)}) * uRatio) + 2.0;
  vCross = aCross;
  vAlpha = 0.16 + aCell.z * 0.62;
  gl_PointSize = vSprite;
  gl_Position = vec4(aCell.xy / uSize * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAGMENT = `
precision mediump float;
uniform vec3 uColor;
varying float vSize;
varying float vSprite;
varying float vCross;
varying float vAlpha;

void main() {
  vec2 p = abs(gl_PointCoord - 0.5) * vSprite;
  float r = vSize * 0.5;
  float box = max(p.x, p.y) - r;
  float x = max(box, abs(p.x - p.y) - r * 0.4);
  float d = mix(box, x, vCross);
  float a = (1.0 - smoothstep(-0.5, 0.5, d)) * vAlpha;
  gl_FragColor = vec4(uColor * a, a);
}`;

/** How far the embers reach in from each side and up from the foot, as shares of the box. Left
 * out, the website's band: 30% of the width (440px at most), 78% of the height (500px at most). */
export interface EmbersFrame {
  reach: number;
  rise: number;
  /** How hot the field is: its strength times this, so an exhibit shows the glyphs at a glance. */
  heat?: number;
}

interface Cell {
  cross: number;
  seed: number;
  strength: number;
  x: number;
  y: number;
}

// A fixed seed, so a field is the same on every visit (Park–Miller).
const seeded = () => {
  let state = 2207;
  return () => {
    state = (state * 16_807) % 2_147_483_647;
    return (state - 1) / 2_147_483_646;
  };
};

// The field for one band: two corners, mirrored, each fading out towards the middle and the top.
const field = (width: number, height: number, frame?: EmbersFrame): Cell[] => {
  const phone = width < 700;
  const reach = frame
    ? width * frame.reach
    : phone
      ? width * 0.3
      : Math.min(width * 0.3, 440);
  const rise = frame
    ? height * frame.rise
    : phone
      ? height * 0.42
      : Math.min(height * 0.78, 500);
  const random = seeded();
  const cells: Cell[] = [];
  for (let y = SPACING / 2; y < rise; y += SPACING) {
    for (let x = SPACING / 2; x < reach; x += SPACING) {
      const seed = random();
      const distance = Math.hypot(x / reach, y / rise);
      const ripple =
        Math.sin(x * 0.041 + Math.sin(y * 0.023)) *
        Math.sin(y * 0.034 + x * 0.011);
      const raw =
        Math.max(0, 1 - distance) ** 1.6 * (0.9 + ripple * 0.2 + seed * 0.2);
      const strength = Math.min(
        1,
        Math.round(raw * (frame?.heat ?? 1) * LEVELS) / LEVELS
      );
      if (strength === 0) {
        continue;
      }
      const cross = strength > 0.55 && seed > 0.2 ? 1 : 0;
      cells.push(
        { cross, seed, strength, x, y },
        { cross, seed: 1 - seed, strength, x: width - x, y }
      );
    }
  }
  return cells;
};

/** Any CSS colour (oklch included) to 0–1 sRGB, through a one-pixel canvas. */
export const rgbOf = (color: string): [number, number, number] => {
  const context = document.createElement("canvas").getContext("2d");
  if (!context) {
    return [0.13, 0.87, 0.64];
  }
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0] = context.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
};

/** A linked program from two shaders, or null. */
export const linkProgram = (
  gl: WebGLRenderingContext,
  vertex: string,
  fragment: string
): WebGLProgram | null => {
  const linked = gl.createProgram();
  if (!linked) {
    return null;
  }
  for (const [kind, source] of [
    [gl.VERTEX_SHADER, vertex],
    [gl.FRAGMENT_SHADER, fragment],
  ] as const) {
    const shader = gl.createShader(kind);
    if (!shader) {
      return null;
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      return null;
    }
    gl.attachShader(linked, shader);
  }
  gl.linkProgram(linked);
  return gl.getProgramParameter(linked, gl.LINK_STATUS) ? linked : null;
};

const s = stylex.create({
  canvas: {
    position: "absolute",
    inset: 0,
    display: "block",
    width: "100%",
    height: "100%",
    color: colors.brandMint,
  },
});

/** The embers, filling their positioned parent. */
export const Embers = ({ framing }: { framing?: EmbersFrame }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas?.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      powerPreference: "low-power",
      stencil: false,
    });
    if (!canvas || !gl) {
      return;
    }
    const program = linkProgram(gl, VERTEX, FRAGMENT);
    if (!program) {
      return;
    }
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    const aCell = gl.getAttribLocation(program, "aCell");
    const aCross = gl.getAttribLocation(program, "aCross");
    gl.enableVertexAttribArray(aCell);
    gl.vertexAttribPointer(aCell, 4, gl.FLOAT, false, 20, 0);
    gl.enableVertexAttribArray(aCross);
    gl.vertexAttribPointer(aCross, 1, gl.FLOAT, false, 20, 16);
    const uSize = gl.getUniformLocation(program, "uSize");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uRatio = gl.getUniformLocation(program, "uRatio");
    gl.uniform3f(
      gl.getUniformLocation(program, "uColor"),
      ...rgbOf(getComputedStyle(canvas).color)
    );
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    const moving = matchMedia(
      "(min-width: 701px) and (prefers-reduced-motion: no-preference)"
    );
    let count = 0;
    let time = 2;
    let last = 0;
    let frame = 0;
    let visible = false;
    const draw = () => {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, time);
      gl.drawArrays(gl.POINTS, 0, count);
    };
    const tick = (now: number) => {
      if (last) {
        time += Math.min((now - last) / 1000, 0.05);
      }
      last = now;
      draw();
      frame = requestAnimationFrame(tick);
    };
    const update = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
      if (visible && moving.matches && !document.hidden) {
        frame = requestAnimationFrame(tick);
      } else {
        draw();
      }
    };
    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!(width && height)) {
        return;
      }
      const ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uSize, width, height);
      gl.uniform1f(uRatio, ratio);
      const cells = field(width, height, framing);
      count = cells.length;
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(
          cells.flatMap((cell) => [
            cell.x,
            cell.y,
            cell.strength,
            cell.seed,
            cell.cross,
          ])
        ),
        gl.STATIC_DRAW
      );
      update();
    };
    const sized = new ResizeObserver(resize);
    sized.observe(canvas);
    const seen = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      update();
    });
    seen.observe(canvas);
    moving.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      cancelAnimationFrame(frame);
      sized.disconnect();
      seen.disconnect();
      moving.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
    // The framing is read once, as the field is laid.
  }, []);
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      data-brand-canvas=""
      {...stylex.props(s.canvas)}
    />
  );
};
