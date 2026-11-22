"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@grasp-os/ui/components/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarLevel,
  SidebarLevelHeader,
  SidebarLevels,
  SidebarLevelTitle,
  SidebarLevelTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@grasp-os/ui/components/sidebar";
import {
  BuildingIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  CircleUserIcon,
  CoinsIcon,
  FolderKanbanIcon,
  Icon,
  MessageSquareIcon,
  SettingsIcon,
  UsersIcon,
} from "@grasp-os/ui/lib/icons";
import type { IconData } from "@grasp-os/ui/lib/icons";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  frame: {
    display: "flex",
    width: "100%",
    maxWidth: 640,
    height: 320,
    overflow: "hidden",
  },
  provider: { minHeight: 0, height: "100%" },
  chevron: { display: "inline-flex", marginInlineStart: "auto" },
  bar: { display: "flex", padding: space["2"] },
});

interface Place {
  name: string;
  icon: IconData;
}

const places: Place[] = [
  { name: "Chat", icon: MessageSquareIcon },
  { name: "Projects", icon: FolderKanbanIcon },
];

const workspace: Place[] = [
  { name: "General", icon: BuildingIcon },
  { name: "Members and roles", icon: UsersIcon },
  { name: "Billing", icon: CoinsIcon },
];

const account: Place[] = [{ name: "Profile", icon: CircleUserIcon }];

const slug = (name: string) => name.toLowerCase().replaceAll(" ", "-");

/** The way back while the sidebar is away: folded, or in its sheet on a narrow window. */
const Reopen = () => {
  const { state, isMobile } = useSidebar();
  if (!isMobile && state === "expanded") {
    return null;
  }
  return (
    <div {...stylex.props(layout.bar)}>
      <SidebarTrigger />
    </div>
  );
};

// Settings takes the sidebar: its row, or the person at the foot, shows the Settings level in the
// main one's place (the way back, its name, its own groups), and Back shows the main one again as
// it was left. The header and the foot stay. Here the level is kept in state; in a product the
// router says which one is shown.
export default function SidebarLevelsExample() {
  const [level, setLevel] = useState("main");
  const [page, setPage] = useState("chat");
  const [setting, setSetting] = useState("general");
  const settingRow = (row: Place) => (
    <SidebarMenuItem key={row.name}>
      <SidebarMenuButton asChild isActive={setting === slug(row.name)}>
        <a
          href={`#settings/${slug(row.name)}`}
          onClick={() => {
            setSetting(slug(row.name));
          }}
        >
          <Icon icon={row.icon} />
          {row.name}
        </a>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
  return (
    <div {...stylex.props(layout.frame)}>
      <SidebarProvider style={layout.provider}>
        <Sidebar>
          <SidebarHeader>
            <SidebarTrigger />
          </SidebarHeader>
          <SidebarLevels value={level} onValueChange={setLevel}>
            <SidebarLevel value="main">
              <SidebarContent>
                <SidebarGroup>
                  <SidebarMenu>
                    {places.map((place) => (
                      <SidebarMenuItem key={place.name}>
                        <SidebarMenuButton
                          asChild
                          isActive={page === slug(place.name)}
                        >
                          <a
                            href={`#${slug(place.name)}`}
                            onClick={() => {
                              setPage(slug(place.name));
                            }}
                          >
                            <Icon icon={place.icon} />
                            {place.name}
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                    <SidebarMenuItem>
                      <SidebarLevelTrigger value="settings" asChild>
                        <a href={`#settings/${setting}`}>
                          <Icon icon={SettingsIcon} />
                          Settings
                        </a>
                      </SidebarLevelTrigger>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroup>
              </SidebarContent>
            </SidebarLevel>
            <SidebarLevel value="settings">
              <SidebarLevelHeader>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarLevelTrigger value="main" asChild>
                      <a href={`#${page}`}>
                        <Icon icon={ChevronLeftIcon} />
                        Back
                      </a>
                    </SidebarLevelTrigger>
                  </SidebarMenuItem>
                </SidebarMenu>
                <SidebarLevelTitle>
                  <Icon icon={SettingsIcon} />
                  Settings
                </SidebarLevelTitle>
              </SidebarLevelHeader>
              <SidebarContent aria-label="Settings">
                <SidebarGroup>
                  <SidebarGroupLabel>Workspace</SidebarGroupLabel>
                  <SidebarMenu>{workspace.map(settingRow)}</SidebarMenu>
                </SidebarGroup>
                <Collapsible defaultOpen>
                  <SidebarGroup>
                    <CollapsibleTrigger asChild>
                      <SidebarGroupLabel asChild>
                        <button type="button">
                          Your account
                          <span
                            aria-hidden="true"
                            {...stylex.props(layout.chevron)}
                          >
                            <Icon icon={ChevronDownIcon} />
                          </span>
                        </button>
                      </SidebarGroupLabel>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenu>{account.map(settingRow)}</SidebarMenu>
                    </CollapsibleContent>
                  </SidebarGroup>
                </Collapsible>
              </SidebarContent>
            </SidebarLevel>
          </SidebarLevels>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => {
                    setLevel("settings");
                  }}
                >
                  <Icon icon={CircleUserIcon} />
                  Anna de Vries
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <Reopen />
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
