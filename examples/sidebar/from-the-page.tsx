import { Button } from "@grasp-os/ui/components/button";
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
} from "@grasp-os/ui/components/sidebar";
import {
  FolderKanbanIcon,
  Icon,
  InboxIcon,
  LayoutDashboardIcon,
  MessageSquareIcon,
} from "@grasp-os/ui/lib/icons";
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
  title: {
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    fontWeight: font.weightMedium,
    color: colors.foreground,
  },
});

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
                        isActive={place.name === "Dashboard"}
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
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <header {...stylex.props(layout.bar)}>
            <SidebarTrigger />
            <h2 {...stylex.props(layout.title)}>Dashboard</h2>
            <FocusMode />
          </header>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
