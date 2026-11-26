// A finished `mermaid` fence in Markdown, drawn as its diagram by Pele: Mermaid's syntax, drawn to
// SVG as a string, with no DOM, no frame and nothing fetched. Pele is loaded only when a diagram is
// drawn, once it is near the screen: its core, then the diagram's type, each a chunk of its own.
// The code shows in CodeBlock until it has drawn, and for good when it cannot. Its colours, font
// and corners are the tokens, through Pele's CSS variables, so it follows the colour scheme as the
// page does without being drawn again. Download (SVG, PNG or the code as MMD), Copy and full
// screen beside it, and zoom, a drag and the arrow keys to move it.
"use client";

import * as stylex from "@stylexjs/stylex";
import type * as PeleModule from "pele/lazy";
import { useEffect, useId, useRef, useState } from "react";

import { useI18n } from "../../lib/i18n";
import {
  DownloadIcon,
  Icon,
  Maximize2Icon,
  RefreshCwIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "../../lib/icons";
import { focusRing, visuallyHidden } from "../../lib/styles";
import { colors, font, radius, size, space } from "../../lib/tokens.stylex";
import { nothing, saveFile } from "../../lib/utils";
import { Button } from "../button";
import * as Code from "../code-block";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { MOST_CHARACTERS, refusalOf, safeSvg } from "./diagram-safe";

/** A token, or the system's colour `forced` under forced colours. */
const tone = (token: string, forced: string) => ({
  default: token,
  "@media (forced-colors: active)": forced,
});

const styles = stylex.create({
  view: {
    position: "relative",
    overflow: "hidden",
    minHeight: 160,
    padding: space["4"],
    // Room under the drawing for the zoom controls, so they never cover it.
    paddingBlockEnd: `calc(${space["2"]} * 2 + ${size.controlSm})`,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    cornerShape: radius.shape,
    cursor: "grab",
    // Pele's look, from the tokens (pele.run/theming): nodes on the muted surface with a mint edge
    // and the ink's words, edges in the muted words' colour, the page's fonts and corners. The
    // tokens resolve where the diagram stands, so a change of scheme recolours it in place.
    "--pele-bg": tone(colors.background, "Canvas"),
    "--pele-fg": tone(colors.foreground, "CanvasText"),
    "--pele-fg-on-light": tone(colors.brandInk, "CanvasText"),
    "--pele-fg-on-dark": tone(colors.brandPaper, "CanvasText"),
    "--pele-muted": tone(colors.mutedForeground, "CanvasText"),
    "--pele-line": tone(colors.mutedForeground, "CanvasText"),
    "--pele-surface": tone(colors.muted, "Canvas"),
    "--pele-surface-alt": tone(colors.card, "Canvas"),
    "--pele-border": tone(colors.mintDeep, "CanvasText"),
    "--pele-accent": tone(colors.mintDeep, "Highlight"),
    "--pele-critical": tone(colors.destructive, "Mark"),
    "--pele-series-1": tone(colors.chart1, "CanvasText"),
    "--pele-series-2": tone(colors.chart2, "CanvasText"),
    "--pele-series-3": tone(colors.chart3, "CanvasText"),
    "--pele-series-4": tone(colors.chart4, "CanvasText"),
    "--pele-series-5": tone(colors.chart5, "CanvasText"),
    "--pele-series-6": tone(colors.lavender, "CanvasText"),
    "--pele-series-7": tone(colors.info, "CanvasText"),
    "--pele-series-8": tone(colors.warning, "CanvasText"),
    "--pele-font": font.sans,
    "--pele-font-mono": font.mono,
    "--pele-radius": radius.sm,
  },
  big: { height: "100%", minHeight: "60vh", touchAction: "none" },
  drawing: {
    display: "flex",
    justifyContent: "center",
    transformOrigin: "center",
  },
  moved: (x: number, y: number, zoom: number) => ({
    transform: `translate(${x}px, ${y}px) scale(${zoom})`,
  }),
  zoom: {
    position: "absolute",
    insetInlineStart: space["2"],
    insetBlockEnd: space["2"],
    display: "flex",
    gap: space["1"],
    // Each control's touch target reaches the middle of the gap to the next (tapTarget).
    "--tap-room-inline": `calc(${space["1"]} / 2)`,
  },
});

// Zoom as Streamdown's: from half to three times, a tenth a step. The arrow keys move it 40px.
const LEAST = 0.5;
const MOST = 3;
const STEP = 0.1;
const NUDGE = 40;

/**
 * Why a diagram is its code: `skipped` when Damsko does not give it to Pele (`limit`, past a bound
 * on its size; `source`, a way to an address in it), `failed` when Pele was asked and did not draw
 * it (`load`, its code did not load; `syntax`, Pele could not read the fence; `render`, it could
 * not draw it, past one of its own limits too; `output`, what it drew is no SVG).
 */
export type DiagramReason =
  | "skipped:limit"
  | "skipped:source"
  | "failed:load"
  | "failed:syntax"
  | "failed:render"
  | "failed:output";

/** A diagram drawn, or why it is not. */
export type Drawing = { svg: string } | { reason: DiagramReason };

type Pele = typeof PeleModule;

// Pele's core, loaded the first time a diagram is drawn; each diagram type is a chunk of its own,
// loaded the first time one of its kind is drawn. A load that failed is asked for again next time.
let core: Promise<Pele> | null = null;
const loadPele = async () => {
  core ??= import("pele/lazy");
  try {
    return await core;
  } catch (error) {
    core = null;
    throw error;
  }
};

// Pele reads the fence, never the page: no link and no picture, and its own limits on (its source
// limit at ours). In a narrow column a wide diagram is laid out upright, as Pele does by default,
// so its words stay readable rather than shrunk to fit.
const OPTIONS = {
  links: false,
  images: false,
  limit: MOST_CHARACTERS,
} as const;

/** The fonts a diagram's words are measured in: the tokens' fonts, as they resolve in `place`. */
const fontsAt = (place: HTMLElement) => {
  const probe = document.createElement("span");
  probe.setAttribute("aria-hidden", "true");
  place.append(probe);
  probe.style.fontFamily = font.sans;
  const sans = getComputedStyle(probe).fontFamily;
  probe.style.fontFamily = font.mono;
  const mono = getComputedStyle(probe).fontFamily;
  probe.remove();
  return { fontFamily: sans, fontFamilyMono: mono };
};

/**
 * Draws `code` with Pele, loaded the first time: its SVG, held to SVG's own shapes, or why it is its
 * code. A fence `refusalOf` refuses is never drawn (`check: false` is for the spec that shows Pele
 * alone loads nothing). `width` is the room it has, which Pele lays it out for.
 */
export const drawDiagram = async (
  code: string,
  id: string,
  {
    check = true,
    width,
    fonts,
  }: {
    check?: boolean;
    width?: number;
    fonts?: { fontFamily: string; fontFamilyMono: string };
  } = {}
): Promise<Drawing> => {
  const refused = check ? refusalOf(code) : null;
  if (refused !== null) {
    return { reason: `skipped:${refused}` };
  }
  let pele: Pele;
  try {
    pele = await loadPele();
  } catch {
    return { reason: "failed:load" };
  }
  const type = pele.detectType(code);
  if (type === null) {
    return { reason: "failed:syntax" };
  }
  try {
    await pele.load(type);
  } catch {
    return { reason: "failed:load" };
  }
  let svg: string;
  try {
    ({ svg } = pele.render(code, {
      ...OPTIONS,
      ...fonts,
      idPrefix: id,
      ...(width === undefined ? {} : { maxWidth: width }),
    }));
  } catch (error) {
    const unread =
      error instanceof pele.PeleError &&
      ["syntax", "semantic", "unsupported-diagram"].includes(error.code);
    return { reason: unread ? "failed:syntax" : "failed:render" };
  }
  const safe = safeSvg(svg, id);
  return safe === null ? { reason: "failed:output" } : { svg: safe };
};

/** The numbers of the drawing's `viewBox`: where it starts, and its size. */
const boxOf = (svg: string) =>
  /viewBox="(?<box>[^"]*)"/u
    .exec(svg)
    ?.groups?.box?.split(/[\s,]+/u)
    .map(Number) ?? [];

// Pele's variables that are colours: a file seen anywhere cannot inherit them from the page.
const COLOURS = [
  "bg",
  "fg",
  "fg-on-light",
  "fg-on-dark",
  "muted",
  "line",
  "surface",
  "surface-alt",
  "border",
  "accent",
  "critical",
  ...Array.from({ length: 8 }, (_, at) => `series-${at + 1}`),
];

/** `css`, a colour, as `#rrggbb` once laid on `ground`: read back from one pixel of a canvas. */
const opaque = (
  context: CanvasRenderingContext2D,
  css: string,
  ground: string
) => {
  context.clearRect(0, 0, 1, 1);
  context.fillStyle = ground;
  context.fillRect(0, 0, 1, 1);
  context.fillStyle = css;
  context.fillRect(0, 0, 1, 1);
  const [red = 0, green = 0, blue = 0] = context.getImageData(0, 0, 1, 1).data;
  return `#${[red, green, blue].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
};

/**
 * The drawing as a file, seen anywhere as it is on the page: Pele's variables as they resolve in
 * `place` (each colour opaque, on the ground) written into it, and the ground under it.
 */
const fileOf = (svg: string, place: HTMLElement) => {
  const probe = document.createElement("span");
  probe.setAttribute("aria-hidden", "true");
  place.append(probe);
  const style = getComputedStyle(probe);
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const resolved = (name: string) => {
    probe.style.color = `var(--pele-${name})`;
    return style.color;
  };
  const ground = resolved("bg");
  const value = (name: string) =>
    context === null ? resolved(name) : opaque(context, resolved(name), ground);
  const settings = COLOURS.map((name) => `--pele-${name}:${value(name)}`);
  for (const name of ["font", "font-mono"]) {
    probe.style.fontFamily = `var(--pele-${name})`;
    settings.push(`--pele-${name}:${style.fontFamily}`);
  }
  settings.push(
    `--pele-radius:${getComputedStyle(place).getPropertyValue("--pele-radius").trim()}`
  );
  probe.remove();
  const read = new DOMParser().parseFromString(svg, "image/svg+xml");
  const root = read.documentElement;
  root.setAttribute(
    "style",
    `${settings.join(";")};${root.getAttribute("style") ?? ""}`
  );
  const [x = 0, y = 0, width = 0, height = 0] = boxOf(svg);
  const under = read.createElementNS("http://www.w3.org/2000/svg", "rect");
  for (const [name, at] of Object.entries({ x, y, width, height })) {
    under.setAttribute(name, String(at));
  }
  under.setAttribute("fill", value("bg"));
  root.prepend(under);
  return new XMLSerializer().serializeToString(root);
};

/** The drawing's place on the page in `frame`: where Pele's variables resolve. */
const placeIn = (frame: HTMLElement | null) => {
  const place = frame?.querySelector("[data-slot=markdown-diagram-drawing]");
  return place instanceof HTMLElement ? place : null;
};

/** The drawing as a PNG, at twice its size (less for a huge one): drawn onto a canvas. */
const pngOf = async (svg: string) => {
  const box = boxOf(svg);
  const width = box[2] ?? 0;
  const height = box[3] ?? 0;
  if (!(width > 0 && height > 0)) {
    throw new Error("The drawing has no size");
  }
  // A data: address, which a policy that allows pictures from data: allows (a blob: one, not).
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await image.decode();
  const scale = Math.min(2, 8192 / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const context = canvas.getContext("2d");
  context?.scale(scale, scale);
  context?.drawImage(image, 0, 0, width, height);
  // oxlint-disable-next-line promise/avoid-new -- a canvas gives its blob by a callback
  const png = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });
  if (png === null) {
    throw new Error("The drawing could not be drawn as a PNG");
  }
  return png;
};

/** The drawing's own title (the fence's `accTitle`), when it has one. */
const titleOf = (svg: string) =>
  new DOMParser()
    .parseFromString(svg, "image/svg+xml")
    .querySelector(":root > title")
    ?.textContent?.trim() ?? "";

/**
 * The drawing, zoomed by its buttons, moved by a drag and by the arrow keys; named by its title,
 * else as a Mermaid diagram.
 */
const View = ({
  svg,
  code,
  title,
  big = false,
}: {
  svg: string;
  code: string;
  title: string;
  big?: boolean;
}) => {
  const words = useI18n().markdown;
  const source = useId();
  const box = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [at, setAt] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const drawing = new DOMParser().parseFromString(svg, "image/svg+xml");
    box.current?.replaceChildren(
      document.importNode(drawing.documentElement, true)
    );
  }, [svg]);
  const zoomBy = (step: number) => {
    setZoom((now) => Math.min(MOST, Math.max(LEAST, now + step)));
  };
  const arrows: Record<string, { x: number; y: number }> = {
    ArrowLeft: { x: NUDGE, y: 0 },
    ArrowRight: { x: -NUDGE, y: 0 },
    ArrowUp: { x: 0, y: NUDGE },
    ArrowDown: { x: 0, y: -NUDGE },
  };
  return (
    <div
      {...stylex.props(styles.view, big && styles.big)}
      onPointerDown={(event) => {
        // A finger scrolls the answer past a diagram, and moves it only in full screen.
        if (event.button === 0 && (big || event.pointerType !== "touch")) {
          event.currentTarget.setPointerCapture(event.pointerId);
          setDrag({ x: event.clientX - at.x, y: event.clientY - at.y });
        }
      }}
      onPointerMove={(event) => {
        if (drag !== null) {
          setAt({ x: event.clientX - drag.x, y: event.clientY - drag.y });
        }
      }}
      onPointerUp={() => {
        setDrag(null);
      }}
      onPointerCancel={() => {
        setDrag(null);
      }}
    >
      {/* Named as a diagram, its code its description; the arrow keys move it. */}
      {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- the arrow keys move the drawing, as Streamdown's pan area moves */}
      <div
        ref={box}
        role="application"
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- it takes focus for the arrow keys
        tabIndex={0}
        aria-label={title === "" ? words.diagram : title}
        aria-describedby={source}
        data-slot="markdown-diagram-drawing"
        onKeyDown={(event) => {
          const by = arrows[event.key];
          if (by !== undefined) {
            event.preventDefault();
            setAt((now) => ({ x: now.x + by.x, y: now.y + by.y }));
          }
        }}
        {...stylex.props(
          styles.drawing,
          focusRing,
          styles.moved(at.x, at.y, zoom)
        )}
      />
      <span id={source} {...stylex.props(visuallyHidden)}>
        {code}
      </span>
      <div
        {...stylex.props(styles.zoom)}
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
      >
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={words.zoomIn}
          disabled={zoom >= MOST}
          onClick={() => {
            zoomBy(STEP);
          }}
        >
          <Icon icon={ZoomInIcon} />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={words.zoomOut}
          disabled={zoom <= LEAST}
          onClick={() => {
            zoomBy(-STEP);
          }}
        >
          <Icon icon={ZoomOutIcon} />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={words.resetZoom}
          onClick={() => {
            setZoom(1);
            setAt({ x: 0, y: 0 });
          }}
        >
          <Icon icon={RefreshCwIcon} />
        </Button>
      </div>
    </div>
  );
};

/**
 * A finished `mermaid` fence: its diagram once Pele has drawn it (once it is near the screen), the
 * code until then and for good when Pele cannot read it; Download, Copy and full screen, out of use
 * while the answer is written.
 */
export const Diagram = ({
  code,
  streaming,
}: {
  code: string;
  streaming: boolean;
}) => {
  const words = useI18n().markdown;
  const id = `diagram-${useId().replaceAll(/[^\w-]/gu, "")}`;
  const frame = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  // The last drawing, and the code it is of: its SVG, or null for code Pele did not draw, and why.
  const [drawn, setDrawn] = useState<{
    code: string;
    svg: string | null;
    title: string;
    reason: DiagramReason | null;
  } | null>(null);
  const svg = drawn?.svg ?? null;
  // Drawn once it comes within 300px of the screen, as Streamdown draws one.
  useEffect(() => {
    const at = frame.current;
    if (at === null || typeof IntersectionObserver === "undefined") {
      setNear(true);
      return nothing;
    }
    const watch = new IntersectionObserver(
      (seen) => {
        if (seen.some((each) => each.isIntersecting)) {
          setNear(true);
          watch.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    watch.observe(at);
    return () => {
      watch.disconnect();
    };
  }, []);
  useEffect(() => {
    const at = frame.current;
    if (!near || at === null) {
      return nothing;
    }
    let live = true;
    const draw = async () => {
      // Its words are measured in the page's fonts, once they have loaded.
      await document.fonts.ready;
      const made = await drawDiagram(code, id, {
        width: at.clientWidth,
        fonts: fontsAt(at),
      });
      if (!live) {
        return;
      }
      if ("reason" in made && made.reason.startsWith("failed:")) {
        // Said once, for whoever looks: never the fence's words.
        console.debug(`A Mermaid diagram is shown as its code: ${made.reason}`);
      }
      setDrawn(
        "svg" in made
          ? {
              code,
              svg: made.svg,
              title: titleOf(made.svg),
              reason: null,
            }
          : { code, svg: null, title: "", reason: made.reason }
      );
    };
    void draw();
    return () => {
      live = false;
    };
  }, [near, code, id]);
  const busy = near && drawn?.code !== code;
  /** The drawing as a file, as it shows on the page now. */
  const file = (drawing: string) => {
    const place = placeIn(frame.current);
    return place === null ? drawing : fileOf(drawing, place);
  };
  return (
    // Busy while Pele loads and draws it, once it is near the screen.
    <div
      ref={frame}
      data-slot="markdown-diagram"
      // Once settled, drawn or why it is its code (DiagramReason), for a host and its tests to wait
      // on; not there while it is drawn.
      data-diagram={
        drawn === null || busy ? undefined : (drawn.reason ?? "drawn")
      }
      aria-busy={busy}
    >
      <Code.CodeBlock language="mermaid">
        <Code.CodeBlockHeader>
          <Code.CodeBlockTitle />
          <Code.CodeBlockActions>
            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={streaming}>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={words.downloadDiagram}
                >
                  <Icon icon={DownloadIcon} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {svg !== null && (
                  <DropdownMenuItem
                    onSelect={() => {
                      saveFile(file(svg), "diagram.svg", "image/svg+xml");
                    }}
                  >
                    {words.svg}
                  </DropdownMenuItem>
                )}
                {svg !== null && (
                  <DropdownMenuItem
                    onSelect={async () => {
                      saveFile(
                        await pngOf(file(svg)),
                        "diagram.png",
                        "image/png"
                      );
                    }}
                  >
                    {words.png}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onSelect={() => {
                    saveFile(code, "diagram.mmd", "text/plain");
                  }}
                >
                  {words.mmd}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Code.CodeBlockCopyButton value={code} disabled={streaming} />
            {svg !== null && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={words.fullScreen}
                    disabled={streaming}
                  >
                    <Icon icon={Maximize2Icon} />
                  </Button>
                </DialogTrigger>
                <DialogContent size="full">
                  <DialogHeader>
                    <DialogTitle>{words.mermaid}</DialogTitle>
                  </DialogHeader>
                  <View svg={svg} code={code} title={drawn?.title ?? ""} big />
                </DialogContent>
              </Dialog>
            )}
          </Code.CodeBlockActions>
        </Code.CodeBlockHeader>
        {svg === null ? (
          <Code.CodeBlockContent lineNumbers>{code}</Code.CodeBlockContent>
        ) : (
          <View svg={svg} code={code} title={drawn?.title ?? ""} />
        )}
      </Code.CodeBlock>
    </div>
  );
};
