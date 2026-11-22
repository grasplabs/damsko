// A Trace a spec drives (tests/trace.spec.ts): `window.traceScript.set` gives its lines their next
// statuses all at once, straight in the Trace and in the Trace nested under its row that opens, so a
// spec can add a line, finish one, or fail one, and hear what is said. The row's long title and its
// mark stand among the steps, for the spec to measure where titles start.
"use client";

import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@grasp-os/ui/components/trace";
import type { TraceLineStatus } from "@grasp-os/ui/components/trace";
import { FileDocIcon, Icon } from "@grasp-os/ui/lib/icons";
import { useEffect, useState } from "react";

interface Line {
  id: string;
  title: string;
  status?: TraceLineStatus;
}

interface Lines {
  /** The lines straight in the Trace. */
  outer: Line[];
  /** The lines in the Trace under the row that opens; without any, no row. */
  inner: Line[];
}

declare global {
  interface Window {
    traceScript?: { set: (lines: Lines) => void };
  }
}

const draw = (lines: Line[]) =>
  lines.map((line) => (
    <TraceLine key={line.id} status={line.status}>
      <TraceIcon />
      <TraceTitle>{line.title}</TraceTitle>
    </TraceLine>
  ));

export default function TraceScript() {
  const [lines, setLines] = useState<Lines>({
    outer: [
      { id: "brief", title: "Read the brief" },
      { id: "search", title: "Searching the web", status: "running" },
    ],
    inner: [
      { id: "pricing", title: "Read pricing-2026.pdf" },
      { id: "notes", title: "Reading win-loss notes.md", status: "running" },
    ],
  });
  useEffect(() => {
    window.traceScript = { set: setLines };
    return () => {
      delete window.traceScript;
    };
  }, []);
  return (
    <Trace>
      {draw(lines.outer)}
      {lines.inner.length > 0 && (
        <TraceCollapsible defaultOpen>
          <TraceCollapsibleTrigger>
            <TraceLine>
              <TraceIcon>
                <Icon icon={FileDocIcon} />
              </TraceIcon>
              <TraceTitle>
                Read 2 files on pricing and on last quarter's wins and losses
              </TraceTitle>
            </TraceLine>
          </TraceCollapsibleTrigger>
          <TraceCollapsibleContent>
            <Trace>{draw(lines.inner)}</Trace>
          </TraceCollapsibleContent>
        </TraceCollapsible>
      )}
    </Trace>
  );
}
