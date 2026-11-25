"use client";

import { AppShell } from "@grasp-os/ui/blocks/app-shell-01/app-shell-01";
import {
  BreadcrumbItem,
  BreadcrumbLink,
} from "@grasp-os/ui/components/breadcrumb";
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
  FileIcon,
  Icon,
  InboxIcon,
  LinkIcon,
  StarIcon,
} from "@grasp-os/ui/lib/icons";
import { colors, font, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

// The app's window: as wide as the stage, a corner the card's nests in, and a soft edge.
const layout = stylex.create({
  window: {
    width: "100%",
    height: 640,
    overflow: "hidden",
    borderRadius: space["3"],
    boxShadow: `0 0 0 ${size.hairline} ${colors.border}`,
  },
  shell: { height: "100%", minHeight: 0 },
  // The note: paragraphs under its head, long enough to scroll.
  body: {
    display: "grid",
    gap: space["4"],
    maxWidth: "42rem",
    marginBlockStart: space["6"],
  },
  paragraph: {
    margin: 0,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.bodyForeground,
  },
  facts: { paddingInline: space["4"] },
});

const places = [
  { name: "Inbox", icon: InboxIcon },
  { name: "Notes", icon: FileIcon },
];

const facts = [
  { id: "owner", label: "Owner", value: "Mara Jensen" },
  { id: "people", label: "People", value: "8" },
  { id: "interviewed", label: "Interviewed", value: "Not yet" },
];

const paragraphs = Array.from(
  { length: 9 },
  (_, index) =>
    `Point ${index + 1}: who in Finance owns which close, what they asked for, and what still needs an answer before the interviews.`
);

// A note's page, its head a banner (PageHeader variant="banner"): flush under the shell's header,
// edge to edge of the card, the dither faint behind the title, one hairline along its foot. Its
// actions stand on the title's line; Details opens the page's own panel, where the band ends at the
// panel's line.
export default function PageHeaderBand() {
  const [details, setDetails] = useState(false);
  return (
    <div {...stylex.props(layout.window)}>
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
                        isActive={place.name === "Notes"}
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
        breadcrumb={
          <>
            <BreadcrumbItem>
              <BreadcrumbLink href="#notes">Notes</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="#notes/reports">Reports</BreadcrumbLink>
            </BreadcrumbItem>
          </>
        }
        title="Finance"
        panel={
          <SidePanel aria-label="Finance details">
            <SidePanelHeader
              title="Details"
              onClose={() => {
                setDetails(false);
              }}
            />
            <SidePanelContent>
              <SidePanelSection title="About this group">
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
        panelOpen={details}
        onPanelOpenChange={setDetails}
      >
        <PageHeader
          variant="banner"
          title="Finance"
          description="8 people. Not interviewed yet."
          actions={
            <>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="Add to favourites"
              >
                <Icon icon={StarIcon} />
              </Button>
              <Button size="icon-sm" variant="ghost" aria-label="Copy the link">
                <Icon icon={LinkIcon} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                aria-pressed={details}
                onClick={() => {
                  setDetails(!details);
                }}
              >
                Details
              </Button>
            </>
          }
        />
        <div {...stylex.props(layout.body)}>
          {paragraphs.map((text) => (
            <p key={text} {...stylex.props(layout.paragraph)}>
              {text}
            </p>
          ))}
        </div>
      </AppShell>
    </div>
  );
}
