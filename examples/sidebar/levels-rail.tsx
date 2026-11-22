"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
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
} from "@grasp-os/ui/components/sidebar";
import {
  ChevronLeftIcon,
  Icon,
  InboxIcon,
  SettingsIcon,
  UsersIcon,
} from "@grasp-os/ui/lib/icons";
import { colors, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  frame: {
    display: "flex",
    width: "100%",
    height: 320,
    overflow: "hidden",
    borderRadius: space["3"],
    boxShadow: `0 0 0 ${size.hairline} ${colors.border}`,
  },
  provider: { minHeight: 0, height: "100%" },
  // A product's own element round a level (a boundary, a provider that draws one): it takes no
  // box of its own, so the level fills the room as before.
  boundary: { display: "contents" },
});

// The sidebar keeps the level itself: it opens on `defaultValue`, and each SidebarLevelTrigger
// shows another. Folded to its icons, the way back is its chevron and the level's title its icon.
export default function SidebarLevelsRail() {
  return (
    <div {...stylex.props(layout.frame)}>
      <SidebarProvider style={layout.provider} defaultOpen={false}>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <SidebarTrigger />
          </SidebarHeader>
          <SidebarLevels defaultValue="settings">
            <SidebarLevel value="main">
              <SidebarContent>
                <SidebarGroup>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive>
                        <a href="#inbox">
                          <Icon icon={InboxIcon} />
                          Inbox
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarLevelTrigger value="settings">
                        <Icon icon={SettingsIcon} />
                        Settings
                      </SidebarLevelTrigger>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroup>
              </SidebarContent>
            </SidebarLevel>
            <div {...stylex.props(layout.boundary)}>
              <SidebarLevel value="settings">
                <SidebarLevelHeader>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarLevelTrigger value="main">
                        <Icon icon={ChevronLeftIcon} />
                        Back
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
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive>
                          <a href="#members">
                            <Icon icon={UsersIcon} />
                            Members
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroup>
                </SidebarContent>
              </SidebarLevel>
            </div>
          </SidebarLevels>
        </Sidebar>
        <SidebarInset>{null}</SidebarInset>
      </SidebarProvider>
    </div>
  );
}
