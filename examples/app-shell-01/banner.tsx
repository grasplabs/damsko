"use client";

import {
  AppShell,
  AppShellHeader,
  AppShellPage,
} from "@grasp-os/ui/blocks/app-shell-01/app-shell-01";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@grasp-os/ui/components/alert";
import { PageHeader } from "@grasp-os/ui/components/page-header";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@grasp-os/ui/components/sidebar";
import { Icon, InboxIcon, LayoutDashboardIcon } from "@grasp-os/ui/lib/icons";
import { colors, radius, size } from "@grasp-os/ui/lib/tokens.stylex";
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
});

const places = [
  { name: "Inbox", icon: InboxIcon },
  { name: "Dashboard", icon: LayoutDashboardIcon },
];

// A notice for the whole product, on every page: `banner` puts it above the page and its bar,
// across the card. Closed, the bar takes its place.
export default function AppShellBanner() {
  const [shown, setShown] = useState(true);
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
                        isActive={place.name === "Dashboard"}
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
        banner={
          shown && (
            <Alert
              appearance="banner"
              variant="warning"
              onClose={() => {
                setShown(false);
              }}
            >
              <AlertTitle>Scheduled maintenance</AlertTitle>
              <AlertDescription>
                Reports are read-only on Sunday from 02:00 to 04:00.
              </AlertDescription>
            </Alert>
          )
        }
      >
        <AppShellHeader title="Dashboard" />
        <AppShellPage>
          <PageHeader
            title="Dashboard"
            description="This week's numbers, and what changed since Monday."
          />
        </AppShellPage>
      </AppShell>
    </div>
  );
}
