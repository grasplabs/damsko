"use client";

import { Avatar, AvatarImage } from "@grasp-os/ui/components/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@grasp-os/ui/components/collapsible";
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
  SidebarGroupContent,
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
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@grasp-os/ui/components/sidebar";
import {
  BellIcon,
  BrainIcon,
  BuildingIcon,
  ChartColumnIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronsUpDownIcon,
  CircleUserIcon,
  CoinsIcon,
  FolderKanbanIcon,
  Icon,
  InboxIcon,
  KeyIcon,
  LayoutDashboardIcon,
  LinkIcon,
  ListChecksIcon,
  ListIcon,
  LockIcon,
  LogOutIcon,
  MessageSquareIcon,
  MonitorIcon,
  RepeatIcon,
  SettingsIcon,
  SlidersHorizontalIcon,
  SunIcon,
  UsersIcon,
} from "@grasp-os/ui/lib/icons";
import type { IconData } from "@grasp-os/ui/lib/icons";
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
  // The head: the mark where the rows' icons start, the fold's icon where the rows' words end.
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
  chevron: { display: "inline-flex", marginInlineStart: "auto" },
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
    color: colors.sidebarTextSecondary,
    fontSize: font.textXs,
    lineHeight: font.sidebarNoteLine,
    fontWeight: font.weightNormal,
    letterSpacing: "normal",
  },
  chevrons: {
    display: "inline-flex",
    flexShrink: 0,
    color: colors.sidebarTextTertiary,
  },
  bar: { display: "flex", padding: space["2"] },
});

interface Place {
  name: string;
  icon: IconData;
}

const places: Place[] = [
  { name: "Chat", icon: MessageSquareIcon },
  { name: "Dashboard", icon: InboxIcon },
  { name: "Brain", icon: BrainIcon },
  { name: "Projects", icon: FolderKanbanIcon },
  { name: "Apps", icon: LayoutDashboardIcon },
  { name: "Workflows", icon: RepeatIcon },
];

const settings: { label: string; rows: Place[] }[] = [
  {
    label: "Workspace",
    rows: [
      { name: "General", icon: BuildingIcon },
      { name: "Members and roles", icon: UsersIcon },
      { name: "Models", icon: SlidersHorizontalIcon },
      { name: "Spend", icon: ChartColumnIcon },
      { name: "Onboarding", icon: ListChecksIcon },
      { name: "Audit trail", icon: ListIcon },
      { name: "Webhooks", icon: LinkIcon },
      { name: "API keys", icon: KeyIcon },
      { name: "Billing", icon: CoinsIcon },
    ],
  },
  {
    label: "Your account",
    rows: [
      { name: "Profile", icon: CircleUserIcon },
      { name: "Appearance", icon: SunIcon },
      { name: "Notifications", icon: BellIcon },
      { name: "Security", icon: LockIcon },
    ],
  },
];

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

// Settings takes the sidebar: its row, or Settings in the person's menu, shows the Settings level
// in the main one's place (the way back, its name, its own groups), and Back shows the main one
// again as it was left. The header and the person at the foot stay. Here the level is kept in
// state; in a product the router says which one is shown.
export default function SidebarLevelsExample() {
  const [level, setLevel] = useState("main");
  const [page, setPage] = useState("chat");
  const [setting, setSetting] = useState("general");
  return (
    <div {...stylex.props(layout.frame)}>
      <SidebarProvider style={layout.provider}>
        <Sidebar>
          <SidebarHeader>
            <div {...stylex.props(layout.head)}>
              <span aria-hidden="true" {...stylex.props(layout.mark)} />
              <SidebarTrigger />
            </div>
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
                  </SidebarMenu>
                </SidebarGroup>
                <SidebarGroup>
                  <SidebarGroupLabel>From your Apps</SidebarGroupLabel>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={page === "expenses"}>
                        <a
                          href="#expenses"
                          onClick={() => {
                            setPage("expenses");
                          }}
                        >
                          <Icon icon={MonitorIcon} />
                          Expenses
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroup>
                <SidebarGroup>
                  <SidebarMenu>
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
                {settings.map((group) => (
                  <Collapsible key={group.label} defaultOpen>
                    <SidebarGroup>
                      <CollapsibleTrigger asChild>
                        <SidebarGroupLabel asChild>
                          <button type="button">
                            {group.label}
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
                        <SidebarGroupContent>
                          <SidebarMenu>
                            {group.rows.map((row) => (
                              <SidebarMenuItem key={row.name}>
                                <SidebarMenuButton
                                  asChild
                                  isActive={setting === slug(row.name)}
                                >
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
                            ))}
                          </SidebarMenu>
                        </SidebarGroupContent>
                      </CollapsibleContent>
                    </SidebarGroup>
                  </Collapsible>
                ))}
              </SidebarContent>
            </SidebarLevel>
          </SidebarLevels>
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
                    <DropdownMenuItem
                      onSelect={() => {
                        setLevel("settings");
                      }}
                    >
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
    </div>
  );
}
