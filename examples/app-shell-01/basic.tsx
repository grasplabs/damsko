"use client";

import { AppShell } from "@grasp-os/ui/blocks/app-shell-01/app-shell-01";
import {
  BreadcrumbItem,
  BreadcrumbLink,
} from "@grasp-os/ui/components/breadcrumb";
import { Button } from "@grasp-os/ui/components/button";
import { PageHeader } from "@grasp-os/ui/components/page-header";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@grasp-os/ui/components/sidebar";
import {
  FolderKanbanIcon,
  Icon,
  InboxIcon,
  LayoutDashboardIcon,
  MessageSquareIcon,
} from "@grasp-os/ui/lib/icons";
import { colors, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  frame: {
    width: "100%",
    height: 560,
    overflow: "hidden",
    borderRadius: space["3"],
    boxShadow: `0 0 0 ${size.hairline} ${colors.border}`,
  },
  shell: { height: "100%", minHeight: 0 },
});

const places = [
  { name: "Inbox", icon: InboxIcon },
  { name: "Dashboard", icon: LayoutDashboardIcon },
  { name: "Messages", icon: MessageSquareIcon },
  { name: "Projects", icon: FolderKanbanIcon },
];

// The sidebar down the start, the page beside it as a card, and across the card's top the header:
// the sidebar's trigger, where the page is (its name renames in place) and its actions. The page
// scrolls under the header. On a phone the trigger opens the sidebar as a sheet.
export default function AppShellBasic() {
  const [name, setName] = useState("Spring launch");
  return (
    <div {...stylex.props(layout.frame)}>
      <AppShell
        style={layout.shell}
        sidebar={
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {places.map((place) => (
                    <SidebarMenuItem key={place.name}>
                      <SidebarMenuButton
                        asChild
                        isActive={place.name === "Projects"}
                      >
                        <a href={`#${place.name.toLowerCase()}`}>
                          <Icon icon={place.icon} />
                          {place.name}
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        }
        breadcrumb={
          <BreadcrumbItem>
            <BreadcrumbLink href="#projects">Projects</BreadcrumbLink>
          </BreadcrumbItem>
        }
        title={name}
        onRename={setName}
        actions={<Button size="sm">Share</Button>}
      >
        <PageHeader
          title={name}
          description="Everything the team ships in March, and who owns each part."
        />
      </AppShell>
    </div>
  );
}
