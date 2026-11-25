// What the site's dithered WebGL pictures share: the home page's living ground
// (site/start/ground/shader.ts) and the docs' idle screen (site/behaviour/idle-screen.ts). One quad
// over the canvas, the silk's noise and Bayer's 8 by 8 threshold in GLSL, and a token's colour as
// the canvas paints it. Nothing here draws.

/** The quad's vertex shader: `v_uv` runs 0 to 1 across the canvas. */
const VERTEX = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

/** The GLSL both fragments build on: noise, its fbm, the silk's light, and Bayer's threshold. */
export const silkAndBayer = `
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
`;

/** A CSS colour as sRGB, 0 to 1 with its alpha, as a 2D canvas paints it (the tokens are oklch). */
export const rgbaOf = (
  colour: string
): readonly [number, number, number, number] => {
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

/** `fragment` linked over the one quad it draws on, in use; none where WebGL won't. */
export const programOf = (
  gl: WebGLRenderingContext,
  fragment: string
): WebGLProgram | null => {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const shaded = compile(gl, gl.FRAGMENT_SHADER, fragment);
  const program = gl.createProgram();
  if (vertex === null || shaded === null || program === null) {
    return null;
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, shaded);
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
