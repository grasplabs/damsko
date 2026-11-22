"use client";

import { Avatar, AvatarFallback } from "@grasp-os/ui/components/avatar";
import { Badge } from "@grasp-os/ui/components/badge";
import { Button } from "@grasp-os/ui/components/button";
import { Card, CardContent } from "@grasp-os/ui/components/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@grasp-os/ui/components/input-group";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemDetail,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@grasp-os/ui/components/item";
import { PageHeader } from "@grasp-os/ui/components/page-header";
import { SectionHeader } from "@grasp-os/ui/components/section-header";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@grasp-os/ui/components/select";
import { Toaster, createToaster } from "@grasp-os/ui/components/toast";
import { Icon, PlusIcon, SearchIcon } from "@grasp-os/ui/lib/icons";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { Fragment, useState } from "react";
import type { ReactNode } from "react";

const layout = stylex.create({
  page: {
    display: "grid",
    gap: space.sectionHeaderGap,
    width: "100%",
    maxWidth: 720,
  },
  // A group's title stands a small step over its card, its words where the rows' start.
  group: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    rowGap: space["2"],
    minWidth: 0,
  },
  head: { paddingInline: space.tableCellInline },
  actions: { display: "flex", alignItems: "center", gap: space["2"] },
  search: { width: "14rem" },
  role: { width: "8rem" },
});

interface MembersGroupProps {
  id: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

// A topic: its title on the page, a small step over the card of its rows.
const MembersGroup = ({
  id,
  title,
  description,
  actions,
  children,
}: MembersGroupProps) => (
  <section aria-labelledby={id} {...stylex.props(layout.group)}>
    <div {...stylex.props(layout.head)}>
      <SectionHeader
        id={id}
        title={title}
        description={description}
        actions={actions}
        variant="group"
      />
    </div>
    <Card size="sm">
      <CardContent flush>{children}</CardContent>
    </Card>
  </section>
);

const roles = [
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
];

const members = [
  {
    name: "Anna de Vries",
    email: "anna@northwind.example",
    role: "admin",
    you: true,
  },
  {
    name: "Ravi Menon",
    email: "ravi@northwind.example",
    role: "editor",
    you: false,
  },
  {
    name: "Sofia Laine",
    email: "sofia@northwind.example",
    role: "editor",
    you: false,
  },
  {
    name: "Tom Becker",
    email: "tom@northwind.example",
    role: "viewer",
    you: false,
  },
];

// Settings > Members, from the library's parts: the people as one list on the setting rows'
// height, each with a face, a quieter "You" and a role on one edge; an invitation still
// sending says so in its badge.
export default function SettingsMembers() {
  const [toast] = useState(() => createToaster());
  return (
    <div {...stylex.props(layout.page)}>
      <PageHeader size="sm" title="Members" />
      <MembersGroup
        id="members-people"
        title="4 people"
        actions={
          <div {...stylex.props(layout.actions)}>
            <InputGroup size="sm" style={layout.search}>
              <InputGroupAddon>
                <Icon icon={SearchIcon} />
              </InputGroupAddon>
              <InputGroupInput
                type="search"
                aria-label="Search members"
                placeholder="Search members"
              />
            </InputGroup>
            <Button
              size="sm"
              variant="default"
              onClick={() =>
                toast("Invite", {
                  description: "A dialog asks for their address and role here.",
                })
              }
            >
              <Icon icon={PlusIcon} />
              Invite
            </Button>
          </div>
        }
      >
        <ItemGroup aria-label="Members">
          {members.map((member, index) => (
            <Fragment key={member.email}>
              {index > 0 && <ItemSeparator />}
              <Item size="xs">
                <ItemMedia>
                  <Avatar name={member.name} size="xs" decorative>
                    <AvatarFallback />
                  </Avatar>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>
                    {member.name}
                    {member.you && <ItemDetail>You</ItemDetail>}
                  </ItemTitle>
                  <ItemDescription>{member.email}</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Select items={roles} defaultValue={member.role}>
                    <SelectTrigger
                      size="sm"
                      aria-label={`${member.name}'s role`}
                      style={layout.role}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent />
                  </Select>
                </ItemActions>
              </Item>
            </Fragment>
          ))}
        </ItemGroup>
      </MembersGroup>
      <MembersGroup
        id="members-invitations"
        title="Invitations"
        description="Waiting for an answer."
      >
        <ItemGroup aria-label="Invitations">
          <Item size="xs">
            <ItemContent>
              <ItemTitle>lena@northwind.example</ItemTitle>
              <ItemDescription>Sent 2 days ago</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Badge size="sm">Invited</Badge>
            </ItemActions>
          </Item>
          <ItemSeparator />
          <Item size="xs">
            <ItemContent>
              <ItemTitle>omar@northwind.example</ItemTitle>
              <ItemDescription>Sending now</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Badge size="sm" loading>
                Sending
              </Badge>
            </ItemActions>
          </Item>
        </ItemGroup>
      </MembersGroup>
      <Toaster toaster={toast} />
    </div>
  );
}
