"use client";

import {
  CollapsibleContent,
  CollapsibleTrigger,
} from "@grasp-os/ui/components/collapsible";
import {
  Sidebar,
  SidebarCollapsible,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  sidebarStateScript,
} from "@grasp-os/ui/components/sidebar";
import {
  ChevronDownIcon,
  FolderIcon,
  Icon,
  PlusIcon,
} from "@grasp-os/ui/lib/icons";
import {
  colors,
  font,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  frame: {
    display: "flex",
    width: "100%",
    height: 560,
    overflow: "hidden",
    borderRadius: radius.md,
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
  chevron: { display: "inline-flex" },
});

const groups = [
  { label: "Projects", rows: ["Spring launch", "Supplier review", "Hiring"] },
  { label: "Teams", rows: ["Finance", "Operations", "Design"] },
];

// Groups that fold from their label, a SidebarCollapsible's trigger drawn as the label; an action
// at the end of a label; and a field in the header that filters the rows by name. Each fold is
// kept by its `name` under the provider's `storageKey`: fold one and reload, and it stays folded,
// drawn so by `sidebarStateScript` before the page wakes.
export default function SidebarGroups() {
  const [query, setQuery] = useState("");
  const found = (row: string) =>
    row.toLowerCase().includes(query.trim().toLowerCase());
  return (
    <div {...stylex.props(layout.frame)}>
      <script
        // oxlint-disable-next-line react/no-danger -- the script is the library's own, from a constant key
        dangerouslySetInnerHTML={{
          __html: sidebarStateScript("examples-sidebar-groups"),
        }}
      />
      <SidebarProvider
        style={layout.provider}
        storageKey="examples-sidebar-groups"
      >
        <Sidebar>
          <SidebarHeader>
            <SidebarInput
              type="search"
              aria-label="Filter"
              placeholder="Filter"
              value={query}
              onValueChange={setQuery}
            />
          </SidebarHeader>
          <SidebarContent>
            {groups.map((group) => (
              <SidebarCollapsible
                key={group.label}
                name={group.label.toLowerCase()}
              >
                <SidebarGroup>
                  <CollapsibleTrigger asChild>
                    <SidebarGroupLabel asChild>
                      <button type="button">
                        {group.label}
                        <span
                          aria-hidden="true"
                          {...stylex.props(layout.chevron)}
                        >
                          <Icon icon={ChevronDownIcon} />
                        </span>
                      </button>
                    </SidebarGroupLabel>
                  </CollapsibleTrigger>
                  <SidebarGroupAction aria-label={`Add to ${group.label}`}>
                    <Icon icon={PlusIcon} />
                  </SidebarGroupAction>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {group.rows.filter(found).map((row) => (
                          <SidebarMenuItem key={row}>
                            <SidebarMenuButton asChild>
                              <a
                                href={`#${row.toLowerCase().replaceAll(" ", "-")}`}
                              >
                                <Icon icon={FolderIcon} />
                                {row}
                              </a>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </SidebarGroup>
              </SidebarCollapsible>
            ))}
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
