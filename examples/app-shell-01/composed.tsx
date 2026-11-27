"use client";

import {
  AppShellCard,
  AppShellContent,
  AppShellHeader,
  AppShellPage,
  AppShellSidebar,
} from "@grasp-os/ui/blocks/app-shell-01/app-shell-01";
import { appShellVars } from "@grasp-os/ui/blocks/app-shell-01/app-shell-01.stylex";
import { Button } from "@grasp-os/ui/components/button";
import { PageHeader } from "@grasp-os/ui/components/page-header";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@grasp-os/ui/components/sidebar";
import {
  Icon,
  InboxIcon,
  LayoutDashboardIcon,
  SparklesIcon,
  XIcon,
} from "@grasp-os/ui/lib/icons";
import {
  colors,
  font,
  media,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  // The app's window: the card's corner plus the room round it, so the two corners nest.
  frame: {
    width: "100%",
    height: 560,
    overflow: "hidden",
    borderRadius: `calc(${radius.md} + ${size.sidebarCardGap})`,
    cornerShape: radius.shape,
    boxShadow: `0 0 0 ${size.hairline} ${colors.border}`,
  },
  shell: { height: "100%", minHeight: 0 },
  // The page keeps room at its bar's end for the assistant's button laid over it.
  page: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minHeight: 0,
    [appShellVars.barEndRoom]: `calc(${size.sidebarIconButton} + ${space["2"]})`,
  },
  // The assistant's button over the card's end, at the bar's height.
  open: {
    position: "absolute",
    display: "flex",
    insetBlockStart: `calc((${size.appShellBar} - ${size.controlXs}) / 2)`,
    insetInlineEnd: size.appShellPageInline,
    zIndex: 25,
  },
  // The assistant over the whole card, while it is open.
  assistant: {
    position: "absolute",
    inset: 0,
    zIndex: 20,
    display: "grid",
    alignContent: "start",
    gap: space["4"],
    padding: size.appShellPageInline,
    backgroundColor: colors.sidebarCard,
  },
  notes: {
    minHeight: 96,
    fontSize: {
      default: font.textSm,
      [media.maxSmOrCoarse]: size.inputTextTouch,
    },
    padding: space["3"],
    borderRadius: radius.lg,
    cornerShape: radius.shape,
    boxShadow: `inset 0 0 0 ${size.hairline} ${colors.border}`,
  },
  assistantHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

const places = [
  { name: "Inbox", icon: InboxIcon },
  { name: "Dashboard", icon: LayoutDashboardIcon },
];

// The shell's parts composed by hand, for a product that lays more round the page: here an
// assistant whose button stands over the card's end at the bar's height (the bar keeps room for it,
// `appShellVars.barEndRoom`), which the head's search opens too, and which covers the card while
// it is open: the page under it fades and is out of reach (`covered`), its button stays.
export default function AppShellComposed() {
  const [assistant, setAssistant] = useState(false);
  return (
    <div {...stylex.props(layout.frame)}>
      <SidebarProvider style={layout.shell}>
        <AppShellSidebar
          onSearch={() => {
            setAssistant(true);
          }}
          // This site keeps Cmd+K for its own search: here Cmd+J or Ctrl+J opens the assistant.
          searchShortcut="mod+j"
        >
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
        </AppShellSidebar>
        <AppShellCard
          covered={assistant}
          overlay={
            <>
              <div {...stylex.props(layout.open)}>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Assistant"
                  aria-expanded={assistant}
                  onClick={() => {
                    setAssistant(!assistant);
                  }}
                >
                  <Icon icon={SparklesIcon} />
                </Button>
              </div>
              {assistant && (
                <section
                  aria-label="Assistant"
                  {...stylex.props(layout.assistant)}
                >
                  <div {...stylex.props(layout.assistantHead)}>
                    <h2>Assistant</h2>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Close the assistant"
                      onClick={() => {
                        setAssistant(false);
                      }}
                    >
                      <Icon icon={XIcon} />
                    </Button>
                  </div>
                </section>
              )}
            </>
          }
        >
          <div {...stylex.props(layout.page)}>
            <AppShellContent>
              <AppShellHeader title="Dashboard" />
              <AppShellPage>
                <PageHeader
                  title="Dashboard"
                  description="This week's numbers, and what changed since Monday."
                />
                {/* Rich text keeps the shell's keys for itself. */}
                <div
                  aria-label="Notes"
                  aria-multiline="true"
                  contentEditable
                  role="textbox"
                  suppressContentEditableWarning
                  tabIndex={0}
                  {...stylex.props(layout.notes)}
                >
                  Monday: numbers in.
                </div>
              </AppShellPage>
            </AppShellContent>
          </div>
        </AppShellCard>
      </SidebarProvider>
    </div>
  );
}
