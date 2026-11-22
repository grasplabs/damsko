"use client";

import { AgentIndicator } from "@grasp-os/ui/components/agent-indicator";
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
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@grasp-os/ui/components/sidebar";
import { EllipsisIcon, Icon, MessageSquareIcon } from "@grasp-os/ui/lib/icons";
import { colors, font, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  frame: {
    display: "flex",
    width: "100%",
    height: 480,
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
  // The row's mark keeps its size: a long name gives way to it.
  mark: { flexShrink: 0 },
  title: {
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    fontWeight: font.weightMedium,
    color: colors.foreground,
  },
});

const threads = [
  { name: "Spring launch plan", working: true },
  { name: "Supplier invoices", working: false },
  { name: "Weekly numbers", working: false },
  {
    name: "Every supplier contract and the day each one is up for renewal",
    working: true,
  },
];

// Each row has its own menu at its end, shown while the pointer or focus is on the row, and always
// on a touch screen. A row where work is going on carries the caller's own mark in its children.
export default function SidebarActions() {
  return (
    <div {...stylex.props(layout.frame)}>
      <SidebarProvider style={layout.provider}>
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Threads</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {threads.map((thread, index) => (
                    <SidebarMenuItem key={thread.name}>
                      <SidebarMenuButton asChild isActive={index === 0}>
                        <a href={`#thread-${index + 1}`}>
                          <Icon icon={MessageSquareIcon} />
                          {thread.name}
                          {thread.working && (
                            <AgentIndicator
                              aria-label="Working"
                              style={layout.mark}
                            />
                          )}
                        </a>
                      </SidebarMenuButton>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <SidebarMenuAction
                            showOnHover
                            aria-label={`More for ${thread.name}`}
                          >
                            <Icon icon={EllipsisIcon} />
                          </SidebarMenuAction>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="end" align="start">
                          <DropdownMenuItem>Rename</DropdownMenuItem>
                          <DropdownMenuItem>Share</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Archive</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header {...stylex.props(layout.bar)}>
            <SidebarTrigger />
            <h2 {...stylex.props(layout.title)}>Spring launch plan</h2>
          </header>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
