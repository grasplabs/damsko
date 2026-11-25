// A finished `mermaid` fence in Markdown, drawn as its diagram, as Streamdown draws one: Mermaid,
// loaded only when a diagram is drawn, at its strict security level; the code in CodeBlock until it
// has drawn, and for good when it cannot. Download (SVG, PNG or the code as MMD), Copy and full
// screen beside it, and zoom and a drag to move it in its view.
"use client";

import * as stylex from "@stylexjs/stylex";
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
import { colors, radius, space } from "../../lib/tokens.stylex";
import { saveFile } from "../../lib/utils";
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

const styles = stylex.create({
  view: {
    position: "relative",
    overflow: "hidden",
    minHeight: 160,
    padding: space["4"],
    backgroundColor: colors.background,
    borderRadius: radius.md,
    cornerShape: radius.shape,
    cursor: "grab",
    touchAction: "none",
  },
  big: { height: "100%", minHeight: "60vh" },
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
  },
});

// Zoom as Streamdown's: from half to three times, a tenth a step.
const LEAST = 0.5;
const MOST = 3;
const STEP = 0.1;

/**
 * Mermaid's drawing as nodes, parsed inert (a template never runs what it holds), less any script
 * or handler left in it: Mermaid's strict level already removes them.
 */
const nodesOf = (svg: string) => {
  const template = document.createElement("template");
  template.innerHTML = svg;
  for (const element of template.content.querySelectorAll("*")) {
    if (element.localName === "script") {
      element.remove();
    }
    for (const { name } of element.attributes) {
      if (/^on/iu.test(name)) {
        element.removeAttribute(name);
      }
    }
  }
  return template.content;
};

/** Draws `code` with Mermaid, loaded the first time: its SVG, or null when it cannot. */
const drawDiagram = async (code: string, id: string) => {
  const { default: mermaid } = await import("mermaid");
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    suppressErrorRendering: true,
    theme: "default",
    // Labels as SVG text, not HTML in the drawing: nothing of HTML in it at all, and a PNG can be
    // drawn from it (a canvas will not export a drawing that holds HTML).
    htmlLabels: false,
  });
  try {
    const { svg } = await mermaid.render(id, code);
    return svg;
  } catch {
    return null;
  }
};

/** The drawing as a PNG, twice its size: drawn onto a canvas from its SVG. */
const pngOf = async (svg: string) => {
  const box =
    /viewBox="(?<box>[^"]*)"/u
      .exec(svg)
      ?.groups?.box?.split(/[\s,]+/u)
      .map(Number) ?? [];
  const width = box[2] ?? 0;
  const height = box[3] ?? 0;
  const image = new Image();
  image.src = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = width * 2;
  canvas.height = height * 2;
  const context = canvas.getContext("2d");
  context?.scale(2, 2);
  context?.drawImage(image, 0, 0, width, height);
  URL.revokeObjectURL(image.src);
  // oxlint-disable-next-line promise/avoid-new -- a canvas gives its blob by a callback
  return await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });
};

/** The drawing, zoomed by its buttons and moved by a drag. */
const View = ({ svg, big = false }: { svg: string; big?: boolean }) => {
  const words = useI18n().markdown;
  const box = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [at, setAt] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    box.current?.replaceChildren(nodesOf(svg));
  }, [svg]);
  const zoomBy = (step: number) => {
    setZoom((now) => Math.min(MOST, Math.max(LEAST, now + step)));
  };
  return (
    <div
      {...stylex.props(styles.view, big && styles.big)}
      onPointerDown={(event) => {
        if (event.button === 0) {
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
      <div
        ref={box}
        data-slot="markdown-diagram-drawing"
        {...stylex.props(styles.drawing, styles.moved(at.x, at.y, zoom))}
      />
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
 * A finished `mermaid` fence: its diagram once Mermaid has drawn it, the code until then and for
 * good when Mermaid cannot read it; Download, Copy and full screen, out of use while the answer is
 * written.
 */
export const Diagram = ({
  code,
  streaming,
}: {
  code: string;
  streaming: boolean;
}) => {
  const words = useI18n().markdown;
  const id = `mermaid-${useId().replaceAll(/[^\w-]/gu, "")}`;
  const [svg, setSvg] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    const draw = async () => {
      const drawn = await drawDiagram(code, id);
      if (live) {
        setSvg(drawn);
      }
    };
    void draw();
    return () => {
      live = false;
    };
  }, [code, id]);
  return (
    <div data-slot="markdown-diagram">
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
                      saveFile(svg, "diagram.svg", "image/svg+xml");
                    }}
                  >
                    {words.svg}
                  </DropdownMenuItem>
                )}
                {svg !== null && (
                  <DropdownMenuItem
                    onSelect={async () => {
                      const png = await pngOf(svg);
                      if (png !== null) {
                        saveFile(png, "diagram.png", "image/png");
                      }
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
                  <View svg={svg} big />
                </DialogContent>
              </Dialog>
            )}
          </Code.CodeBlockActions>
        </Code.CodeBlockHeader>
        {svg === null ? (
          <Code.CodeBlockContent lineNumbers>{code}</Code.CodeBlockContent>
        ) : (
          <View svg={svg} />
        )}
      </Code.CodeBlock>
    </div>
  );
};
