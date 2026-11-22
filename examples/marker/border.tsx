import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from "@grasp-os/ui/components/marker";
import {
  FileIcon,
  GitCompareIcon,
  Icon,
  SearchIcon,
} from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";

import { layout } from "./layout";

// Rows of work, each with a rule under it: the line stays a line, set apart from the next.
export default function MarkerBorder() {
  return (
    <div {...stylex.props(layout.rows)}>
      <Marker variant="border">
        <MarkerIcon>
          <Icon icon={GitCompareIcon} />
        </MarkerIcon>
        <MarkerContent>Compared the two drafts</MarkerContent>
      </Marker>
      <Marker variant="border">
        <MarkerIcon>
          <Icon icon={SearchIcon} />
        </MarkerIcon>
        <MarkerContent>Searched 8 related files</MarkerContent>
      </Marker>
      <Marker variant="border">
        <MarkerIcon>
          <Icon icon={FileIcon} />
        </MarkerIcon>
        <MarkerContent>Opened the meeting notes</MarkerContent>
      </Marker>
    </div>
  );
}
