"use client";

import {
  CollapsibleContent,
  CollapsibleTrigger,
} from "@grasp-os/ui/components-tw/collapsible";
import {
  Sidebar,
  SidebarCollapsible,
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
  sidebarStateScript,
  useSidebar,
} from "@grasp-os/ui/components-tw/sidebar";
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
} from "@grasp-os/ui/lib-tw/icons";
import type { IconData } from "@grasp-os/ui/lib-tw/icons";
import { useState } from "react";

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
    <div className="flex p-2">
      <SidebarTrigger />
    </div>
  );
};

// Settings takes the sidebar: its row, or the person at the foot, shows the Settings level in the
// main one's place (the way back, its name, its own groups), and Back shows the main one again as
// it was left. The header and the foot stay. Here the level is kept in state; in a product the
// router says which one is shown. A level's group that folds is kept by its `name` as any other.
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
    <div className="flex h-[320px] w-full max-w-[640px] overflow-hidden">
      <script
        // oxlint-disable-next-line react/no-danger -- the script is the library's own, from a constant key
        dangerouslySetInnerHTML={{
          __html: sidebarStateScript("examples-sidebar-levels"),
        }}
      />
      <SidebarProvider
        className="h-full min-h-0"
        storageKey="examples-sidebar-levels"
      >
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
                <SidebarCollapsible name="settings-account">
                  <SidebarGroup>
                    <CollapsibleTrigger asChild>
                      <SidebarGroupLabel asChild>
                        <button type="button">
                          Your account
                          <span
                            aria-hidden="true"
                            className="ms-auto inline-flex"
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
                </SidebarCollapsible>
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
