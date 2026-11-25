"use client";

import { AppShell } from "@grasp-os/ui/blocks/app-shell-01/app-shell-01";
import {
  BreadcrumbItem,
  BreadcrumbLink,
} from "@grasp-os/ui/components/breadcrumb";
import { Button } from "@grasp-os/ui/components/button";
import {
  SidePanel,
  SidePanelContent,
  SidePanelHeader,
} from "@grasp-os/ui/components/side-panel";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@grasp-os/ui/components/sidebar";
import { EllipsisIcon, Icon, ShareIcon } from "@grasp-os/ui/lib/icons";
import {
  colors,
  font,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: space["6"],
    width: "100%",
    maxWidth: 720,
  },
  cell: {
    display: "grid",
    alignContent: "start",
    rowGap: space["3"],
    minWidth: 0,
    margin: 0,
  },
  label: {
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
  },
  shell: {
    height: 160,
    overflow: "hidden",
    borderRadius: space["3"],
    cornerShape: radius.shape,
    boxShadow: `0 0 0 ${size.hairline} ${colors.border}`,
  },
  fill: { height: "100%", minHeight: 0 },
  panel: { width: "100%", maxWidth: size.sidePanelWidth, height: 120 },
});

// The same two actions where every surface puts them, at its top end: Share with its words, More
// as an icon alone, then close. One size, one gap, close last, and no line between.
const Actions = () => (
  <>
    <Button size="sm" variant="outline">
      <Icon icon={ShareIcon} />
      Share
    </Button>
    <Button size="icon-sm" variant="ghost" aria-label="More actions">
      <Icon icon={EllipsisIcon} />
    </Button>
  </>
);

export default function BarActionsSpecimen() {
  return (
    <div {...stylex.props(styles.grid)}>
      <figure data-bar-specimen="top-bar" {...stylex.props(styles.cell)}>
        <figcaption {...stylex.props(styles.label)}>
          App shell's header
        </figcaption>
        <div {...stylex.props(styles.shell)}>
          <AppShell
            style={styles.fill}
            sidebar={
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive>
                          <a href="#reports">Reports</a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
            }
            breadcrumb={
              <BreadcrumbItem>
                <BreadcrumbLink href="#reports">Reports</BreadcrumbLink>
              </BreadcrumbItem>
            }
            title="Quarterly review"
            actions={<Actions />}
          >
            {null}
          </AppShell>
        </div>
      </figure>
      <figure data-bar-specimen="inspector" {...stylex.props(styles.cell)}>
        <figcaption {...stylex.props(styles.label)}>
          A side panel's head
        </figcaption>
        <div {...stylex.props(styles.panel)}>
          <SidePanel aria-label="Quarterly review">
            <SidePanelHeader
              title="Quarterly review"
              actions={<Actions />}
              onClose={() => {}}
            />
            <SidePanelContent>{null}</SidePanelContent>
          </SidePanel>
        </div>
      </figure>
    </div>
  );
}
