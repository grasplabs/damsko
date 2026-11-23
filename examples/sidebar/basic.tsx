"use client";

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
} from "@grasp-os/ui/components/sidebar";
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
} from "@grasp-os/ui/lib/icons";
import {
  colors,
  font,
  media,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  frame: {
    display: "flex",
    width: "100%",
    maxWidth: 640,
    height: 640,
    overflow: "hidden",
  },
  provider: { minHeight: 0, height: "100%" },
  // The head: the mark where the rows' icons start, the buttons' icons where the rows' words end.
  head: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingInlineStart: space["2"],
    paddingInlineEnd: `calc(${size.sidebarRowInline} - (${size.sidebarIconButton} - ${size.sidebarIcon}) / 2)`,
  },
  // The product's mark in the words' colour: its file as a mask, so it follows the theme. In forced
  // colours a ground is dropped, the mark with it: there it keeps its fill, in the system's ink.
  mark: {
    display: "block",
    width: size.appShellMark,
    height: size.appShellMark,
    backgroundColor: {
      default: "currentColor",
      [media.forcedColors]: "CanvasText",
    },
    forcedColorAdjust: "none",
    maskImage: 'url("/media/sample-workspace-logo.svg")',
    maskRepeat: "no-repeat",
    maskPosition: "center",
    maskSize: "contain",
  },
  tools: { display: "flex", alignItems: "center" },
  // The person at the foot: their name over their organisation, and the chevrons that say a menu.
  person: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  name: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    lineHeight: font.sidebarNameLine,
  },
  organisation: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: colors.sidebarSecondaryForeground,
    fontSize: font.textXs,
    lineHeight: font.sidebarNoteLine,
    fontWeight: font.weightNormal,
    letterSpacing: "normal",
  },
  chevrons: {
    display: "inline-flex",
    flexShrink: 0,
    color: colors.sidebarTertiaryForeground,
  },
  bar: { display: "flex", padding: space["2"] },
});

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
    <div {...stylex.props(layout.bar)}>
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
    <div {...stylex.props(layout.frame)}>
      <SidebarProvider style={layout.provider}>
        <Sidebar>
          <SidebarHeader>
            <div {...stylex.props(layout.head)}>
              <span aria-hidden="true" {...stylex.props(layout.mark)} />
              <div {...stylex.props(layout.tools)}>
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
                      <span {...stylex.props(layout.person)}>
                        <span {...stylex.props(layout.name)}>
                          Anna de Vries
                        </span>
                        <span {...stylex.props(layout.organisation)}>
                          Northwind Finance
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        {...stylex.props(layout.chevrons)}
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
