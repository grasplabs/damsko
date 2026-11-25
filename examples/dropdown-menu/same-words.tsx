"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuMore,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@grasp-os/ui/components/dropdown-menu";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  row: {
    display: "flex",
    alignItems: "center",
    gap: space[2],
    "--tap-room-inline": `calc(${space[2]} / 2)`,
  },
});

// Two items with the same words, each its own: a group's label tells them apart, and each turns
// over alone. A More menu may list the same words twice as well (a report opened here or in a new
// tab).
export default function DropdownMenuSameWords() {
  const [sidebar, setSidebar] = useState(true);
  const [inspector, setInspector] = useState(false);
  return (
    <div {...stylex.props(layout.row)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Panels</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Sidebar</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={sidebar}
              onCheckedChange={setSidebar}
            >
              Pinned
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>Inspector</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={inspector}
              onCheckedChange={setInspector}
            >
              Pinned
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenuMore
        aria-label="Report actions"
        items={[
          { label: "Open", href: "#report" },
          { label: "Open", href: "#report-new" },
          { label: "Rename" },
        ]}
      />
    </div>
  );
}
