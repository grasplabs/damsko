// The home page's living ground: the light of broad silk at dusk, drawn on one canvas as a WebGL
// fragment shader against Bayer's 8 by 8 threshold, in whole 3px cells, in one flat colour (the
// canvas's own, --showcase-ground-lit) on the page's own ground. As the page is scrolled the silk
// travels, its cells gather and its ink lays stronger. Drawn fifteen times a second while it is
// seen; with reduced motion it is one still picture. Where WebGL can't run, nothing is drawn.
// Decorative only, and the site's own: loaded only when the ground first comes into view.
// The same shader as the website's ground.

const VERTEX = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FRAGMENT = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
// How far the page has gone, 0 to 1: the silk travels, the cells gather, the ink lays stronger.
uniform float u_progress;
// The ink's colour and strength, read from the canvas's colour as it resolves.
uniform vec4 u_flat;
varying vec2 v_uv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}
float silk(vec2 p, float t) {
  vec2 q = vec2(fbm(p + vec2(0.0, t * 0.05)), fbm(p + vec2(5.2, 1.3) - t * 0.04));
  vec2 r = vec2(fbm(p + 3.0 * q + vec2(1.7, 9.2) + t * 0.06),
                fbm(p + 3.0 * q + vec2(8.3, 2.8) - t * 0.05));
  return fbm(p + 3.0 * r);
}
// The ordered dither's threshold for a cell, 0 to 1: Bayer's 8 by 8.
float bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2.0 + a.y * a.y * 0.75);
}
float bayer4(vec2 a) {
  return bayer2(0.5 * a) * 0.25 + bayer2(a);
}
float bayer8(vec2 a) {
  return bayer4(0.5 * a) * 0.25 + bayer2(a);
}
void main() {
  // Progress travels down through the silk, so the field moves with the page.
  vec2 field = (v_uv - 0.5 + vec2(0.0, u_progress * 0.9)) * vec2(u_res.x / u_res.y, 1.0);
  vec2 p = field * 1.4;
  float broad = smoothstep(0.3, 0.7, silk(p * 0.45 + 4.0, u_time));
  // Progress gathers the cells (more of them lit) and lays the ink stronger.
  float lit = clamp(1.0 - broad + u_progress * 0.28, 0.0, 1.0);
  float alpha = min(1.0, u_flat.a * (1.0 + u_progress * 1.2));
  // Whole 3px cells, lit where the light passes Bayer's threshold.
  float on = step(bayer8(floor(gl_FragCoord.xy / 3.0)) + 0.002, lit);
  gl_FragColor = vec4(u_flat.rgb * on * alpha, on * alpha);
}`;

/** A ground being drawn on its canvas. */
export interface Drawing {
  /** Draw on (true) or hold the last picture (false): off while it is out of view or the tab is hidden. */
  run: (on: boolean) => void;
  /** Stop for good and let go of what it holds. */
  stop: () => void;
}

/** Fifteen pictures a second: every CSS pixel goes through the silk, and its clock runs slow. */
const frameMs = 1000 / 15;
/** How much slower the silk's clock runs than the wall's. */
const pace = 0.3;
/** Where the clock starts, so the first picture is already a settled one. */
const startAt = 8;
/** How much further the silk turns over the whole of the page, in the shader's seconds. */
const progressTurn = 6;

/** A CSS colour as sRGB, 0 to 1 with its alpha, as a 2D canvas paints it. */
const rgbaOf = (colour: string): readonly [number, number, number, number] => {
  const probe = document.createElement("canvas");
  probe.width = 1;
  probe.height = 1;
  const ctx = probe.getContext("2d", { willReadFrequently: true });
  if (ctx === null) {
    return [0, 0, 0, 0];
  }
  ctx.fillStyle = colour;
  ctx.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0, a = 0] = ctx.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255, a / 255];
};

const compile = (
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null => {
  const shader = gl.createShader(type);
  if (shader === null) {
    return null;
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
};

/** The linked program, with the one quad it draws on; none where WebGL won't. */
const programOf = (gl: WebGLRenderingContext): WebGLProgram | null => {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (vertex === null || fragment === null || program === null) {
    return null;
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (gl.getProgramParameter(program, gl.LINK_STATUS) !== true) {
    return null;
  }
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );
  const position = gl.getAttribLocation(program, "a_pos");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  return program;
};

/**
 * Draws the ground on `element`, run and held by the Ground. `progress` is read at each picture;
 * `still` draws one settled picture and never loops. Undefined where WebGL won't draw.
 */
export const startShader = (
  element: HTMLCanvasElement,
  { progress, still }: { progress: () => number; still: boolean }
): Drawing | undefined => {
  // Kept between frames: it is drawn only every few frames, and a frame it isn't drawn on would
  // otherwise show nothing.
  const gl = element.getContext("webgl", {
    alpha: true,
    antialias: false,
    preserveDrawingBuffer: true,
  });
  if (gl === null) {
    return undefined;
  }
  const program = programOf(gl);
  if (program === null) {
    return undefined;
  }
  const at = (name: string) => gl.getUniformLocation(program, name);
  const res = at("u_res");
  const time = at("u_time");
  const flatAt = at("u_flat");
  const progressAt = at("u_progress");
  const begun = performance.now();
  let last = begun;
  let frame = 0;
  let running = false;
  // The colour, read from the token as it resolves here; read again only when the theme may have
  // changed, never at every picture.
  let coloured = false;
  const recolour = (): void => {
    coloured = false;
  };
  const themeWatch = new MutationObserver(recolour);
  themeWatch.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-mode", "data-theme", "class", "style"],
  });
  const colour = (): void => {
    if (coloured) {
      return;
    }
    coloured = true;
    const [r, g, b, a] = rgbaOf(getComputedStyle(element).color);
    gl.uniform4f(flatAt, r, g, b, a);
  };
  const fit = (): void => {
    const box = element.getBoundingClientRect();
    element.width = Math.max(1, Math.round(box.width));
    element.height = Math.max(1, Math.round(box.height));
    gl.viewport(0, 0, element.width, element.height);
  };
  const draw = (now: number): void => {
    last = now;
    colour();
    gl.uniform2f(res, element.width, element.height);
    const gone = Math.min(1, Math.max(0, progress()));
    gl.uniform1f(progressAt, gone);
    // With reduced motion the silk stands at one moment: the same picture however often it is drawn.
    const elapsed = still ? 0 : (now - begun) / 1000;
    gl.uniform1f(time, startAt + elapsed * pace + gone * progressTurn);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };
  const loop = (now: number): void => {
    frame = requestAnimationFrame(loop);
    if (now - last >= frameMs) {
      draw(now);
    }
  };
  // Sizing the canvas clears it: drawn again at once, so no frame is bare.
  const resized = new ResizeObserver(() => {
    fit();
    draw(performance.now());
  });
  resized.observe(element);
  fit();
  draw(begun);
  const run = (on: boolean): void => {
    if (still || on === running) {
      return;
    }
    running = on;
    if (on) {
      frame = requestAnimationFrame(loop);
    } else {
      cancelAnimationFrame(frame);
    }
  };
  // A context the browser takes away draws nothing more.
  const lost = (): void => {
    run(false);
  };
  element.addEventListener("webglcontextlost", lost);
  return {
    run,
    stop: () => {
      run(false);
      resized.disconnect();
      themeWatch.disconnect();
      element.removeEventListener("webglcontextlost", lost);
      if (!element.isConnected) {
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      }
    },
  };
};
