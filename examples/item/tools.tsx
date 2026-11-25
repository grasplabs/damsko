"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDetail,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@grasp-os/ui/components/item";
import { SidePanelSection } from "@grasp-os/ui/components/side-panel";
import {
  DatabaseIcon,
  Globe2Icon,
  Icon,
  LockIcon,
  MailIcon,
  PlusIcon,
  TrashIcon,
} from "@grasp-os/ui/lib/icons";
import type { IconData } from "@grasp-os/ui/lib/icons";
import { colors } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { Fragment, useState } from "react";

const layout = stylex.create({
  section: { width: "100%", maxWidth: 372 },
  // The lock after a name: quiet, beside the words.
  mark: { display: "inline-flex", color: colors.subtleForeground },
});

const more: { id: string; icon: IconData; name: string }[] = [
  { id: "mail", icon: MailIcon, name: "Send email" },
  { id: "files", icon: DatabaseIcon, name: "Shared files" },
];

// A side panel's card of tools, one `xs` row each in the panel's rhythm: the kind's icon in the
// accent, the name, a lock on the one that cannot be removed with its detail at the row's end, and
// a bin that waits for the pointer (`showOnHover`), always there for the keyboard. The row that
// adds one more is an Item that is one button, after the list.
export default function ItemTools() {
  const [tools, setTools] = useState([
    { id: "web", icon: Globe2Icon, name: "Search the web" },
  ]);
  const next = more.find((tool) => !tools.some((had) => had.id === tool.id));
  return (
    <SidePanelSection title="Tools" style={layout.section}>
      <ItemGroup separated aria-label="Tools">
        <Item size="xs">
          <ItemMedia>
            <Icon icon={DatabaseIcon} />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>
              Customer records
              <span {...stylex.props(layout.mark)}>
                <Icon icon={LockIcon} label="Cannot be removed" />
              </span>
              <ItemDetail>Read only</ItemDetail>
            </ItemTitle>
          </ItemContent>
        </Item>
        {tools.map((tool) => (
          <Item key={tool.id} size="xs">
            <ItemMedia>
              <Icon icon={tool.icon} />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{tool.name}</ItemTitle>
            </ItemContent>
            <ItemActions showOnHover>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Remove ${tool.name}`}
                onClick={() => {
                  setTools((was) => was.filter((had) => had.id !== tool.id));
                }}
              >
                <Icon icon={TrashIcon} />
              </Button>
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
      {next && <ItemSeparator />}
      {next && (
        <Item
          size="xs"
          onClick={() => {
            setTools((was) => [...was, next]);
          }}
        >
          <ItemMedia>
            <Icon icon={PlusIcon} />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{`Add ${next.name.toLowerCase()}`}</ItemTitle>
          </ItemContent>
        </Item>
      )}
    </SidePanelSection>
  );
}
