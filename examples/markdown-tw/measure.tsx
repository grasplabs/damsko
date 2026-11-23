import { Markdown as OnStreamdown } from "@grasp-os/ui/components-tw/markdown";
// The Tailwind experiment's measuring page: draws an answer with the system's Markdown or the
// Streamdown one, alone, at once (flushSync), and gives back what was drawn and how long it took.
// scripts-tw/markdown-measure.ts drives it.
import { Markdown as Own } from "@grasp-os/ui/components/markdown";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";

declare global {
  interface Window {
    md?: (
      which: "own" | "streamdown",
      source: string,
      streaming: boolean
    ) => { html: string; ms: number; error: string };
  }
}

const roots = new Map<string, { root: Root; host: HTMLElement }>();

if (typeof window !== "undefined") {
  window.md = (which, source, streaming) => {
    let entry = roots.get(which);
    if (entry === undefined) {
      const host = document.createElement("div");
      host.style.width = "720px";
      document.body.append(host);
      entry = { root: createRoot(host), host };
      roots.set(which, entry);
    }
    const Drawn = which === "own" ? Own : OnStreamdown;
    const start = performance.now();
    const failure = (() => {
      try {
        flushSync(() => {
          entry.root.render(<Drawn streaming={streaming}>{source}</Drawn>);
        });
        return "";
      } catch (error) {
        return error instanceof Error
          ? `${error.name}: ${error.message.slice(0, 80)}`
          : "error";
      }
    })();
    const ms = performance.now() - start;
    return { html: entry.host.innerHTML, ms, error: failure };
  };
}

export default function MarkdownMeasure() {
  return <p>Measuring page</p>;
}
