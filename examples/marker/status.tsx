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

// A status of the conversation itself: `role="status"`, so its words are said as they change. An
// assistant's own step or work under way is a Trace line, not a Marker.
export default function MarkerStatus() {
  return (
    <div {...stylex.props(layout.column)}>
      <Marker role="status">
        <MarkerIcon>
          <Spinner />
        </MarkerIcon>
        <MarkerContent>Reconnecting</MarkerContent>
      </Marker>
      <Marker role="status">
        <MarkerContent>
          <Shimmer>Mina is typing</Shimmer>
        </MarkerContent>
      </Marker>
      <Marker variant="separator" role="status">
        <MarkerIcon>
          <Spinner />
        </MarkerIcon>
        <MarkerContent>Syncing the conversation</MarkerContent>
      </Marker>
    </div>
  );
}
