import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from "@grasp-os/ui/components/marker";
import { Spinner } from "@grasp-os/ui/components/spinner";
import { GitCompareIcon, Icon, SearchIcon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";

import { layout } from "./layout";

// The lines that mark what happened between messages: a step done, the work under way (a status,
// said as it changes), a word between rules, and another step.
export default function MarkerDemo() {
  return (
    <div {...stylex.props(layout.column)}>
      <Marker>
        <MarkerIcon>
          <Icon icon={GitCompareIcon} />
        </MarkerIcon>
        <MarkerContent>Compared the two drafts</MarkerContent>
      </Marker>
      <Marker role="status">
        <MarkerIcon>
          <Spinner size="sm" />
        </MarkerIcon>
        <MarkerContent>Reading the contract</MarkerContent>
      </Marker>
      <Marker variant="separator">
        <MarkerContent>Conversation summarised</MarkerContent>
      </Marker>
      <Marker>
        <MarkerIcon>
          <Icon icon={SearchIcon} />
        </MarkerIcon>
        <MarkerContent>Searched 4 files</MarkerContent>
      </Marker>
    </div>
  );
}
