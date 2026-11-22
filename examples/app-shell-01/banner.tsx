"use client";

import { AppShell } from "@grasp-os/ui/blocks/app-shell-01/app-shell-01";
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
import { colors, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  frame: {
    width: "100%",
    height: 560,
    overflow: "hidden",
    borderRadius: space["3"],
    boxShadow: `0 0 0 ${size.hairline} ${colors.border}`,
  },
  shell: { height: "100%", minHeight: 0 },
});

const places = [
  { name: "Inbox", icon: InboxIcon },
  { name: "Dashboard", icon: LayoutDashboardIcon },
];

// A notice for the whole product, on every page: `banner` puts it above the header, across the
// page. Closed, the header takes its place.
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
                          <span>{place.name}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        }
        title="Dashboard"
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
        <PageHeader
          title="Dashboard"
          description="This week's numbers, and what changed since Monday."
        />
      </AppShell>
    </div>
  );
}
