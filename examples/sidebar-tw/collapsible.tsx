import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@grasp-os/ui/components-tw/sidebar";
import {
  FolderKanbanIcon,
  Icon,
  InboxIcon,
  LayoutDashboardIcon,
  MessageSquareIcon,
} from "@grasp-os/ui/lib-tw/icons";

const places = [
  { name: "Inbox", icon: InboxIcon },
  { name: "Dashboard", icon: LayoutDashboardIcon },
  { name: "Messages", icon: MessageSquareIcon },
  { name: "Projects", icon: FolderKanbanIcon },
];

// Off the canvas, the default: the trigger, the rail or Cmd+B (Ctrl+B elsewhere) slides it out past
// its side, and the page takes the width. Folded, it is out of reach of Tab; the trigger brings it
// back.
export default function SidebarCollapsible() {
  return (
    <div className="shadow-frame flex h-[480px] w-full overflow-hidden rounded-md">
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
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <header className="shadow-bar-under flex items-center gap-2 px-3 py-2">
            <SidebarTrigger />
            <h2 className="text-foreground m-0 font-sans text-sm font-medium">
              Dashboard
            </h2>
          </header>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
