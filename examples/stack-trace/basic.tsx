import {
  StackTrace,
  StackTraceActions,
  StackTraceContent,
  StackTraceCopyButton,
  StackTraceError,
  StackTraceErrorMessage,
  StackTraceErrorType,
  StackTraceFrames,
  StackTraceHeader,
} from "@grasp-os/ui/components/stack-trace";
import * as stylex from "@stylexjs/stylex";

import { layout } from "./layout";

const stack = `TypeError: Cannot read properties of undefined (reading 'map')
    at UserList (app/components/user-list.tsx:15:23)
    at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:14985:18)
    at mountIndeterminateComponent (node_modules/react-dom/cjs/react-dom.development.js:17811:13)
    at beginWork (node_modules/react-dom/cjs/react-dom.development.js:19049:16)
    at performUnitOfWork (node_modules/react-dom/cjs/react-dom.development.js:22776:12)
    at workLoopSync (node_modules/react-dom/cjs/react-dom.development.js:22707:5)`;

// A failed call's error as its line, open on its frames: the app's own frame in ink, the
// framework's muted. Copy copies the stack as it was given.
export default function StackTraceBasic() {
  return (
    <div {...stylex.props(layout.column)}>
      <StackTrace trace={stack} defaultOpen>
        <StackTraceHeader>
          <StackTraceError>
            <StackTraceErrorType />
            {": "}
            <StackTraceErrorMessage />
          </StackTraceError>
        </StackTraceHeader>
        <StackTraceActions>
          <StackTraceCopyButton />
        </StackTraceActions>
        <StackTraceContent>
          <StackTraceFrames />
        </StackTraceContent>
      </StackTrace>
    </div>
  );
}
