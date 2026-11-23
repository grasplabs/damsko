"use client";

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
} from "@grasp-os/ui/components-tw/sidebar";
import { AgentIndicator } from "@grasp-os/ui/components/agent-indicator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@grasp-os/ui/components/dropdown-menu";
import {
  EllipsisIcon,
  Icon,
  MessageSquareIcon,
} from "@grasp-os/ui/lib-tw/icons";

const threads = [
  { name: "Spring launch plan", working: true },
  { name: "Supplier invoices", working: false },
  { name: "Weekly numbers", working: false },
];

// Each row has its own menu at its end, shown while the pointer or focus is on the row, and always
// on a touch screen. A row where work is going on carries the caller's own mark in its children.
export default function SidebarActions() {
  return (
    <div className="shadow-frame flex h-[480px] w-full overflow-hidden rounded-md">
      <SidebarProvider className="h-full min-h-0">
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
                            <AgentIndicator aria-label="Working" />
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
          <header className="shadow-bar-under flex items-center gap-2 px-3 py-2">
            <SidebarTrigger />
            <h2 className="text-foreground m-0 font-sans text-sm font-medium">
              Spring launch plan
            </h2>
          </header>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
