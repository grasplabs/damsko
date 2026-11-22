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
  SidebarRail,
  SidebarTrigger,
} from "@grasp-os/ui/components/sidebar";
import {
  FolderKanbanIcon,
  Icon,
  InboxIcon,
  LayoutDashboardIcon,
  MessageSquareIcon,
  SettingsIcon,
} from "@grasp-os/ui/lib/icons";
import { colors, font, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  frame: {
    display: "flex",
    width: "100%",
    height: 560,
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
  { name: "Inbox", icon: InboxIcon, count: 3 },
  { name: "Dashboard", icon: LayoutDashboardIcon },
  { name: "Messages", icon: MessageSquareIcon },
];

// A header, two groups of places with the current one raised, a count where something waits, the
// pages within a project under it, and the rail along its edge. It folds to its icons: from the
// trigger in the page's bar, the rail, or Cmd+B (Ctrl+B elsewhere), and each place then names
// itself in a tooltip.
export default function SidebarBasic() {
  return (
    <div {...stylex.props(layout.frame)}>
      <SidebarProvider style={layout.provider}>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild size="lg" tooltip="Northwind">
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
                        tooltip={place.name}
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
                    <SidebarMenuButton asChild tooltip="Spring launch">
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
                    <SidebarMenuButton asChild tooltip="Settings">
                      <a href="#settings">
                        <Icon icon={SettingsIcon} />
                        Settings
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarRail />
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
