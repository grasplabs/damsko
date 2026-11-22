import { Badge } from "@grasp-os/ui/components/badge";
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
} from "@grasp-os/ui/components/sidebar";
import { FolderIcon, Icon } from "@grasp-os/ui/lib/icons";
import { colors, font, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  frame: {
    display: "flex",
    width: "100%",
    height: 360,
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

// A row's words longer than the row end in an ellipsis: before the row's end, before a count
// beside it, and before a mark the row holds, which keeps its size. Rest the pointer on a cut row,
// or reach it by Tab, and its tooltip shows the words whole; a row that fits shows none.
export default function SidebarLongNames() {
  return (
    <div {...stylex.props(layout.frame)}>
      <SidebarProvider style={layout.provider}>
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
          <header {...stylex.props(layout.bar)}>
            <SidebarTrigger />
            <h2 {...stylex.props(layout.title)}>Projects</h2>
          </header>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
