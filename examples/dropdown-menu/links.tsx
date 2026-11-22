"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@grasp-os/ui/components/dropdown-menu";
import { LayoutDashboardIcon } from "@grasp-os/ui/lib/icons";
import { useState } from "react";
import type { AnchorHTMLAttributes } from "react";

/** A stand-in for a router's link: it moves without loading the page, telling the page where. */
const RouterLink = ({
  to,
  onGo,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string;
  onGo: (to: string) => void;
}) => (
  <a
    {...rest}
    href={`#${to}`}
    onClick={(event) => {
      rest.onClick?.(event);
      event.preventDefault();
      onGo(to);
    }}
  />
);

// A menu of Apps that open as links: each item a router's link, and one an <a href>. A press,
// Enter, a middle click or a new tab opens them.
export default function DropdownMenuLinks() {
  const [open, setOpen] = useState("");
  return (
    <div data-open={open}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Apps</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild icon={LayoutDashboardIcon}>
            <RouterLink to="spend" onGo={setOpen}>
              Spend tracker
            </RouterLink>
          </DropdownMenuItem>
          <DropdownMenuItem asChild icon={LayoutDashboardIcon}>
            <RouterLink to="hiring" onGo={setOpen}>
              Hiring board
            </RouterLink>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a href="#all-apps">All apps</a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
