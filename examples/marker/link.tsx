"use client";

import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from "@grasp-os/ui/components/marker";
import { FileIcon, Icon, UndoIcon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { layout } from "./layout";

// A Marker drawn as a link or a button (`asChild`): reached by Tab, named by its words.
export default function MarkerLink() {
  const [undone, setUndone] = useState(false);
  return (
    <div {...stylex.props(layout.column)}>
      <Marker asChild>
        <a href="https://example.com/notes">
          <MarkerIcon>
            <Icon icon={FileIcon} />
          </MarkerIcon>
          <MarkerContent>Opened the meeting notes</MarkerContent>
        </a>
      </Marker>
      <Marker asChild>
        <button
          type="button"
          onClick={() => {
            setUndone(true);
          }}
        >
          <MarkerIcon>
            <Icon icon={UndoIcon} />
          </MarkerIcon>
          <MarkerContent>
            {undone ? "Change undone" : "Undo this change"}
          </MarkerContent>
        </button>
      </Marker>
    </div>
  );
}
