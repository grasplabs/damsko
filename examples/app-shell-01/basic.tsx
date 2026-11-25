"use client";

import { AppShell } from "@grasp-os/ui/blocks/app-shell-01/app-shell-01";
import { Avatar, AvatarImage } from "@grasp-os/ui/components/avatar";
import {
  BreadcrumbItem,
  BreadcrumbLink,
} from "@grasp-os/ui/components/breadcrumb";
import { Button } from "@grasp-os/ui/components/button";
import { PageHeader } from "@grasp-os/ui/components/page-header";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
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
  space,
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
  // The product's mark at the head, where the rows' icons start: its file as a mask, in the words'
  // colour, so it follows the theme; in forced colours in the system's ink.
  head: { display: "flex", paddingInlineStart: space["2"] },
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

// The sidebar down the start (the product's mark at its head, the person at its foot), the page
// beside it as a card, and across the card's top the header:
// the sidebar's trigger, where the page is (its name renames in place) and its actions. The page
// scrolls under the header. On a phone the trigger opens the sidebar as a sheet.
export default function AppShellBasic() {
  const [name, setName] = useState("Spring launch");
  return (
    <div {...stylex.props(layout.frame)}>
      <AppShell
        style={layout.shell}
        sidebar={
          <>
            <SidebarHeader>
              <div {...stylex.props(layout.head)}>
                <span aria-hidden="true" {...stylex.props(layout.mark)} />
              </div>
            </SidebarHeader>
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
        breadcrumb={
          <BreadcrumbItem>
            <BreadcrumbLink href="#projects">Projects</BreadcrumbLink>
          </BreadcrumbItem>
        }
        title={name}
        onRename={setName}
        actions={
          <Button variant="outline" size="sm">
            Share
          </Button>
        }
      >
        <PageHeader
          title={name}
          description="Everything the team ships in March, and who owns each part."
        />
      </AppShell>
    </div>
  );
}
