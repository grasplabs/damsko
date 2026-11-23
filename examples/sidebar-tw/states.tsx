import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarProvider,
  SidebarTrigger,
} from "@grasp-os/ui/components-tw/sidebar";

const rows = ["one", "two", "three", "four", "five"];

// Before the rows arrive: quiet bars in the rows' own boxes, the same shapes every time, so nothing
// moves when they come. The menu says it is busy.
export default function SidebarStates() {
  return (
    <div className="shadow-frame flex h-[420px] w-full overflow-hidden rounded-md">
      <SidebarProvider className="h-full min-h-0">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Projects</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu aria-busy aria-label="Projects, loading">
                  {rows.map((row) => (
                    <SidebarMenuItem key={row}>
                      <SidebarMenuSkeleton showIcon />
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
              Projects
            </h2>
          </header>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
