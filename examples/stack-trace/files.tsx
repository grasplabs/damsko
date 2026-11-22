"use client";

import {
  StackTrace,
  StackTraceActions,
  StackTraceContent,
  StackTraceCopyButton,
  StackTraceFrames,
  StackTraceHeader,
} from "@grasp-os/ui/components/stack-trace";
import { Text } from "@grasp-os/ui/components/text";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { layout } from "./layout";

const stack = `TypeError: Cannot read properties of undefined (reading 'total')
    at formatInvoice (app/lib/billing.ts:42:31)
    at InvoiceRow (app/components/invoice-row.tsx:18:12)
    at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:14985:18)
    at beginWork (node_modules/react-dom/cjs/react-dom.development.js:19049:16)
    at Module._compile (node:internal/modules/cjs/loader:1554:14)`;

// The product opens a file where a frame points when its path is pressed; here it only says which.
// The framework's frames are left out, so the ones you can fix stand alone.
export default function StackTraceFiles() {
  const [opened, setOpened] = useState("");
  return (
    <div {...stylex.props(layout.column)}>
      <StackTrace
        trace={stack}
        defaultOpen
        onFilePathClick={(path, line) => {
          setOpened(`Opened ${path} at line ${line ?? 1}`);
        }}
      >
        <StackTraceHeader />
        <StackTraceActions>
          <StackTraceCopyButton />
        </StackTraceActions>
        <StackTraceContent>
          <StackTraceFrames showInternalFrames={false} />
        </StackTraceContent>
      </StackTrace>
      <div role="status">
        <Text size="sm" color="muted">
          {opened}
        </Text>
      </div>
    </div>
  );
}
