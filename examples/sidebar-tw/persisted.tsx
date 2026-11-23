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
  sidebarStateScript,
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

// The person's choice kept under `storageKey`: fold it and reload, and it stays folded.
// `sidebarStateScript` draws it so before the page wakes: in the page's head, or, as here, just
// before the sidebar.
export default function SidebarPersisted() {
  return (
    <div className="shadow-frame flex h-[480px] w-full overflow-hidden rounded-md">
      <script
        // oxlint-disable-next-line react/no-danger -- the script is the library's own, from a constant key
        dangerouslySetInnerHTML={{
          __html: sidebarStateScript("examples-sidebar"),
        }}
      />
      <SidebarProvider className="h-full min-h-0" storageKey="examples-sidebar">
        <Sidebar collapsible="icon">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {places.map((place) => (
                    <SidebarMenuItem key={place.name}>
                      <SidebarMenuButton
                        asChild
                        isActive={place.name === "Dashboard"}
                        tooltip={place.name}
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
