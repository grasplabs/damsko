"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@grasp-os/ui/components/item";
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
import { colors, radius, shadow } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { Fragment, useState } from "react";

const layout = stylex.create({
  card: {
    width: "100%",
    maxWidth: 372,
    overflow: "clip",
    borderRadius: radius.base,
    cornerShape: radius.shape,
    backgroundColor: colors.card,
    boxShadow: shadow.md,
  },
});

const more: { id: string; icon: IconData; name: string }[] = [
  { id: "mail", icon: MailIcon, name: "Send email" },
  { id: "files", icon: DatabaseIcon, name: "Shared files" },
];

// A card of tools, one dense row each: the kind's icon, the name, a lock on the one that cannot be
// removed, and a bin that waits for the pointer (`showOnHover`), always there for the keyboard.
// The row that adds one more is an Item that is one button, after the list.
export default function ItemTools() {
  const [tools, setTools] = useState([
    { id: "web", icon: Globe2Icon, name: "Search the web" },
  ]);
  const next = more.find((tool) => !tools.some((had) => had.id === tool.id));
  return (
    <div {...stylex.props(layout.card)}>
      <ItemGroup aria-label="Tools">
        <Item size="xs">
          <ItemMedia>
            <Icon icon={DatabaseIcon} />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Customer records</ItemTitle>
          </ItemContent>
          <ItemActions>
            <Icon icon={LockIcon} label="Cannot be removed" />
          </ItemActions>
        </Item>
        {tools.map((tool) => (
          <Fragment key={tool.id}>
            <ItemSeparator />
            <Item size="xs">
              <ItemMedia>
                <Icon icon={tool.icon} />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{tool.name}</ItemTitle>
              </ItemContent>
              <ItemActions showOnHover>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${tool.name}`}
                  onClick={() => {
                    setTools((was) => was.filter((had) => had.id !== tool.id));
                  }}
                >
                  <Icon icon={TrashIcon} />
                </Button>
              </ItemActions>
            </Item>
          </Fragment>
        ))}
      </ItemGroup>
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
    </div>
  );
}
