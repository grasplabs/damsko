"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@grasp-os/ui/components-tw/sidebar";
import { Avatar, AvatarImage } from "@grasp-os/ui/components/avatar";
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@grasp-os/ui/components/command";
import type { CommandItems } from "@grasp-os/ui/components/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@grasp-os/ui/components/dropdown-menu";
import {
  BrainIcon,
  ChevronsUpDownIcon,
  FolderKanbanIcon,
  Icon,
  InboxIcon,
  LayoutDashboardIcon,
  LinkIcon,
  LogOutIcon,
  MessageSquareIcon,
  MonitorIcon,
  RepeatIcon,
  SearchIcon,
  SettingsIcon,
  UserSparklesIcon,
} from "@grasp-os/ui/lib-tw/icons";
import { useState } from "react";

const places = [
  { name: "Chat", icon: MessageSquareIcon },
  { name: "Dashboard", icon: InboxIcon, count: 3 },
  { name: "Brain", icon: BrainIcon },
  { name: "Projects", icon: FolderKanbanIcon },
  { name: "Apps", icon: LayoutDashboardIcon },
  { name: "Workflows", icon: RepeatIcon, count: 2 },
  { name: "Agents", icon: UserSparklesIcon },
  { name: "Integrations", icon: LinkIcon },
];

const found: CommandItems = [
  {
    type: "group",
    label: "Go to",
    items: places.map((place) => ({
      value: place.name.toLowerCase(),
      label: place.name,
    })),
  },
];

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

// The product's mark, a search and the fold at the top; its places, with a count where something
// waits; the pages of one of its apps under a label; and the person at the foot with their menu.
// The fold, or Cmd+B (Ctrl+B elsewhere), folds it away whole.
export default function SidebarBasic() {
  const [searching, setSearching] = useState(false);
  return (
    <div className="flex h-[640px] w-full max-w-[640px] overflow-hidden">
      <SidebarProvider className="h-full min-h-0">
        <Sidebar>
          <SidebarHeader>
            <div className="pe-sidebar-head-end flex items-center justify-between ps-2">
              <span
                aria-hidden="true"
                className="size-app-shell-mark forced-colors:bg-canvas-text block bg-current [mask-image:url(/media/sample-workspace-logo.svg)] mask-contain mask-center mask-no-repeat forced-color-adjust-none"
              />
              <div className="flex items-center">
                <SidebarMenuButton
                  size="icon"
                  aria-label="Search"
                  onClick={() => {
                    setSearching(true);
                  }}
                >
                  <Icon icon={SearchIcon} />
                </SidebarMenuButton>
                <SidebarTrigger />
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                {places.map((place) => (
                  <SidebarMenuItem key={place.name}>
                    <SidebarMenuButton asChild isActive={place.name === "Chat"}>
                      <a href={`#${place.name.toLowerCase()}`}>
                        <Icon icon={place.icon} />
                        {place.name}
                      </a>
                    </SidebarMenuButton>
                    {place.count !== undefined && (
                      <SidebarMenuBadge>{place.count}</SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>From your Apps</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#expenses">
                      <Icon icon={MonitorIcon} />
                      Expenses
                    </a>
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#expenses-claims">
                        Claims
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#expenses-approvals">
                        Approvals
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarSeparator />
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton size="lg">
                      <Avatar size="sm" name="Anna de Vries" decorative>
                        <AvatarImage src="/people/avatar-1.svg" />
                      </Avatar>
                      <span className="flex min-w-0 grow flex-col">
                        <span className="leading-sidebar-name overflow-hidden text-ellipsis">
                          Anna de Vries
                        </span>
                        <span className="text-sidebar-secondary-foreground leading-sidebar-note tracking-ui overflow-hidden text-(length:--damsko-text-xs) font-normal text-ellipsis">
                          Northwind Finance
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        className="text-sidebar-tertiary-foreground inline-flex shrink-0"
                      >
                        <Icon icon={ChevronsUpDownIcon} />
                      </span>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="top" align="start">
                    <DropdownMenuItem>
                      <Icon icon={SettingsIcon} />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Icon icon={LogOutIcon} />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <Reopen />
        </SidebarInset>
      </SidebarProvider>
      <CommandDialog
        aria-label="Search"
        trigger={null}
        shortcut={null}
        open={searching}
        onOpenChange={setSearching}
        items={found}
      >
        <CommandInput />
        <CommandEmpty />
        <CommandList />
      </CommandDialog>
    </div>
  );
}
