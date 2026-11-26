"use client";

import {
  AppShell,
  AppShellHeader,
  AppShellPage,
  AppShellPageSkeleton,
} from "@grasp-os/ui/blocks/app-shell-01/app-shell-01";
import { Button } from "@grasp-os/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@grasp-os/ui/components/empty";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@grasp-os/ui/components/sidebar";
import {
  CircleAlertIcon,
  FileIcon,
  Icon,
  LoaderIcon,
} from "@grasp-os/ui/lib/icons";
import type { IconData } from "@grasp-os/ui/lib/icons";
import { colors, radius, size } from "@grasp-os/ui/lib/tokens.stylex";
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
  // A state that stands for the page grows into the card's middle.
  whole: { flexGrow: 1 },
});

type State = "loading" | "missing" | "failed";

const states: { value: State; name: string; icon: IconData }[] = [
  { value: "loading", name: "Slow page", icon: LoaderIcon },
  { value: "missing", name: "Missing page", icon: FileIcon },
  { value: "failed", name: "Failed page", icon: CircleAlertIcon },
];

// How a page stands in the shell while it loads, when it is not there and when it failed: each
// keeps its bar (and the fold with it on a phone). Loading, the page's usual layout as skeletons;
// not there and failed, an Empty that grows into the card's middle, with the way on.
export default function AppShellStates() {
  const [state, setState] = useState<State>("loading");
  let page = (
    <>
      <AppShellHeader />
      <AppShellPageSkeleton />
    </>
  );
  if (state === "missing") {
    page = (
      <>
        <AppShellHeader title="Not found" />
        <AppShellPage>
          <Empty size="lg" style={layout.whole}>
            <EmptyHeader>
              <EmptyMedia illustration="lost" />
              <EmptyTitle level={1}>This page is not here</EmptyTitle>
              <EmptyDescription>
                The address may be wrong, or the page was moved or removed.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild variant="outline">
                <a href="#home">Go home</a>
              </Button>
            </EmptyContent>
          </Empty>
        </AppShellPage>
      </>
    );
  } else if (state === "failed") {
    page = (
      <>
        <AppShellHeader title="This page didn’t load" />
        <AppShellPage>
          <Empty size="lg" variant="destructive" style={layout.whole}>
            <EmptyHeader>
              <EmptyMedia variant="icon" />
              <EmptyTitle level={1}>This page didn’t load</EmptyTitle>
              <EmptyDescription>
                Reading it failed just now. The rest of the app still works.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                onClick={() => {
                  setState("loading");
                }}
              >
                Try again
              </Button>
            </EmptyContent>
          </Empty>
        </AppShellPage>
      </>
    );
  }
  return (
    <div {...stylex.props(layout.frame)}>
      <AppShell
        style={layout.shell}
        sidebar={
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {states.map((each) => (
                    <SidebarMenuItem key={each.value}>
                      <SidebarMenuButton
                        isActive={each.value === state}
                        onClick={() => {
                          setState(each.value);
                        }}
                      >
                        <Icon icon={each.icon} />
                        {each.name}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        }
      >
        {page}
      </AppShell>
    </div>
  );
}
