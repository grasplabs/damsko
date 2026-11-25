import { Marker, MarkerContent } from "@grasp-os/ui/components/marker";
import * as stylex from "@stylexjs/stylex";

import { layout } from "./layout";

// A separator in each of the brand's colours, its words and rules alike: `primary` for news, the
// accents, and the statuses for what the line means.
export default function MarkerColors() {
  return (
    <div {...stylex.props(layout.rows)}>
      <Marker variant="separator">
        <MarkerContent>Default</MarkerContent>
      </Marker>
      <Marker variant="separator" color="primary">
        <MarkerContent>Primary</MarkerContent>
      </Marker>
      <Marker variant="separator" color="mint">
        <MarkerContent>Mint</MarkerContent>
      </Marker>
      <Marker variant="separator" color="pine">
        <MarkerContent>Pine</MarkerContent>
      </Marker>
      <Marker variant="separator" color="lavender">
        <MarkerContent>Lavender</MarkerContent>
      </Marker>
      <Marker variant="separator" color="success">
        <MarkerContent>Success</MarkerContent>
      </Marker>
      <Marker variant="separator" color="warning">
        <MarkerContent>Warning</MarkerContent>
      </Marker>
      <Marker variant="separator" color="destructive">
        <MarkerContent>Destructive</MarkerContent>
      </Marker>
      <Marker variant="separator" color="info">
        <MarkerContent>Info</MarkerContent>
      </Marker>
    </div>
  );
}
