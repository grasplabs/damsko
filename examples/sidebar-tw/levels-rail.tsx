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
} from "@grasp-os/ui/components-tw/sidebar";
import {
  ChevronLeftIcon,
  Icon,
  InboxIcon,
  SettingsIcon,
  UsersIcon,
} from "@grasp-os/ui/lib-tw/icons";

// The sidebar keeps the level itself: it opens on `defaultValue`, and each SidebarLevelTrigger
// shows another. Folded to its icons, the way back is its chevron and the level's title its icon.
export default function SidebarLevelsRail() {
  return (
    <div className="shadow-frame flex h-[320px] w-full overflow-hidden rounded-md">
      <SidebarProvider className="h-full min-h-0" defaultOpen={false}>
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
            <div className="contents">
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
