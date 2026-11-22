"use client";

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from "@grasp-os/ui/components/item";
import * as stylex from "@stylexjs/stylex";
import { Fragment, useState } from "react";
import type { AnchorHTMLAttributes } from "react";

const layout = stylex.create({
  list: { width: "100%", maxWidth: 360 },
});

const chats = [
  { id: "c1", title: "Quarterly summary", when: "Today" },
  { id: "c2", title: "Supplier list for the spring", when: "Yesterday" },
  { id: "c3", title: "Office move plan", when: "Monday" },
];

// A list beside its detail: each row a router's link drawn as the row (`asChild`) (here a stand-in that moves without loading the
// page), the open one `active`: the selected fill, and said as the current page.
export default function ItemRouter() {
  const [open, setOpen] = useState("c2");
  const RouterLink = ({
    to,
    ...rest
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) => (
    <a
      {...rest}
      href={`#${to}`}
      onClick={(event) => {
        event.preventDefault();
        setOpen(to);
      }}
    />
  );
  return (
    <div {...stylex.props(layout.list)}>
      <ItemGroup aria-label="Chats">
        {chats.map((chat, index) => (
          <Fragment key={chat.id}>
            {index > 0 && <ItemSeparator />}
            <Item size="sm" asChild active={chat.id === open}>
              <RouterLink to={chat.id}>
                <ItemContent>
                  <ItemTitle>{chat.title}</ItemTitle>
                  <ItemDescription>{chat.when}</ItemDescription>
                </ItemContent>
              </RouterLink>
            </Item>
          </Fragment>
        ))}
      </ItemGroup>
    </div>
  );
}
