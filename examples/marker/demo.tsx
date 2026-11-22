import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from "@grasp-os/ui/components/marker";
import { Spinner } from "@grasp-os/ui/components/spinner";
import { Icon, PencilIcon, UserPlusIcon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";

import { layout } from "./layout";

// The lines that mark what happened in the conversation, between messages: someone joined, the
// connection (a status, said as it changes), a word between rules, and a new name.
export default function MarkerDemo() {
  return (
    <div {...stylex.props(layout.column)}>
      <Marker>
        <MarkerIcon>
          <Icon icon={UserPlusIcon} />
        </MarkerIcon>
        <MarkerContent>Mina joined the conversation</MarkerContent>
      </Marker>
      <Marker role="status">
        <MarkerIcon>
          <Spinner />
        </MarkerIcon>
        <MarkerContent>Reconnecting</MarkerContent>
      </Marker>
      <Marker variant="separator">
        <MarkerContent>Conversation summarised</MarkerContent>
      </Marker>
      <Marker>
        <MarkerIcon>
          <Icon icon={PencilIcon} />
        </MarkerIcon>
        <MarkerContent>Renamed to Q3 plan</MarkerContent>
      </Marker>
    </div>
  );
}
