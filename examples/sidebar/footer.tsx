"use client";

import { Avatar, AvatarFallback } from "@grasp-os/ui/components/avatar";
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
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@grasp-os/ui/components/sidebar";
import { ThemeToggle } from "@grasp-os/ui/components/theme-toggle";
import type { ThemeMode } from "@grasp-os/ui/components/theme-toggle";
import {
  ChevronsUpDownIcon,
  Icon,
  InboxIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  SettingsIcon,
} from "@grasp-os/ui/lib/icons";
import { colors, font, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  frame: {
    display: "flex",
    width: "100%",
    height: 520,
    overflow: "hidden",
    borderRadius: space["3"],
    boxShadow: `0 0 0 ${size.hairline} ${colors.border}`,
  },
  provider: { minHeight: 0, height: "100%" },
  bar: {
    display: "flex",
    alignItems: "center",
    gap: space["2"],
    paddingBlock: space["2"],
    paddingInline: space["3"],
    boxShadow: `inset 0 calc(-1 * ${size.hairline}) 0 ${colors.border}`,
  },
  title: {
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    fontWeight: font.weightMedium,
    color: colors.foreground,
  },
  person: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    lineHeight: font.textXsLine,
  },
  note: { fontSize: font.textXs, fontWeight: font.weightNormal },
  end: { marginInlineStart: "auto", display: "inline-flex" },
});

const places = [
  { name: "Inbox", icon: InboxIcon },
  { name: "Dashboard", icon: LayoutDashboardIcon },
];

// The foot holds what the product composes there: the theme control, then the person signed in
// with their menu, a large row with their picture and two lines.
export default function SidebarFooterExample() {
  const [mode, setMode] = useState<ThemeMode>("system");
  return (
    <div {...stylex.props(layout.frame)}>
      <SidebarProvider style={layout.provider}>
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
                          <span>{place.name}</span>
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
                      <span {...stylex.props(layout.person)}>
                        <span>Anna de Vries</span>
                        <span {...stylex.props(layout.note)}>Northwind</span>
                      </span>
                      <span aria-hidden="true" {...stylex.props(layout.end)}>
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
          <header {...stylex.props(layout.bar)}>
            <SidebarTrigger />
            <h2 {...stylex.props(layout.title)}>Inbox</h2>
          </header>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
