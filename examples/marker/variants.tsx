import { Marker, MarkerContent } from "@grasp-os/ui/components/marker";
import * as stylex from "@stylexjs/stylex";

import { layout } from "./layout";

// A line of words, a word between rules, and a line with a rule under it.
export default function MarkerVariants() {
  return (
    <div {...stylex.props(layout.column)}>
      <Marker>
        <MarkerContent>A default marker, for a note in the flow.</MarkerContent>
      </Marker>
      <Marker variant="separator">
        <MarkerContent>A separator</MarkerContent>
      </Marker>
      <Marker variant="border">
        <MarkerContent>A border marker, between rows of work.</MarkerContent>
      </Marker>
    </div>
  );
}
