"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@grasp-os/ui/components/tabs";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const opened = [
  "app.tsx",
  "invoice-table.tsx",
  "invoices.ts",
  "suppliers-with-the-longest-name-in-the-project.ts",
  "README.md",
];

const layout = stylex.create({
  tabs: { width: "100%", maxWidth: 560 },
  file: {
    margin: 0,
    paddingBlock: space["4"],
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: font.textSm,
  },
});

// The open files of a Code view: each tab closes by its × or Delete. Closing the chosen file
// chooses the one beside it; closing the last leaves the view empty.
export default function TabsFiles() {
  const [files, setFiles] = useState(opened);
  const [file, setFile] = useState<string | null>(opened[0] ?? null);
  const close = (name: string) => {
    const at = files.indexOf(name);
    const rest = files.filter((each) => each !== name);
    setFiles(rest);
    if (file === name) {
      setFile(rest[at] ?? rest[at - 1] ?? null);
    }
  };
  return (
    <Tabs
      value={file ?? undefined}
      onValueChange={(value) => {
        setFile(value);
      }}
      style={layout.tabs}
    >
      <TabsList aria-label="Open files" variant="line">
        {files.map((name) => (
          <TabsTrigger
            key={name}
            value={name}
            onClose={() => {
              close(name);
            }}
          >
            {name}
          </TabsTrigger>
        ))}
      </TabsList>
      {files.map((name) => (
        <TabsContent key={name} value={name}>
          <p {...stylex.props(layout.file)}>{name}</p>
        </TabsContent>
      ))}
    </Tabs>
  );
}
