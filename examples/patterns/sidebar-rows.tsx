"use client";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@grasp-os/ui/components/context-menu";
import { InlineEdit } from "@grasp-os/ui/components/inline-edit";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@grasp-os/ui/components/sidebar";
import { Icon, MessageSquareIcon } from "@grasp-os/ui/lib/icons";
import {
  colors,
  font,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import { iconVars } from "@grasp-os/ui/lib/vars.stylex";
import * as stylex from "@stylexjs/stylex";
import { useRef, useState } from "react";

const layout = stylex.create({
  frame: {
    display: "flex",
    width: "100%",
    height: 360,
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
  // The field stands in the row's own box: as tall as a row, the row's icon where it was, and the
  // field a small step after it, clear of its ring.
  renaming: {
    [iconVars.size]: size.sidebarIcon,
    display: "flex",
    alignItems: "center",
    minHeight: size.sidebarMenuButtonHeight,
    paddingInlineStart: space["2"],
    color: colors.sidebarForeground,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
  },
  renamingIcon: { display: "flex", flexShrink: 0 },
  field: { flexGrow: 1, minWidth: 0, marginInlineStart: space["1"] },
});

const first = [
  { id: "plan", name: "Spring launch plan" },
  { id: "invoices", name: "Supplier invoices" },
  { id: "numbers", name: "Weekly numbers" },
];

// A row is renamed where it stands: a double press on it, F2 while it holds focus, or Rename in its
// menu opens Inline edit in the row's place; Enter keeps the name, Escape leaves it, and focus goes
// back to the row. Its menu opens on a right press, a long press on a touch screen, and the menu
// key or Shift+F10 while the row holds focus: a Context menu round the row.
export default function SidebarRows() {
  const [rows, setRows] = useState(first);
  const [renaming, setRenaming] = useState<string | null>(null);
  // The row whose field has just closed: its link takes focus back as it is drawn again.
  const back = useRef<string | null>(null);
  return (
    <div {...stylex.props(layout.frame)}>
      <SidebarProvider style={layout.provider}>
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Threads</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {rows.map((row) => (
                    <SidebarMenuItem key={row.id}>
                      {renaming === row.id ? (
                        <div
                          // The field takes focus as it opens, its name chosen.
                          ref={(box) => {
                            const field = box?.querySelector("input");
                            field?.focus();
                            field?.select();
                          }}
                          {...stylex.props(layout.renaming)}
                        >
                          <span
                            aria-hidden="true"
                            {...stylex.props(layout.renamingIcon)}
                          >
                            <Icon icon={MessageSquareIcon} />
                          </span>
                          <InlineEdit
                            aria-label={`Name of ${row.name}`}
                            value={row.name}
                            style={layout.field}
                            editing
                            onEditingChange={(editing) => {
                              if (!editing) {
                                back.current = row.id;
                                setRenaming(null);
                              }
                            }}
                            onSubmit={(name) => {
                              setRows((all) =>
                                all.map((each) =>
                                  each.id === row.id ? { ...each, name } : each
                                )
                              );
                            }}
                          />
                        </div>
                      ) : (
                        <ContextMenu>
                          {/* The link is the row's tab stop; the area round it adds none. */}
                          <ContextMenuTrigger
                            aria-label={row.name}
                            tabStop={false}
                          >
                            <SidebarMenuButton asChild>
                              <a
                                ref={(link) => {
                                  if (
                                    link !== null &&
                                    back.current === row.id
                                  ) {
                                    back.current = null;
                                    link.focus();
                                  }
                                }}
                                href={`#${row.id}`}
                                onDoubleClick={() => {
                                  setRenaming(row.id);
                                }}
                                onKeyDown={(event) => {
                                  if (event.key === "F2") {
                                    setRenaming(row.id);
                                  }
                                }}
                              >
                                <Icon icon={MessageSquareIcon} />
                                {row.name}
                              </a>
                            </SidebarMenuButton>
                          </ContextMenuTrigger>
                          <ContextMenuContent>
                            <ContextMenuItem
                              onSelect={() => {
                                setRenaming(row.id);
                              }}
                            >
                              Rename
                              <ContextMenuShortcut>F2</ContextMenuShortcut>
                            </ContextMenuItem>
                            <ContextMenuSeparator />
                            <ContextMenuItem
                              onSelect={() => {
                                setRows((all) =>
                                  all.filter((each) => each.id !== row.id)
                                );
                              }}
                            >
                              Archive
                            </ContextMenuItem>
                          </ContextMenuContent>
                        </ContextMenu>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header {...stylex.props(layout.bar)}>
            <SidebarTrigger />
            <h2 {...stylex.props(layout.title)}>Threads</h2>
          </header>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
