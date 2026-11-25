import { Avatar, AvatarFallback } from "@grasp-os/ui/components/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
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
} from "@grasp-os/ui/components/sidebar";
import {
  ArchiveIcon,
  FolderKanbanIcon,
  Icon,
  InboxIcon,
  LayoutDashboardIcon,
  MessageSquareIcon,
  SettingsIcon,
} from "@grasp-os/ui/lib/icons";
import {
  colors,
  font,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  frame: {
    display: "flex",
    width: "100%",
    height: 560,
    overflow: "hidden",
    borderRadius: space["3"],
    cornerShape: radius.shape,
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
  { name: "Inbox", icon: InboxIcon, count: 3 },
  { name: "Dashboard", icon: LayoutDashboardIcon },
  { name: "Messages", icon: MessageSquareIcon },
];

// `collapsible="icon"`: it folds to a rail of its icons, from the trigger in the page's bar or
// Cmd+B (Ctrl+B elsewhere), and each place then shows its words in a tooltip. The rows within a
// place go while it is folded. A place not open to the person is `disabled`: drawn at half
// strength, and no stop for Tab.
export default function SidebarIcon() {
  return (
    <div {...stylex.props(layout.frame)}>
      <SidebarProvider style={layout.provider}>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild size="lg">
                  <a href="#home">
                    <Avatar size="sm" name="Northwind" decorative>
                      <AvatarFallback />
                    </Avatar>
                    Northwind
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
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
                      {place.count !== undefined && (
                        <SidebarMenuBadge>{place.count}</SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Projects</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="#spring-launch">
                        <Icon icon={FolderKanbanIcon} />
                        Spring launch
                      </a>
                    </SidebarMenuButton>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#spring-launch-plan">
                          Plan
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#spring-launch-budget">
                          Budget
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="#settings">
                        <Icon icon={SettingsIcon} />
                        Settings
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton disabled>
                      <Icon icon={ArchiveIcon} />
                      Archive
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
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
