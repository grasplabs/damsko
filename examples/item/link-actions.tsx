"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from "@grasp-os/ui/components/item";
import { CopyIcon, Icon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import type { AnchorHTMLAttributes } from "react";

const layout = stylex.create({
  box: { display: "grid", gap: 12, width: "100%", maxWidth: 480 },
  said: { margin: 0, fontSize: 14 },
});

// A row that is a link, one button or a router's link (`asChild`), and still has actions: its title
// is the press, stretched over the whole row, and its actions stand above it, each its own stop for
// the keyboard, wherever they stand among the parts (here the last row's come in a fragment).
export default function ItemLinkActions() {
  const [said, setSaid] = useState("Nothing yet");
  // A stand-in for a router's link: it moves without loading the page.
  const RouterLink = ({
    to,
    ...rest
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) => (
    <a
      {...rest}
      href={`#${to}`}
      onClick={(event) => {
        event.preventDefault();
        setSaid(`Opened ${to}`);
      }}
    />
  );
  const archive = (
    <>
      <ItemContent>
        <ItemTitle>Archive 2025</ItemTitle>
        <ItemDescription>Read only</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setSaid("Restored Archive 2025");
          }}
        >
          Restore
        </Button>
      </ItemActions>
    </>
  );
  return (
    <div {...stylex.props(layout.box)}>
      <ItemGroup aria-label="Reports">
        <Item href="#q3-report">
          <ItemContent>
            <ItemTitle>Q3 report</ItemTitle>
            <ItemDescription>Shared with finance</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Copy the link to Q3 report"
              onClick={() => {
                setSaid("Copied the link to Q3 report");
              }}
            >
              <Icon icon={CopyIcon} />
            </Button>
          </ItemActions>
        </Item>
        <ItemSeparator />
        <Item
          onClick={() => {
            setSaid("Opened Supplier list");
          }}
        >
          <ItemContent>
            <ItemTitle>Supplier list</ItemTitle>
            <ItemDescription>Edited on 4 November</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setSaid("Shared Supplier list");
              }}
            >
              Share
            </Button>
          </ItemActions>
        </Item>
        <ItemSeparator />
        <Item asChild>
          <RouterLink to="budget">
            <ItemContent>
              <ItemTitle>Budget</ItemTitle>
              <ItemDescription>Shared with you</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setSaid("Removed Budget");
                }}
              >
                Remove
              </Button>
            </ItemActions>
          </RouterLink>
        </Item>
        <ItemSeparator />
        <Item href="#archive">{archive}</Item>
      </ItemGroup>
      <p {...stylex.props(layout.said)}>{said}</p>
    </div>
  );
}
