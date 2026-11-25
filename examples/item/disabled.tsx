"use client";

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@grasp-os/ui/components/item";
import { Text } from "@grasp-os/ui/components/text";
import { LockIcon, Icon, PlusIcon, UsersIcon } from "@grasp-os/ui/lib/icons";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import type { AnchorHTMLAttributes } from "react";

const layout = stylex.create({
  box: { display: "grid", gap: space["3"], width: "100%", maxWidth: 420 },
});

// Rows out of use (`disabled`), one of each kind: a button, a link and a router's link drawn as the
// row (here a stand-in that moves without loading the page, calling the row's own press first as a
// router's link does). Each is dimmed as a disabled Button is, takes no press, and is still
// reached by Tab so it can be read; its description says why. The router's link keeps its own
// attributes (here an id and an analytics mark), never its address.
export default function ItemDisabled() {
  const [opened, setOpened] = useState("Nothing opened");
  const RouterLink = ({
    to,
    onClick,
    ...rest
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) => (
    <a
      {...rest}
      href={`#${to}`}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          event.preventDefault();
          setOpened(`Opened ${to}`);
        }
      }}
    />
  );
  return (
    <div {...stylex.props(layout.box)}>
      <ItemGroup aria-label="Form">
        <Item
          variant="outline"
          size="sm"
          disabled
          onClick={() => {
            setOpened("Opened the new field");
          }}
        >
          <ItemMedia>
            <Icon icon={PlusIcon} />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Add a field</ItemTitle>
            <ItemDescription>A form holds 20 fields at most</ItemDescription>
          </ItemContent>
        </Item>
        <Item variant="outline" size="sm" disabled href="#billing">
          <ItemMedia>
            <Icon icon={LockIcon} />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Billing</ItemTitle>
            <ItemDescription>Only an owner can open billing</ItemDescription>
          </ItemContent>
        </Item>
        <Item variant="outline" size="sm" disabled asChild>
          <RouterLink to="members" id="members" data-analytics="members">
            <ItemMedia>
              <Icon icon={UsersIcon} />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Members</ItemTitle>
              <ItemDescription>
                Members are managed by your company
              </ItemDescription>
            </ItemContent>
          </RouterLink>
        </Item>
      </ItemGroup>
      <Text as="p" size="sm" color="muted">
        {opened}
      </Text>
    </div>
  );
}
