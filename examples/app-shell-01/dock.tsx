"use client";

import {
  AppShellCard,
  AppShellContent,
  AppShellHeader,
  AppShellSidebar,
} from "@grasp-os/ui/blocks/app-shell-01/app-shell-01";
import { appShellVars } from "@grasp-os/ui/blocks/app-shell-01/app-shell-01.stylex";
import { Button } from "@grasp-os/ui/components/button";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@grasp-os/ui/components/sidebar";
import {
  Icon,
  LayoutDashboardIcon,
  MessageSquareIcon,
} from "@grasp-os/ui/lib/icons";
import {
  colors,
  font,
  radius,
  shadow,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

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
  // The page keeps room under its end for the dock: the dock's height and its inset from the
  // card's foot, twice, so the last row scrolls clear of it with a gap.
  page: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minHeight: 0,
    [appShellVars.contentRoomBelow]: `calc(${size.controlSm} + ${space["2"]} * 2 + ${space["4"]} * 2)`,
  },
  // The dock over the card's foot, in its middle.
  dock: {
    position: "absolute",
    insetBlockEnd: space["4"],
    insetInlineStart: "50%",
    transform: "translateX(-50%)",
    zIndex: 20,
    display: "flex",
    gap: space["2"],
    padding: space["2"],
    borderRadius: radius.lg,
    cornerShape: radius.shape,
    backgroundColor: colors.card,
    boxShadow: shadow.md,
    "--tap-room-inline": `calc(${space["2"]} / 2)`,
  },
  // A page that fills the card: rows edge to edge, as a workspace's list.
  rows: {
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  row: {
    paddingBlock: space["3"],
    paddingInline: size.appShellPageInline,
    borderBlockEndWidth: size.hairline,
    borderBlockEndStyle: "solid",
    borderBlockEndColor: colors.border,
    color: colors.foreground,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
  },
});

const entries = Array.from(
  { length: 24 },
  (_, at) => `Entry ${String(at + 1)}`
);

// A page that fills the card (a list edge to edge, no AppShellPage) under a dock the product lays
// over the card's foot: `appShellVars.contentRoomBelow`, set round the page, keeps that much room
// under its end, so the last row scrolls clear of the dock.
export default function AppShellDock() {
  return (
    <div {...stylex.props(layout.frame)}>
      <SidebarProvider style={layout.shell}>
        <AppShellSidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive>
                      <a href="#journal">
                        <Icon icon={LayoutDashboardIcon} />
                        Journal
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </AppShellSidebar>
        <AppShellCard
          overlay={
            <div role="group" aria-label="Dock" {...stylex.props(layout.dock)}>
              <Button size="sm" variant="outline">
                <Icon icon={MessageSquareIcon} />
                Ask
              </Button>
              <Button size="sm">New entry</Button>
            </div>
          }
        >
          <div {...stylex.props(layout.page)}>
            <AppShellContent>
              <AppShellHeader title="Journal" />
              <ul aria-label="Entries" {...stylex.props(layout.rows)}>
                {entries.map((entry) => (
                  <li key={entry} {...stylex.props(layout.row)}>
                    {entry}
                  </li>
                ))}
              </ul>
            </AppShellContent>
          </div>
        </AppShellCard>
      </SidebarProvider>
    </div>
  );
}
