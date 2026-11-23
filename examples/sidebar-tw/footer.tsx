"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@grasp-os/ui/components-tw/sidebar";
import { Avatar, AvatarFallback } from "@grasp-os/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@grasp-os/ui/components/dropdown-menu";
import { ThemeToggle } from "@grasp-os/ui/components/theme-toggle";
import type { ThemeMode } from "@grasp-os/ui/components/theme-toggle";
import {
  ChevronsUpDownIcon,
  Icon,
  InboxIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  SettingsIcon,
} from "@grasp-os/ui/lib-tw/icons";
import { useState } from "react";

const places = [
  { name: "Inbox", icon: InboxIcon },
  { name: "Dashboard", icon: LayoutDashboardIcon },
];

// The foot holds what the product composes there: the theme control, then the person signed in
// with their menu, a large row with their picture and two lines.
export default function SidebarFooterExample() {
  const [mode, setMode] = useState<ThemeMode>("system");
  return (
    <div className="shadow-frame flex h-[520px] w-full overflow-hidden rounded-md">
      <SidebarProvider className="h-full min-h-0">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {places.map((place) => (
                    <SidebarMenuItem key={place.name}>
                      <SidebarMenuButton
                        asChild
                        isActive={place.name === "Inbox"}
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
          <SidebarSeparator />
          <SidebarFooter>
            <ThemeToggle size="sm" mode={mode} onModeChange={setMode} />
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton size="lg">
                      <Avatar size="sm" name="Anna de Vries" decorative>
                        <AvatarFallback />
                      </Avatar>
                      <span className="flex min-w-0 flex-col leading-(--damsko-text-xs-line)">
                        <span>Anna de Vries</span>
                        <span className="text-(length:--damsko-text-xs) font-normal">
                          Northwind
                        </span>
                      </span>
                      <span aria-hidden="true" className="ms-auto inline-flex">
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
          <header className="shadow-bar-under flex items-center gap-2 px-3 py-2">
            <SidebarTrigger />
            <h2 className="text-foreground m-0 font-sans text-sm font-medium">
              Inbox
            </h2>
          </header>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
