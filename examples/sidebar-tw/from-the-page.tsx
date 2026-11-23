import { Button } from "@grasp-os/ui/components-tw/button";
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
  useSidebar,
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

/** A control of the page's own: `useSidebar` from inside the provider. */
const FocusMode = () => {
  const { open, setOpen } = useSidebar();
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-pressed={!open}
      onClick={() => {
        setOpen((now) => !now);
      }}
    >
      Focus mode
    </Button>
  );
};

// The page's own control folds and opens it through `useSidebar`: `setOpen` takes a value or, as
// React's setState, an updater, which builds on the state the calls before it left.
export default function SidebarFromThePage() {
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
            <FocusMode />
          </header>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
