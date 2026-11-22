"use client";

import { Icon } from "@grasp-os/ui/lib/icons";
import type { IconData } from "@grasp-os/ui/lib/icons";
import { colors } from "@grasp-os/ui/lib/tokens.stylex";
// Pixel icons, after the website's security and work pages: an icon drawn in a dense grid of tiny squares (4px cells, 2px
// squares). The whole tile is a faint grid whose cells twinkle, each at its own pace; when it comes
// into view the icon starts up, each square switching on at its own moment, flaring for an instant
// and settling at its own brightness, once. The website's shader, as it is.
//
// One canvas for a row of icons, where the website gives each tile its own: the icons are drawn into
// one texture side by side and the shader picks each tile's icon by where it falls, so a wall keeps
// to one canvas. The icons are the library's own (lib/icons), read from the drawn Icon.
//
// Cost: one canvas, one full-screen pass a frame at the screen's rate, only while on screen and the
// tab is shown; capped at 2x pixels. Under reduced motion the icons are laid down, still. Without
// WebGL the tiles stay empty. The colour is the canvas's CSS `color` (a token).
import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef } from "react";

import { linkProgram, rgbOf } from "./embers";

const REVEAL_SECONDS = 1.3;
const ICON_SCALE = 0.74;
const RASTER = 256;

const VERTEX = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAGMENT = `
precision mediump float;
uniform vec2 uSize;
uniform float uRatio;
uniform float uTime;
uniform float uProgress;
uniform float uStill;
uniform float uCount;
uniform float uGap;
uniform vec3 uColor;
uniform sampler2D uIcon;

float hash(vec2 p) {
  p = fract(p * vec2(443.897, 441.423));
  p += dot(p, p.yx + 19.19);
  return fract((p.x + p.y) * p.x);
}

void main() {
  vec2 px = vec2(gl_FragCoord.x, uSize.y * uRatio - gl_FragCoord.y) / uRatio;
  vec2 cell = floor(px / 4.0);
  vec2 local = mod(px, 4.0);
  vec2 centre = cell * 4.0 + 2.0;
  float seed = hash(cell);
  float square = step(local.x, 2.0) * step(local.y, 2.0);

  float clock = uTime * mix(0.5, 1.1, hash(cell + 71.0)) + seed * 37.0;
  float beat = floor(clock);
  float shimmer = mix(hash(cell + beat * 13.0), hash(cell + (beat + 1.0) * 13.0), smoothstep(0.0, 1.0, fract(clock)));
  shimmer = mix(shimmer, 0.5, uStill);

  // Which tile this cell is in, and the icon in a centred square of it.
  float tileW = (uSize.x - uGap * (uCount - 1.0)) / uCount;
  float index = clamp(floor(centre.x / (tileW + uGap)), 0.0, uCount - 1.0);
  vec2 tileCentre = centre - vec2(index * (tileW + uGap), 0.0);
  float side = min(tileW, uSize.y) * ${ICON_SCALE.toFixed(2)};
  vec2 iconUv = (tileCentre - (vec2(tileW, uSize.y) - side) * 0.5) / side;
  float inBox = step(0.0, iconUv.x) * step(iconUv.x, 1.0) * step(0.0, iconUv.y) * step(iconUv.y, 1.0);
  float ink = step(0.5, texture2D(uIcon, vec2((index + iconUv.x) / uCount, iconUv.y)).a) * inBox;

  float on = clamp((uProgress - hash(cell + 5.0) * 0.6) / 0.4, 0.0, 1.0);
  float laid = smoothstep(0.0, 0.3, on);
  float flare = pow(sin(on * 3.14159), 2.0) * 0.55 * (1.0 - uStill);

  float tone = (0.3 + pow(seed, 1.3) * 0.62) * (0.55 + shimmer * 0.9);
  float lit = square * ink * laid * clamp(tone + flare, 0.12, 1.0);
  float grid = square * (0.03 + seed * 0.07) * (0.6 + shimmer * 0.8) * (1.0 - lit);
  gl_FragColor = vec4(uColor * lit + vec3(grid), lit + grid);
}`;

const s = stylex.create({
  canvas: {
    position: "absolute",
    inset: 0,
    display: "block",
    width: "100%",
    height: "100%",
    color: colors.brandMint,
    // The field fades into the wall on every side: no box.
    maskImage:
      "linear-gradient(90deg, transparent, black 10%, black 90%, transparent), linear-gradient(180deg, transparent, black 22%, black 78%, transparent)",
    maskComposite: "intersect",
  },
  // The drawn icons the texture is read from: out of sight, never in the way.
  source: {
    position: "absolute",
    width: 1,
    height: 1,
    overflow: "hidden",
    clipPath: "inset(50%)",
    visibility: "hidden",
  },
});

/** A row of icons in pixels, filling the positioned parent; `gap` (px) between the tiles. */
export const PixelIcons = ({
  icons,
  gap = 24,
}: {
  icons: readonly IconData[];
  gap?: number;
}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const source = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas?.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      powerPreference: "low-power",
      premultipliedAlpha: true,
    });
    const svgs = [...(source.current?.querySelectorAll("svg") ?? [])];
    if (!canvas || !gl || svgs.length === 0) {
      return;
    }
    const program = linkProgram(gl, VERTEX, FRAGMENT);
    if (!program) {
      return;
    }
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    const at = (name: string) => gl.getUniformLocation(program, name);
    gl.uniform3f(at("uColor"), ...rgbOf(getComputedStyle(canvas).color));
    gl.uniform1f(at("uCount"), svgs.length);
    gl.uniform1f(at("uGap"), gap);
    gl.clearColor(0, 0, 0, 0);

    const still = matchMedia("(prefers-reduced-motion: reduce)");
    let ready = false;
    let visible = false;
    let started = false;
    let progress = -1;
    let time = 0;
    let last = 0;
    let frame = 0;
    let gone = false;
    const draw = () => {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(at("uTime"), time);
      gl.uniform1f(at("uProgress"), still.matches ? 1 : progress);
      gl.uniform1f(at("uStill"), still.matches ? 1 : 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const tick = (now: number) => {
      const step = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      time += step;
      if (started && progress < 1) {
        progress = Math.min(1, Math.max(progress, 0) + step / REVEAL_SECONDS);
      }
      draw();
      frame = requestAnimationFrame(tick);
    };
    const update = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
      if (!ready) {
        return;
      }
      if (visible && !still.matches && !document.hidden) {
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
      gl.uniform2f(at("uSize"), width, height);
      gl.uniform1f(at("uRatio"), ratio);
      update();
    };

    // The icons, drawn side by side into one texture, once.
    const raster = document.createElement("canvas");
    raster.width = RASTER * svgs.length;
    raster.height = RASTER;
    const paint = raster.getContext("2d");
    void Promise.all(
      svgs.map(
        (svg, index) =>
          new Promise<void>((done) => {
            const copy = svg.cloneNode(true) as SVGSVGElement;
            copy.setAttribute("width", String(RASTER));
            copy.setAttribute("height", String(RASTER));
            copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            // The token's stroke is a class on the drawn icon, which a picture of it does not
            // carry: write what it computes to onto the copy.
            const drawn = getComputedStyle(svg);
            copy.removeAttribute("class");
            copy.setAttribute("stroke", "#000");
            // A little heavier than the token's stroke, so a line is two squares wide at the tile's size.
            copy.setAttribute("stroke-width", "2");
            copy.setAttribute("stroke-linecap", drawn.strokeLinecap || "round");
            copy.setAttribute(
              "stroke-linejoin",
              drawn.strokeLinejoin || "round"
            );
            copy.setAttribute(
              "fill",
              drawn.fill === "" || drawn.fill === "none" ? "none" : "#000"
            );
            const markup = new XMLSerializer()
              .serializeToString(copy)
              .replaceAll("currentColor", "#000");
            const image = new Image();
            image.addEventListener("load", () => {
              paint?.drawImage(image, index * RASTER, 0, RASTER, RASTER);
              done();
            });
            image.addEventListener("error", () => {
              done();
            });
            image.src = `data:image/svg+xml,${encodeURIComponent(markup)}`;
          })
      )
    ).then(() => {
      if (gone) {
        return;
      }
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        raster
      );
      ready = true;
      resize();
    });

    const sized = new ResizeObserver(resize);
    sized.observe(canvas);
    const seen = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false;
        // Laid down once: scrolled away and back, the icons stay. Only the twinkle pauses.
        if ((entry?.intersectionRatio ?? 0) >= 0.5) {
          started = true;
        }
        update();
      },
      { threshold: [0, 0.5] }
    );
    seen.observe(canvas);
    still.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      gone = true;
      cancelAnimationFrame(frame);
      sized.disconnect();
      seen.disconnect();
      still.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, [gap]);
  return (
    <>
      <canvas
        ref={ref}
        aria-hidden="true"
        data-brand-canvas=""
        {...stylex.props(s.canvas)}
      />
      <span ref={source} aria-hidden="true" {...stylex.props(s.source)}>
        {icons.map((icon, index) => (
          <Icon key={index} icon={icon} />
        ))}
      </span>
    </>
  );
};
