// The idle screen itself: after a while left alone the screen dithers in from the outside to the
// inside, then rests as a full window of animated dither that morphs from one scene to the next.
// Loaded only when the page has been left alone (./idle.ts, the watcher).
//
// One canvas over the window, drawn with the site's silk and Bayer's 8 by 8 threshold
// (site/lib/shader.ts), in 3px cells:
//
//   arrival   the dither grows in from the window's edges to its middle, the frontier itself dithered
//             (a cell joins when the reach passes its own threshold), the page still seen in the
//             middle until it closes
//   at rest   a full window of one scene, the silk's light drifting through it
//   morph     the next scene forms out of it: region by region (a slow noise field decides which
//             goes first), each cell's light travels from the one picture to the other through the
//             silk, the cells swirling a little as they gather, and every cell flips on its own
//             threshold; never a cross-fade of two pictures
//
// Scenes are night whatever the theme, so light and dark draw alike. Thirty pictures a second at
// most; nothing drawn while the tab is hidden. `end` takes it all away: the canvas fades for a
// moment, then it and its WebGL context are gone. Decorative only: hidden from assistive tech, it
// holds nothing that takes focus and never moves focus or scroll.
import { durations } from "@grasp-os/ui/lib/tokens.values";

import { programOf, rgbaOf, silkAndBayer } from "../lib/shader";

/** A scene's picture and how it is graded. */
interface Scene {
  src: string;
  /** The part kept when it is cropped to fill the window, 0 to 1 each way, from the top left. */
  focus: readonly [number, number];
  /** Over 1 deepens its darks, under 1 lifts them. */
  gamma: number;
  gain: number;
  /** Drawn as its negative: for a picture of a light sky, which is to be night. */
  invert: boolean;
  /** How far it sways, as a part of its width. */
  sway: number;
  /** How much the silk's light takes from it and gives to it, 0 to 1. */
  drift: number;
}

/**
 * The scenes in the order shown, the Van Gogh first, credited in THIRD_PARTY_NOTICES.md. Always
 * the full picture: a phone's tall window keeps a third of its width.
 */
const scenes: readonly Scene[] = [
  // The Starry Night (Vincent van Gogh, 1889).
  {
    src: "/scenes/starry.jpg",
    focus: [0.5, 0.35],
    gamma: 1.6,
    gain: 1.3,
    invert: false,
    sway: 0.022,
    drift: 0.3,
  },
  // The Great Wave off Kanagawa (Katsushika Hokusai, about 1831), as its negative: the sky is night
  // and the wave's body carries the light.
  {
    src: "/scenes/wave.jpg",
    focus: [0.35, 0.45],
    gamma: 1.5,
    gain: 1.15,
    invert: true,
    sway: 0.02,
    drift: 0.3,
  },
  // A northern light from orbit, over Manicouagan's ring (NASA).
  {
    src: "/scenes/aurora.jpg",
    focus: [0.5, 0.4],
    gamma: 1.25,
    gain: 1.25,
    invert: false,
    sway: 0.018,
    drift: 0.45,
  },
  // Fine Wind, Clear Morning (Katsushika Hokusai, about 1831): Fuji under a mackerel sky.
  {
    src: "/scenes/fuji.jpg",
    focus: [0.6, 0.5],
    gamma: 1.7,
    gain: 1.1,
    invert: false,
    sway: 0.012,
    drift: 0.35,
  },
  // The Cosmic Cliffs of the Carina Nebula (NASA, ESA, CSA, STScI; James Webb Space Telescope,
  // 2022): ridges of gas under a field of stars.
  {
    src: "/scenes/cliffs.jpg",
    focus: [0.5, 0.5],
    gamma: 0.85,
    gain: 1.2,
    invert: false,
    sway: 0.014,
    drift: 0.4,
  },
  // Wanderer above the Sea of Fog (Caspar David Friedrich, about 1818).
  {
    src: "/scenes/wanderer.jpg",
    focus: [0.5, 0.42],
    gamma: 1.8,
    gain: 1.1,
    invert: false,
    sway: 0.012,
    drift: 0.45,
  },
];

/** The line that says how to come back. */
const words = { pointer: "Move to return", touch: "Touch to return" };

/** How the screen moves, in milliseconds. */
const timing = {
  /** From the first cell at the edge to the last in the middle. */
  arrive: 6000,
  /** How long a scene rests whole before the next forms out of it. */
  rest: 11_000,
  /** How long one scene takes to become the next. */
  morph: 7000,
};

/** One picture a frame at most this often: thirty a second. */
const frameMs = 1000 / 30;

/** A cell, in CSS pixels. */
const cell = 3;

/** Where the shader's clock starts: the first picture already a settled one. */
const startAt = 8;

/** The shader's names for the scene shown and the next. */
const uniforms = {
  now: {
    image: "u_image",
    res: "u_imageRes",
    focus: "u_focus",
    grade: "u_grade",
    invert: "u_invert",
  },
  next: {
    image: "u_next",
    res: "u_nextRes",
    focus: "u_nextFocus",
    grade: "u_nextGrade",
    invert: "u_nextInvert",
  },
} as const;

/** The palette's seven stops, night to paper, as brand tokens. */
const stops = ["night", "ink", "pine", "mint", "sea", "lime", "paper"];

const FRAGMENT = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
// The light's seven stops, night to paper, read from the tokens.
uniform vec3 u_palette[7];
// The scene shown: its light, its size, the part kept when it is cropped, its grade (gamma, gain,
// sway, drift), and 1 where it is drawn as its negative. Then the same for the next.
uniform sampler2D u_image;
uniform vec2 u_imageRes;
uniform vec2 u_focus;
uniform vec4 u_grade;
uniform float u_invert;
uniform sampler2D u_next;
uniform vec2 u_nextRes;
uniform vec2 u_nextFocus;
uniform vec4 u_nextGrade;
uniform float u_nextInvert;
// 0 to 1: how far the next scene has formed.
uniform float u_morph;
// 0 to 1: how far the dither has come in from the edges (1: the whole window).
uniform float u_reach;
// The line's pool: its middle and half its size, in the canvas's pixels, and 1 once it is there.
uniform vec4 u_clear;
uniform float u_hasClear;
varying vec2 v_uv;
${silkAndBayer}
vec3 palette(float t) {
  t = clamp(t, 0.0, 1.0) * 6.0;
  vec3 c = mix(u_palette[0], u_palette[1], clamp(t, 0.0, 1.0));
  c = mix(c, u_palette[2], clamp(t - 1.0, 0.0, 1.0));
  c = mix(c, u_palette[3], clamp(t - 2.0, 0.0, 1.0));
  c = mix(c, u_palette[4], clamp(t - 3.0, 0.0, 1.0));
  c = mix(c, u_palette[5], clamp(t - 4.0, 0.0, 1.0));
  return mix(c, u_palette[6], clamp(t - 5.0, 0.0, 1.0));
}

// A picture's light at this cell, cropped and graded, moved by "warp".
float sceneLight(sampler2D image, vec2 imageRes, vec2 focusAt, vec4 grade, float invert, vec2 warp, vec2 sway, float silkLight) {
  float aspect = u_res.x / u_res.y;
  float imageAspect = imageRes.x / imageRes.y;
  vec2 crop = aspect > imageAspect ? vec2(1.0, imageAspect / aspect) : vec2(aspect / imageAspect, 1.0);
  crop *= 0.94;
  vec2 focus = vec2(focusAt.x, 1.0 - focusAt.y);
  vec2 uv = (v_uv - 0.5) * crop + 0.5 + (focus - 0.5) * (1.0 - crop);
  uv += sway * grade.z + warp;
  uv.x += 0.012 * sin(u_time * 0.03);
  float lum = texture2D(image, clamp(uv, 0.0, 1.0)).r;
  lum = mix(lum, 1.0 - lum, invert);
  float tone = pow(lum, grade.x) * grade.y;
  return tone * (1.0 + grade.w * (smoothstep(0.25, 0.75, silkLight) - 0.5) * 2.0);
}

void main() {
  float aspect = u_res.x / u_res.y;
  vec2 p = v_uv * vec2(aspect, 1.0);
  vec2 sway = vec2(
    fbm(p * 2.2 + vec2(0.0, u_time * 0.02)),
    fbm(p * 2.2 + vec2(5.2, 1.3) - u_time * 0.017)
  ) - 0.5;
  float silkLight = silk(p * 1.1, u_time * 0.7);

  // The morph: a slow field decides where the next scene forms first; there the cells swirl a
  // little and their light passes through the silk on its way from one picture to the other.
  float order = clamp((fbm(p * 1.2 + 31.0) - 0.25) / 0.5, 0.0, 1.0);
  float local = clamp(u_morph * 1.7 - order * 0.7, 0.0, 1.0);
  float gather = sin(3.14159 * local);
  vec2 warp = sway * gather * 0.09;
  float from = sceneLight(u_image, u_imageRes, u_focus, u_grade, u_invert, warp, sway, silkLight);
  float tone = from;
  if (u_morph > 0.0) {
    float to = sceneLight(u_next, u_nextRes, u_nextFocus, u_nextGrade, u_nextInvert, -warp, sway, silkLight);
    tone = mix(from, to, smoothstep(0.15, 0.85, local));
    tone = mix(tone, smoothstep(0.2, 0.8, silkLight) * 0.75, gather * 0.5);
  }

  // Under the line that says how to return the scene grows dark, so its words read: a soft pool
  // round the words, night whole under them, easing back to the picture well past their ends.
  if (u_hasClear > 0.5) {
    float pool = length((gl_FragCoord.xy - u_clear.xy) / u_clear.zw);
    tone = mix(min(tone, 0.06), tone, smoothstep(0.9, 1.8, pool));
  }

  // The arrival: from the edges in, along a rounded square, its frontier ragged with the silk and
  // dithered by the same threshold, so cells join one by one, never along a line.
  vec2 c = abs(v_uv - 0.5) * 2.0;
  float inward = 1.0 - pow(pow(c.x, 4.0) + pow(c.y, 4.0), 0.25);
  inward += (fbm(p * 2.6 + vec2(u_time * 0.04, 3.0)) - 0.5) * 0.3;
  float band = 0.22;
  float cover = clamp((mix(-0.42, 1.32, u_reach) - inward) / band, 0.0, 1.0);
  float threshold = bayer8(gl_FragCoord.xy + vec2(3.0, 5.0));
  float on = step(threshold + 0.002, cover);
  // The frontier's newest cells come in a little lit.
  tone += (1.0 - cover) * 0.35;

  const float steps = 5.0;
  float q = floor(clamp(tone, 0.0, 1.0) * steps + bayer8(gl_FragCoord.xy)) / steps;
  gl_FragColor = vec4(palette(q * 0.86) * on, on);
}`;

/** Gentle at both ends, even in the middle, so the edge is seen moving in from its first cells. */
const ease = (t: number): number => t * t * (3 - 2 * t);

/** A picture, decoded; undefined where it would not load. */
const picture = async (src: string): Promise<HTMLImageElement | undefined> =>
  await new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => resolve(undefined));
    image.src = src;
  });

/**
 * How far the dither must have come in before the screen counts as seen: by then it stands all
 * round the window's edges. Until then the screen lets every input through to the page.
 */
const seenAt = 0.3;

export interface IdleScreen {
  /** Takes the screen away: at once with `now`, else after a fade of a moment. */
  end: (now?: boolean) => void;
  /** Whether enough of it is drawn to be seen; only then does it catch the input that ends it. */
  seen: () => boolean;
}

/**
 * Puts the idle screen over the window. Nothing is drawn until the first picture has come. Null
 * where WebGL won't run; where the picture fails or WebGL is lost later, it takes itself away and
 * calls `gone`.
 */
export const idleScreen = (gone: () => void): IdleScreen | null => {
  const overlay = document.createElement("div");
  overlay.dataset.idleScreen = "";
  overlay.setAttribute("aria-hidden", "true");
  // Its own element with its own styles: over everything, and once seen catching the first input,
  // so that input is not a click on what lies under it. No layout or style of the page changes.
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    zIndex: "2147483647",
    pointerEvents: "none",
    cursor: "none",
    contain: "strict",
    userSelect: "none",
    touchAction: "none",
  });
  const canvas = document.createElement("canvas");
  Object.assign(canvas.style, {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
    imageRendering: "pixelated",
    transition: `opacity ${durations.swap}ms linear`,
  });
  const line = document.createElement("p");
  line.textContent = matchMedia("(hover: none)").matches
    ? words.touch
    : words.pointer;
  Object.assign(line.style, {
    position: "absolute",
    insetInline: "0",
    bottom: "max(28px, env(safe-area-inset-bottom))",
    margin: "0",
    textAlign: "center",
    font: "500 13px/20px var(--damsko-font-sans)",
    letterSpacing: "0.01em",
    color: "var(--damsko-brand-paper)",
    opacity: "0",
    transition: `opacity ${durations.open}ms ease-out`,
  });
  overlay.append(canvas, line);

  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: true,
  });
  const program = gl === null ? null : programOf(gl, FRAGMENT);
  if (gl === null || program === null) {
    return null;
  }
  const at = (name: string): WebGLUniformLocation | null =>
    gl.getUniformLocation(program, name);

  let frame = 0;
  let ended = false;
  let seen = false;
  // The screen's own clock: it stands still while the tab is hidden, so nothing jumps on return.
  let clock = 0;
  let last = 0;
  /** Where the screen is: arriving, resting on scene `index`, or morphing to the next. */
  let index = 0;
  let phaseAt = 0;
  let phase: "arrive" | "rest" | "morph" = "arrive";
  let next: { image: HTMLImageElement; scene: Scene } | undefined;
  /** Which texture unit holds the scene now shown (the other holds the next). */
  let shown = 0;
  const textures = [gl.createTexture(), gl.createTexture()];

  const fit = (): void => {
    canvas.width = Math.max(1, Math.round(innerWidth / cell));
    canvas.height = Math.max(1, Math.round(innerHeight / cell));
    gl.viewport(0, 0, canvas.width, canvas.height);
  };

  /** Puts `image` on texture unit `unit`, as the scene shown or the next. */
  const place = (
    unit: number,
    image: HTMLImageElement,
    scene: Scene,
    slot: keyof typeof uniforms
  ): void => {
    gl.activeTexture(unit === 0 ? gl.TEXTURE0 : gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textures[unit] ?? null);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.LUMINANCE,
      gl.LUMINANCE,
      gl.UNSIGNED_BYTE,
      image
    );
    for (const side of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) {
      gl.texParameteri(gl.TEXTURE_2D, side, gl.CLAMP_TO_EDGE);
    }
    for (const filter of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) {
      gl.texParameteri(gl.TEXTURE_2D, filter, gl.LINEAR);
    }
    const names = uniforms[slot];
    gl.uniform1i(at(names.image), unit);
    gl.uniform2f(at(names.res), image.naturalWidth, image.naturalHeight);
    gl.uniform2f(at(names.focus), scene.focus[0], scene.focus[1]);
    gl.uniform4f(
      at(names.grade),
      scene.gamma,
      scene.gain,
      scene.sway,
      scene.drift
    );
    gl.uniform1f(at(names.invert), scene.invert ? 1 : 0);
  };

  /** Keeps the scene under the line dark: the pool's middle and half its size, in the canvas's pixels from its foot. */
  const clearLine = (): void => {
    const range = document.createRange();
    range.selectNodeContents(line);
    const box = range.getBoundingClientRect();
    gl.uniform4f(
      at("u_clear"),
      (box.left + box.right) / 2 / cell,
      (innerHeight - (box.top + box.bottom) / 2) / cell,
      (box.width / 2 + 44) / cell,
      (box.height / 2 + 20) / cell
    );
    gl.uniform1f(at("u_hasClear"), 1);
  };

  const fetchNext = (): void => {
    const scene = scenes[(index + 1) % scenes.length];
    next = undefined;
    if (scene === undefined) {
      return;
    }
    void picture(scene.src).then((image) => {
      if (!ended && image !== undefined) {
        next = { image, scene };
      }
    });
  };

  const draw = (): void => {
    const elapsed = clock - phaseAt;
    if (phase === "arrive") {
      const reach = Math.min(1, elapsed / timing.arrive);
      gl.uniform1f(at("u_reach"), ease(reach));
      if (!seen && ease(reach) >= seenAt) {
        seen = true;
        overlay.style.pointerEvents = "auto";
      }
      if (reach >= 1) {
        phase = "rest";
        phaseAt = clock;
        line.style.opacity = "0.85";
        clearLine();
        fetchNext();
      }
    } else if (phase === "rest") {
      if (elapsed >= timing.rest && next !== undefined) {
        place(1 - shown, next.image, next.scene, "next");
        phase = "morph";
        phaseAt = clock;
      }
    } else {
      const morph = Math.min(1, elapsed / timing.morph);
      gl.uniform1f(at("u_morph"), morph);
      if (morph >= 1 && next !== undefined) {
        // The next is now the scene: it moves into the current slot, on the unit it already holds.
        shown = 1 - shown;
        place(shown, next.image, next.scene, "now");
        gl.uniform1f(at("u_morph"), 0);
        index = (index + 1) % scenes.length;
        phase = "rest";
        phaseAt = clock;
        fetchNext();
      }
    }
    gl.uniform2f(at("u_res"), canvas.width, canvas.height);
    gl.uniform1f(at("u_time"), startAt + clock / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    overlay.dataset.idlePhase = phase;
  };
  const loop = (now: number): void => {
    frame = requestAnimationFrame(loop);
    if (now - last < frameMs) {
      return;
    }
    clock += Math.min(100, now - last);
    last = now;
    draw();
  };
  /** Draws while the tab is seen, and not at all while it is hidden. */
  const run = (): void => {
    cancelAnimationFrame(frame);
    if (document.hidden || ended || overlay.dataset.idlePhase === undefined) {
      return;
    }
    last = performance.now();
    frame = requestAnimationFrame(loop);
  };
  // Sizing the canvas clears it: drawn again at once, with the line's place read again.
  const resized = (): void => {
    fit();
    if (phase !== "arrive") {
      clearLine();
    }
    if (overlay.dataset.idlePhase !== undefined) {
      draw();
    }
  };

  const remove = (): void => {
    cancelAnimationFrame(frame);
    removeEventListener("resize", resized);
    document.removeEventListener("visibilitychange", run);
    canvas.removeEventListener("webglcontextlost", fail);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    overlay.remove();
  };
  /** It cannot go on: gone at once, and the watcher told. */
  const fail = (): void => {
    ended = true;
    remove();
    gone();
  };
  const end = (now = false): void => {
    if (ended) {
      if (now) {
        remove();
      }
      return;
    }
    ended = true;
    cancelAnimationFrame(frame);
    // The page is reachable at once; the picture goes in a moment.
    overlay.style.pointerEvents = "none";
    if (now || !overlay.isConnected) {
      remove();
      return;
    }
    canvas.style.opacity = "0";
    line.style.opacity = "0";
    setTimeout(remove, durations.swap);
  };

  document.body.append(overlay);
  canvas.addEventListener("webglcontextlost", fail);
  fit();
  addEventListener("resize", resized);
  document.addEventListener("visibilitychange", run);

  // The palette, from the tokens as they resolve on the page.
  const style = getComputedStyle(overlay);
  gl.uniform3fv(
    at("u_palette"),
    stops.flatMap((stop) =>
      rgbaOf(style.getPropertyValue(`--damsko-brand-${stop}`).trim()).slice(
        0,
        3
      )
    )
  );
  gl.uniform1f(at("u_hasClear"), 0);
  gl.uniform1f(at("u_reach"), 0);
  gl.uniform1f(at("u_morph"), 0);
  gl.uniform1i(at("u_image"), 0);
  gl.uniform1i(at("u_next"), 1);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  const [first] = scenes;
  if (first !== undefined) {
    void picture(first.src).then((image) => {
      if (ended) {
        return;
      }
      if (image === undefined) {
        fail();
        return;
      }
      place(0, image, first, "now");
      overlay.dataset.idlePhase = phase;
      run();
    });
  }
  return { end, seen: () => seen && !ended };
};
