import { DiffViewerFiles } from "@grasp-os/ui/components/diff-viewer";
import type { DiffViewerFile } from "@grasp-os/ui/components/diff-viewer";

// A change across 200 files, each a module of 120 lines with a few lines edited and some added.
// Past 400 rows the list scrolls in its own box and draws only the rows in view.
const moduleOf = (at: number) =>
  Array.from({ length: 120 }, (_, line) =>
    line % 12 === 0
      ? `export function step${at}x${line}(input: number): number {`
      : `  const value${line} = input * ${line} + ${at}; // step ${line}`
  );

const files: DiffViewerFile[] = Array.from({ length: 200 }, (_, at) => {
  const before = moduleOf(at);
  const after = before.flatMap((line, index) => {
    if (index % 40 === 7) {
      return [line.replace("// step", "// checked step")];
    }
    if (at % 3 === 0 && index === 60) {
      return [line, `  const added${at} = ${at}; // new`];
    }
    return [line];
  });
  return {
    path: `src/steps/step-${String(at + 1).padStart(3, "0")}.ts`,
    oldValue: `${before.join("\n")}\n`,
    newValue: `${after.join("\n")}\n`,
  };
});

export default function DiffViewerMany() {
  return <DiffViewerFiles files={files} />;
}
