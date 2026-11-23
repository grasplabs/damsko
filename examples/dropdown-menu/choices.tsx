"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@grasp-os/ui/components/dropdown-menu";
import { useState } from "react";

// The page holds each choice (`checked`, `value`): a menu's items are taken out when it closes, so a
// choice kept only in the menu would be forgotten by the next opening.
export default function DropdownMenuChoices() {
  const [grid, setGrid] = useState(true);
  const [rulers, setRulers] = useState(false);
  const [sort, setSort] = useState<string | null>("date");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">View</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuCheckboxItem checked={grid} onCheckedChange={setGrid}>
          Show the grid
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={rulers} onCheckedChange={setRulers}>
          Show rulers
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="date">
            Date modified
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="size">Size</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
