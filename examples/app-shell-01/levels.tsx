"use client";

import {
  AppShell,
  AppShellHeader,
  AppShellPage,
} from "@grasp-os/ui/blocks/app-shell-01/app-shell-01";
import { PageHeader } from "@grasp-os/ui/components/page-header";
import {
  SidebarContent,
  SidebarGroup,
  SidebarLevel,
  SidebarLevelHeader,
  SidebarLevels,
  SidebarLevelTitle,
  SidebarLevelTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@grasp-os/ui/components/sidebar";
import {
  BellIcon,
  BuildingIcon,
  CoinsIcon,
  FolderKanbanIcon,
  Icon,
  InboxIcon,
  LayoutDashboardIcon,
  MessageSquareIcon,
  SettingsIcon,
  UsersIcon,
} from "@grasp-os/ui/lib/icons";
import type { IconData } from "@grasp-os/ui/lib/icons";
import { colors, radius, size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  // The app's window: the card's corner plus the room round it, so the two corners nest.
  frame: {
    width: "100%",
    height: 560,
    overflow: "hidden",
    borderRadius: `calc(${radius.md} + ${size.sidebarCardGap})`,
    cornerShape: radius.shape,
    boxShadow: `0 0 0 ${size.hairline} ${colors.border}`,
  },
  shell: { height: "100%", minHeight: 0 },
});

interface Place {
  name: string;
  icon: IconData;
  /** Its address: a page of Settings starts with `settings/`. */
  path: string;
}

const places: Place[] = [
  { name: "Inbox", icon: InboxIcon, path: "inbox" },
  { name: "Dashboard", icon: LayoutDashboardIcon, path: "dashboard" },
  { name: "Messages", icon: MessageSquareIcon, path: "messages" },
  { name: "Projects", icon: FolderKanbanIcon, path: "projects" },
];

const settings: Place[] = [
  { name: "General", icon: BuildingIcon, path: "settings/general" },
  { name: "Members", icon: UsersIcon, path: "settings/members" },
  { name: "Billing", icon: CoinsIcon, path: "settings/billing" },
  { name: "Notifications", icon: BellIcon, path: "settings/notifications" },
];

// The address says which level the sidebar shows, as a router's does: under `settings/` it is
// Settings' own list, with the way back to the page left; anywhere else, the main one. Every row is
// a plain link. The address is kept in state here.
export default function AppShellLevels() {
  const [path, setPath] = useState("projects");
  const [last, setLast] = useState("projects");
  const inSettings = path.startsWith("settings/");
  const go = (next: string) => {
    if (!next.startsWith("settings/")) {
      setLast(next);
    }
    setPath(next);
  };
  const row = (place: Place) => (
    <SidebarMenuItem key={place.path}>
      <SidebarMenuButton asChild isActive={path === place.path}>
        <a
          href={`#${place.path}`}
          onClick={() => {
            go(place.path);
          }}
        >
          <Icon icon={place.icon} />
          {place.name}
        </a>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
  const page = [...places, ...settings].find((place) => place.path === path);
  return (
    <div {...stylex.props(layout.frame)}>
      <AppShell
        style={layout.shell}
        sidebar={
          <SidebarLevels value={inSettings ? "settings" : "main"}>
            <SidebarLevel value="main">
              <SidebarContent>
                <SidebarGroup>
                  <SidebarMenu>{places.map(row)}</SidebarMenu>
                </SidebarGroup>
                <SidebarGroup>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <a
                          href="#settings/general"
                          onClick={() => {
                            go("settings/general");
                          }}
                        >
                          <Icon icon={SettingsIcon} />
                          Settings
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroup>
              </SidebarContent>
            </SidebarLevel>
            <SidebarLevel value="settings">
              <SidebarLevelHeader>
                <SidebarLevelTrigger value="main" asChild aria-label="Back">
                  <a
                    href={`#${last}`}
                    onClick={() => {
                      go(last);
                    }}
                  />
                </SidebarLevelTrigger>
                <SidebarLevelTitle
                  asChild
                  isActive={path === "settings/general"}
                >
                  <a
                    href="#settings/general"
                    onClick={() => {
                      go("settings/general");
                    }}
                  >
                    <Icon icon={SettingsIcon} />
                    Settings
                  </a>
                </SidebarLevelTitle>
              </SidebarLevelHeader>
              <SidebarContent aria-label="Settings">
                <SidebarGroup>
                  <SidebarMenu>{settings.map(row)}</SidebarMenu>
                </SidebarGroup>
              </SidebarContent>
            </SidebarLevel>
          </SidebarLevels>
        }
      >
        <AppShellHeader
          breadcrumb={
            inSettings
              ? [{ label: "Settings", href: "#settings/general" }]
              : undefined
          }
          title={page?.name}
        />
        <AppShellPage>
          <PageHeader title={page?.name ?? ""} />
        </AppShellPage>
      </AppShell>
    </div>
  );
}
