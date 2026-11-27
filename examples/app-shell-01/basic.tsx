"use client";

import {
  AppShell,
  AppShellHeader,
  AppShellPage,
} from "@grasp-os/ui/blocks/app-shell-01/app-shell-01";
import { Avatar, AvatarImage } from "@grasp-os/ui/components/avatar";
import { Button } from "@grasp-os/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@grasp-os/ui/components/command";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@grasp-os/ui/components/dialog";
import { PageHeader } from "@grasp-os/ui/components/page-header";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  sidebarStateScript,
} from "@grasp-os/ui/components/sidebar";
import {
  BrainIcon,
  FolderKanbanIcon,
  Icon,
  InboxIcon,
  LayoutDashboardIcon,
  LinkIcon,
  MessageSquareIcon,
  RepeatIcon,
  UserSparklesIcon,
} from "@grasp-os/ui/lib/icons";
import type { IconData } from "@grasp-os/ui/lib/icons";
import {
  colors,
  font,
  media,
  radius,
  size,
} from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  // The app's window: the card's corner plus the room round it, so the two corners nest.
  frame: {
    width: 960,
    maxWidth: "100%",
    height: 560,
    overflow: "hidden",
    borderRadius: `calc(${radius.md} + ${size.sidebarCardGap})`,
    cornerShape: radius.shape,
    boxShadow: `0 0 0 ${size.hairline} ${colors.border}`,
  },
  shell: { height: "100%", minHeight: 0 },
  // The product's mark: its file as a mask, in the words' colour, so it follows the theme; in
  // forced colours in the system's ink.
  home: { display: "flex", color: "inherit" },
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
  // The person at the foot: their name over their organisation.
  person: { display: "flex", flexDirection: "column", minWidth: 0 },
  organisation: {
    color: colors.sidebarSecondaryForeground,
    fontSize: font.textXs,
    lineHeight: font.sidebarNoteLine,
    fontWeight: font.weightNormal,
  },
});

const places: { name: string; icon: IconData; count?: number }[] = [
  { name: "Chat", icon: MessageSquareIcon },
  { name: "Dashboard", icon: InboxIcon, count: 3 },
  { name: "Brain", icon: BrainIcon },
  { name: "Projects", icon: FolderKanbanIcon },
  { name: "Apps", icon: LayoutDashboardIcon },
  { name: "Workflows", icon: RepeatIcon },
  { name: "Agents", icon: UserSparklesIcon },
  { name: "Integrations", icon: LinkIcon },
];

// The sidebar down the start, its head the shell's: the product's mark, the search (Cmd+J or
// Ctrl+J too, which close it again; Cmd+K by default, which this site keeps for its own search) and
// the fold. The page beside it as a card draws its own bar: where the page is (its
// name renames in a popup under it) and its actions; the fold stands in the bar only while the sidebar is
// away, and the fold is kept for the next visit. The page scrolls under its bar. On a phone the
// bar's fold opens the sidebar as a sheet, and the bar says the page and the step before it.
export default function AppShellBasic() {
  const [name, setName] = useState("Spring launch");
  const [searching, setSearching] = useState(false);
  return (
    <div {...stylex.props(layout.frame)}>
      <script
        // oxlint-disable-next-line react/no-danger -- the script is the library's own, from a constant key
        dangerouslySetInnerHTML={{
          __html: sidebarStateScript("app-shell-01-basic"),
        }}
      />
      <AppShell
        style={layout.shell}
        storageKey="app-shell-01-basic"
        mark={
          <a href="#home" aria-label="Home" {...stylex.props(layout.home)}>
            <span aria-hidden="true" {...stylex.props(layout.mark)} />
          </a>
        }
        searchOpen={searching}
        onSearchOpenChange={setSearching}
        // This site keeps Cmd+K for its own search: here Cmd+J or Ctrl+J opens the search, and
        // closes it again.
        searchShortcut="mod+j"
        sidebar={
          <>
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
                        {place.count !== undefined && (
                          <SidebarMenuBadge>{place.count}</SidebarMenuBadge>
                        )}
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarSeparator />
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size="lg">
                    <Avatar size="sm" name="Anna de Vries" decorative>
                      <AvatarImage src="/people/avatar-1.svg" />
                    </Avatar>
                    <span {...stylex.props(layout.person)}>
                      Anna de Vries
                      <span {...stylex.props(layout.organisation)}>
                        Northwind Finance
                      </span>
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </>
        }
      >
        <AppShellHeader
          breadcrumb={[{ label: "Projects", href: "#projects" }]}
          title={name}
          onRename={setName}
          actions={
            <Button variant="outline" size="sm">
              Share
            </Button>
          }
        />
        <AppShellPage>
          <PageHeader
            title={name}
            description="Everything the team ships in March, and who owns each part."
          />
        </AppShellPage>
      </AppShell>
      <Dialog open={searching} onOpenChange={setSearching}>
        <DialogContent>
          <DialogTitle>Search</DialogTitle>
          <Command
            items={places.map((place) => ({
              value: place.name.toLowerCase(),
              label: place.name,
              icon: place.icon,
            }))}
            onAction={(value) => {
              setSearching(false);
              window.location.hash = value;
            }}
          >
            <CommandInput placeholder="Find a place" />
            <CommandEmpty>Nothing by that name.</CommandEmpty>
            <CommandList />
          </Command>
        </DialogContent>
      </Dialog>
    </div>
  );
}
