"use client";

import {
  AppShell,
  AppShellHeader,
  AppShellPage,
} from "@grasp-os/ui/blocks/app-shell-01/app-shell-01";
import { Button } from "@grasp-os/ui/components/button";
import { KeyValueList } from "@grasp-os/ui/components/key-value";
import { PageHeader } from "@grasp-os/ui/components/page-header";
import {
  SidePanel,
  SidePanelContent,
  SidePanelHeader,
  SidePanelSection,
} from "@grasp-os/ui/components/side-panel";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@grasp-os/ui/components/sidebar";
import {
  FolderKanbanIcon,
  Icon,
  InboxIcon,
  LayoutDashboardIcon,
} from "@grasp-os/ui/lib/icons";
import { colors, radius, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  // The app's window: the card's corner plus the room round it, so the two corners nest.
  frame: {
    width: "100%",
    height: 600,
    overflow: "hidden",
    borderRadius: `calc(${radius.md} + ${size.sidebarCardGap})`,
    cornerShape: radius.shape,
    boxShadow: `0 0 0 ${size.hairline} ${colors.border}`,
  },
  shell: { height: "100%", minHeight: 0 },
  facts: { paddingInline: space["4"] },
});

const places = [
  { name: "Inbox", icon: InboxIcon },
  { name: "Dashboard", icon: LayoutDashboardIcon },
  { name: "Projects", icon: FolderKanbanIcon },
];

const facts = [
  { id: "owner", label: "Owner", value: "Mara Jensen" },
  { id: "updated", label: "Updated", value: "18 November" },
  { id: "sources", label: "Sources", value: "4 documents" },
];

// The page's details in one panel at its end: drag its handle, or move it with the arrow keys. The
// bar's panel button hides and shows it. On a phone the same button opens it as a sheet. The page's
// name renames in a popup under it (`renameVariant="popup"`): a name already taken fails, and the
// popup stays open with the words typed.
export default function AppShellPanel() {
  const [title, setTitle] = useState("Launch notes");
  return (
    <div {...stylex.props(layout.frame)}>
      <AppShell
        style={layout.shell}
        sidebar={
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {places.map((place) => (
                    <SidebarMenuItem key={place.name}>
                      <SidebarMenuButton
                        asChild
                        isActive={place.name === "Projects"}
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
        }
        panel={
          <SidePanel aria-label="Note details">
            <SidePanelHeader title="Details" />
            <SidePanelContent>
              <SidePanelSection title="About this note">
                <div {...stylex.props(layout.facts)}>
                  <KeyValueList
                    orientation="horizontal"
                    divided
                    items={facts}
                  />
                </div>
              </SidePanelSection>
            </SidePanelContent>
          </SidePanel>
        }
      >
        <AppShellHeader
          title={title}
          onRename={async (next) => {
            await new Promise((done) => {
              setTimeout(done, 400);
            });
            if (next === "Roadmap") {
              throw new Error("Roadmap is taken");
            }
            setTitle(next);
          }}
          renameVariant="popup"
          renameMaxLength={60}
          renameErrorText="Could not rename: that name is already taken"
          actions={
            <Button variant="outline" size="sm">
              Share
            </Button>
          }
        />
        <AppShellPage>
          <PageHeader
            title={title}
            description="What the team agreed on, and what still needs an answer before Thursday."
          />
        </AppShellPage>
      </AppShell>
    </div>
  );
}
