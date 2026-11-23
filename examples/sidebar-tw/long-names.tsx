import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from "@grasp-os/ui/components-tw/sidebar";
import { Badge } from "@grasp-os/ui/components/badge";
import { FolderIcon, Icon } from "@grasp-os/ui/lib-tw/icons";

// A row's words longer than the row end in an ellipsis: before the row's end, before a count
// beside it, and before a mark the row holds, which keeps its size. Rest the pointer on a cut row,
// or reach it by Tab, and its tooltip shows the words whole; a row that fits shows none.
export default function SidebarLongNames() {
  return (
    <div className="shadow-frame flex h-[360px] w-full overflow-hidden rounded-md">
      <SidebarProvider className="h-full min-h-0">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Projects</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="#renewals">
                        <Icon icon={FolderIcon} />
                        Every supplier contract and the day each one is up for
                        renewal
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="#invoices">
                        <Icon icon={FolderIcon} />
                        Supplier invoices waiting on a second approval
                      </a>
                    </SidebarMenuButton>
                    <SidebarMenuBadge>12</SidebarMenuBadge>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="#handbook">
                        <Icon icon={FolderIcon} />
                        The handbook for everyone who joins this quarter
                        <Badge size="sm">Draft</Badge>
                      </a>
                    </SidebarMenuButton>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#handbook-first-week">
                          What happens in the first week, day by day
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="#hiring">
                        <Icon icon={FolderIcon} />
                        Hiring
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="shadow-bar-under flex items-center gap-2 px-3 py-2">
            <SidebarTrigger />
            <h2 className="text-foreground m-0 font-sans text-sm font-medium">
              Projects
            </h2>
          </header>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
