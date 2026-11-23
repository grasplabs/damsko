"use client";

import {
  CollapsibleContent,
  CollapsibleTrigger,
} from "@grasp-os/ui/components-tw/collapsible";
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
} from "@grasp-os/ui/components-tw/sidebar";
import {
  ChevronDownIcon,
  FolderIcon,
  Icon,
  PlusIcon,
} from "@grasp-os/ui/lib-tw/icons";
import { useState } from "react";

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
    <div className="shadow-frame flex h-[560px] w-full overflow-hidden rounded-md">
      <script
        // oxlint-disable-next-line react/no-danger -- the script is the library's own, from a constant key
        dangerouslySetInnerHTML={{
          __html: sidebarStateScript("examples-sidebar-groups"),
        }}
      />
      <SidebarProvider
        className="h-full min-h-0"
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
                        <span aria-hidden="true" className="inline-flex">
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
          <header className="shadow-bar-under flex items-center gap-2 px-3 py-2">
            <SidebarTrigger />
            <h2 className="text-foreground m-0 font-sans text-sm font-medium">
              Projects
            </h2>
          </header>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
