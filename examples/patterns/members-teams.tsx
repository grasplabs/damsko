"use client";

import { AvatarGroup } from "@grasp-os/ui/components/avatar";
import { Button } from "@grasp-os/ui/components/button";
import { Card, CardContent } from "@grasp-os/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@grasp-os/ui/components/dropdown-menu";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from "@grasp-os/ui/components/item";
import { PageHeader } from "@grasp-os/ui/components/page-header";
import { SectionHeader } from "@grasp-os/ui/components/section-header";
import { Toaster, createToaster } from "@grasp-os/ui/components/toast";
import {
  EllipsisIcon,
  Icon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@grasp-os/ui/lib/icons";
import { focusRing } from "@grasp-os/ui/lib/styles";
import { radius, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { Fragment, useState } from "react";

import { TeamDialog, everyone } from "./members-team-dialog";
import type { TeamValue } from "./members-team-dialog";

const layout = stylex.create({
  page: {
    display: "grid",
    gap: space.sectionHeaderGap,
    width: "100%",
    maxWidth: 720,
  },
  // The title over its card, a small step above it, its words where the rows' start.
  group: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    rowGap: space["2"],
    minWidth: 0,
  },
  head: { paddingInline: space.tableCellInline },
  // The team's name opens it: a button that looks like the row's title. The row cannot be one
  // pressable link and hold a menu (Item takes one or the other), so the name is the way in.
  open: {
    margin: 0,
    padding: 0,
    appearance: "none",
    borderWidth: 0,
    backgroundColor: "transparent",
    color: "inherit",
    font: "inherit",
    textAlign: "start",
    cursor: "pointer",
    borderRadius: radius.mark,
    textDecorationLine: { default: "none", ":hover": "underline" },
    textUnderlineOffset: "0.2em",
  },
  ends: { display: "flex", alignItems: "center", gap: space["3"] },
});

export const teams: TeamValue[] = [
  {
    id: "finance",
    name: "Finance",
    members: everyone.slice(0, 6).map((person) => person.email),
  },
  {
    id: "operations",
    name: "Operations",
    members: [
      "ravi@northwind.example",
      "tom@northwind.example",
      "mira@northwind.example",
    ],
  },
  { id: "sales", name: "Sales", members: ["sofia@northwind.example"] },
];

const peopleOf = (team: TeamValue) =>
  team.members
    .map((email) => everyone.find((person) => person.email === email))
    .filter((person) => person !== undefined);

const counted = (count: number) => {
  if (count === 0) {
    return "No one yet: open it to add people";
  }
  return count === 1 ? "1 person" : `${count} people`;
};

// Settings > Members, Teams: one row a team, its name, its people as a stack of faces and how many,
// and a menu with Rename and Delete. New team adds one and opens it. The name, or Rename, opens the team's dialog: its name, and one
// field to find people and tick them. Delete happens at once and a toast offers Undo, as the
// confirmations pattern does for a menu.
export default function MembersTeams({
  initial = teams,
  failSave = false,
}: {
  initial?: TeamValue[];
  failSave?: boolean;
}) {
  const [toast] = useState(() => createToaster());
  const [list, setList] = useState(initial);
  const [open, setOpen] = useState<TeamValue | null>(null);
  const remove = (team: TeamValue) => {
    const before = list;
    setList(list.filter((each) => each.id !== team.id));
    toast(`${team.name} deleted`, {
      action: {
        label: "Undo",
        onAction: () => {
          setList(before);
        },
      },
    });
  };
  return (
    <div {...stylex.props(layout.page)}>
      <PageHeader size="sm" title="Members" />
      <section aria-labelledby="members-teams" {...stylex.props(layout.group)}>
        <div {...stylex.props(layout.head)}>
          <SectionHeader
            id="members-teams"
            title="Teams"
            variant="group"
            actions={
              <Button
                size="xs"
                variant="outline"
                onClick={() => {
                  const team = {
                    id: `team-${String(list.length + 1)}`,
                    name: "New team",
                    members: [],
                  };
                  setList([...list, team]);
                  setOpen(team);
                }}
              >
                <Icon icon={PlusIcon} />
                New team
              </Button>
            }
          />
        </div>
        <Card size="sm">
          <CardContent flush>
            <ItemGroup aria-label="Teams">
              {list.map((team, index) => (
                <Fragment key={team.id}>
                  {index > 0 && <ItemSeparator />}
                  <Item size="xs">
                    <ItemContent>
                      <ItemTitle>
                        <button
                          type="button"
                          onClick={() => {
                            setOpen(team);
                          }}
                          {...stylex.props(layout.open, focusRing)}
                        >
                          {team.name}
                        </button>
                      </ItemTitle>
                      <ItemDescription>
                        {counted(team.members.length)}
                      </ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <span {...stylex.props(layout.ends)}>
                        {team.members.length > 0 ? (
                          <AvatarGroup
                            items={peopleOf(team)}
                            aria-label={`${team.name}: ${peopleOf(team)
                              .map((person) => person.name)
                              .join(", ")}`}
                          />
                        ) : null}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              aria-label={`Actions for ${team.name}`}
                            >
                              <Icon icon={EllipsisIcon} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              icon={PencilIcon}
                              onSelect={() => {
                                setOpen(team);
                              }}
                            >
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              icon={TrashIcon}
                              onSelect={() => {
                                remove(team);
                              }}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </span>
                    </ItemActions>
                  </Item>
                </Fragment>
              ))}
            </ItemGroup>
          </CardContent>
        </Card>
      </section>
      {/* A new dialog for each team opened, so it starts from that team's name and people. */}
      <TeamDialog
        key={open?.id ?? "closed"}
        team={open}
        everyone={everyone}
        failSave={failSave}
        onClose={() => {
          setOpen(null);
        }}
        onSave={(saved) => {
          setList((all) =>
            all.map((each) => (each.id === saved.id ? saved : each))
          );
          setOpen(null);
          toast(`${saved.name} saved`);
        }}
      />
      <Toaster toaster={toast} />
    </div>
  );
}
