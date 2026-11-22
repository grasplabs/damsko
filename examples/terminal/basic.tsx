import {
  Terminal,
  TerminalContent,
  TerminalHeader,
  TerminalTitle,
} from "@grasp-os/ui/components/terminal";
import * as stylex from "@stylexjs/stylex";

import { layout } from "./layout";

const output = `> my-app@0.1.0 build
> vite build

vite v7.1.0 building for production...
✓ 412 modules transformed.
dist/index.html                  0.46 kB
dist/assets/index-4f8a2c.js    142.31 kB
✓ built in 2.84s`;

// A command that ran: its line says so, and a press opens what it printed.
export default function TerminalBasic() {
  return (
    <div {...stylex.props(layout.column)}>
      <Terminal output={output} style={layout.wide}>
        <TerminalHeader>
          <TerminalTitle>Ran pnpm build</TerminalTitle>
        </TerminalHeader>
        <TerminalContent />
      </Terminal>
    </div>
  );
}
