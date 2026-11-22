"use client";

import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from "@grasp-os/ui/components/marker";
import { Shimmer } from "@grasp-os/ui/components/shimmer";
import { Spinner } from "@grasp-os/ui/components/spinner";
import * as stylex from "@stylexjs/stylex";

import { layout } from "./layout";

// Work under way: `role="status"`, so its words are said as they change. A Spinner or a Shimmer
// shows that it is working.
export default function MarkerStatus() {
  return (
    <div {...stylex.props(layout.column)}>
      <Marker role="status">
        <MarkerIcon>
          <Spinner />
        </MarkerIcon>
        <MarkerContent>Summarising the conversation</MarkerContent>
      </Marker>
      <Marker role="status">
        <MarkerContent>
          <Shimmer>Thinking</Shimmer>
        </MarkerContent>
      </Marker>
      <Marker variant="separator" role="status">
        <MarkerIcon>
          <Spinner />
        </MarkerIcon>
        <MarkerContent>Running the checks</MarkerContent>
      </Marker>
    </div>
  );
}
