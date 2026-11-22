import {
  Terminal,
  TerminalContent,
  TerminalHeader,
  TerminalTitle,
} from "@grasp-os/ui/components/terminal";
import * as stylex from "@stylexjs/stylex";

import { layout } from "./layout";

const install = `Lockfile is up to date, resolution step is skipped
Packages: +214
Done in 3.1s`;

const lint = `> my-app@0.1.0 lint
> eslint .

src/api/chat.ts
  14:7  error  'model' is assigned a value but never used  no-unused-vars

src/components/chat.tsx
  42:5  error  React Hook useEffect has a missing dependency: 'messages'  react-hooks/exhaustive-deps

✖ 2 problems (2 errors, 0 warnings)

 ELIFECYCLE  Command failed with exit code 1.`;

// A command that exited with a code other than 0 failed: its line is in red, and open on why.
export default function TerminalError() {
  return (
    <div {...stylex.props(layout.column)}>
      <Terminal output={install} style={layout.wide}>
        <TerminalHeader>
          <TerminalTitle>Ran pnpm install</TerminalTitle>
        </TerminalHeader>
        <TerminalContent />
      </Terminal>
      <Terminal output={lint} defaultOpen style={layout.wide}>
        <TerminalHeader status="error">
          <TerminalTitle>pnpm lint exited with code 1</TerminalTitle>
        </TerminalHeader>
        <TerminalContent />
      </Terminal>
    </div>
  );
}
