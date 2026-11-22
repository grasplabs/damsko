"use client";

import { Avatar, AvatarFallback } from "@grasp-os/ui/components/avatar";
import { Badge } from "@grasp-os/ui/components/badge";
import { Button } from "@grasp-os/ui/components/button";
import { Card, CardContent, CardFooter } from "@grasp-os/ui/components/card";
import { CopyButton } from "@grasp-os/ui/components/copy-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@grasp-os/ui/components/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@grasp-os/ui/components/empty";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationRange,
} from "@grasp-os/ui/components/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@grasp-os/ui/components/popover";
import { SectionHeader } from "@grasp-os/ui/components/section-header";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@grasp-os/ui/components/select";
import { Skeleton } from "@grasp-os/ui/components/skeleton";
import { Toaster, createToaster } from "@grasp-os/ui/components/toast";
import {
  EllipsisIcon,
  Icon,
  InfoIcon,
  SearchIcon,
} from "@grasp-os/ui/lib/icons";
import { colors, font, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { Fragment, useState } from "react";
import type { ReactNode } from "react";

import { InviteDialog } from "./members-invite";
import type { Invited } from "./members-invite";
import { roles } from "./members-roles";

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
  actions: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space["2"],
  },
  search: { width: "14rem" },
  // Removed people: the list's foot, under a quiet name, their words a step back.
  removedLabel: {
    margin: 0,
    paddingBlock: space["2"],
    paddingInline: space.tableCellInline,
    borderTopStyle: "solid",
    borderTopWidth: size.hairline,
    borderTopColor: colors.border,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    fontWeight: font.weightMedium,
    color: colors.mutedForeground,
  },
  muted: { color: colors.mutedForeground },
  face: { width: size.avatarXs, height: size.avatarXs },
  nameLine: { width: "10rem" },
  mailLine: { width: "14rem" },
  // The roles compared: each name over what it may do.
  roles: {
    display: "grid",
    gap: space["3"],
    margin: 0,
    padding: 0,
    maxWidth: "20rem",
  },
  roleName: {
    margin: 0,
    fontWeight: font.weightMedium,
    color: colors.foreground,
  },
  roleLine: { margin: 0, color: colors.mutedForeground },
});

type State = "active" | "invited" | "removed";
export interface Person {
  name: string;
  email: string;
  role: string;
  state: State;
  you?: boolean;
}

export const people: Person[] = [
  {
    name: "Anna de Vries",
    email: "anna@northwind.example",
    role: "admin",
    state: "active",
    you: true,
  },
  {
    name: "Ravi Menon",
    email: "ravi@northwind.example",
    role: "editor",
    state: "active",
  },
  {
    name: "Sofia Laine",
    email: "sofia@northwind.example",
    role: "viewer",
    state: "active",
  },
  {
    name: "Tom Becker",
    email: "tom@northwind.example",
    role: "viewer",
    state: "active",
  },
  {
    name: "Lena Okafor",
    email: "lena@northwind.example",
    role: "editor",
    state: "invited",
  },
  {
    name: "Omar Haddad",
    email: "omar@northwind.example",
    role: "viewer",
    state: "removed",
  },
];

const listed = (invited: Invited[]) =>
  invited.map(({ email }) => email).join(", ");

/** The person's face, name and email. */
const Who = ({
  person,
  quiet = false,
}: {
  person: Person;
  quiet?: boolean;
}) => (
  <>
    <ItemMedia>
      <Avatar name={person.name} size="xs" decorative>
        <AvatarFallback />
      </Avatar>
    </ItemMedia>
    <ItemContent>
      <ItemTitle>
        <span {...stylex.props(quiet && layout.muted)}>{person.name}</span>
        {person.you === true && <ItemDetail>You</ItemDetail>}
      </ItemTitle>
      {/* Invited by address alone, the address is the name: said once, the line under it says why. */}
      <ItemDescription>
        {person.name === person.email ? "Invitation sent" : person.email}
      </ItemDescription>
    </ItemContent>
    {/* The email's copy shows on hover and on focus, and always on touch. */}
    {person.name === person.email ? null : (
      <ItemActions showOnHover>
        <CopyButton
          value={person.email}
          variant="ghost"
          size="icon-xs"
          aria-label={`Copy email of ${person.name}`}
        />
      </ItemActions>
    )}
  </>
);

/** A row while the people load: a face and two lines, the row's own height. */
const LoadingRow = () => (
  <Item size="xs">
    <ItemMedia>
      <Skeleton variant="circular" style={layout.face} />
    </ItemMedia>
    <ItemContent>
      <Skeleton size="sm" style={layout.nameLine} />
      <Skeleton size="sm" style={layout.mailLine} />
    </ItemContent>
  </Item>
);

/** A row's menu: its button, named for the person, and what can be done to them. */
const RowMenu = ({ name, children }: { name: string; children: ReactNode }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon-xs" aria-label={`Actions for ${name}`}>
        <Icon icon={EllipsisIcon} />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">{children}</DropdownMenuContent>
  </DropdownMenu>
);

const matches = (person: Person, query: string) =>
  `${person.name} ${person.email}`
    .toLowerCase()
    .includes(query.trim().toLowerCase());

// Settings > Members, the people: one list. Each person with a face, the email to copy, the role
// chosen in the row and a menu at its end; an invitation says so in its badge; someone removed
// stays at the list's foot, a step back, with Restore.
export default function MembersPeople({
  initial = people,
  pageSize = 20,
  loading = false,
}: {
  initial?: Person[];
  pageSize?: number;
  loading?: boolean;
}) {
  const [toast] = useState(() => createToaster());
  const [list, setList] = useState(initial);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const move = (email: string, state: State) => {
    setList((all) =>
      all.map((each) => (each.email === email ? { ...each, state } : each))
    );
  };
  // A revoked invitation goes: the person never joined, so they are not among the removed.
  const revoke = (email: string) => {
    setList((all) => all.filter((each) => each.email !== email));
  };
  const copy = (person: Person) => {
    void navigator.clipboard?.writeText(person.email).catch(() => undefined);
    toast("Copied", { description: person.email });
  };
  // The people just invited join the list as invited. When all went, the dialog closes and a toast
  // says so; when some did not, the dialog stays open and its field says who.
  const invite = (invited: Invited[], everyone: boolean) => {
    setList((all) => [
      ...all,
      ...invited.map(({ email, role }) => ({
        name: email,
        email,
        role,
        state: "invited" as const,
      })),
    ]);
    if (everyone) {
      toast(
        invited.length === 1
          ? "Invitation sent"
          : `${invited.length} invitations sent`,
        { description: listed(invited) }
      );
    }
  };
  const current = list.filter((person) => person.state !== "removed");
  // Search finds by name or email; a long list is paged, the search over all of it.
  const found = current.filter((person) => matches(person, query));
  const pages = Math.max(1, Math.ceil(found.length / pageSize));
  const onPage = found.slice(
    (Math.min(page, pages) - 1) * pageSize,
    Math.min(page, pages) * pageSize
  );
  const removed = list.filter((person) => person.state === "removed");
  return (
    <div {...stylex.props(layout.page)}>
      <PageHeader size="sm" title="Members" />
      <section aria-labelledby="members-people" {...stylex.props(layout.group)}>
        <div {...stylex.props(layout.head)}>
          <SectionHeader
            id="members-people"
            variant="group"
            title={
              loading
                ? "People"
                : `${current.length} ${current.length === 1 ? "person" : "people"}`
            }
            actions={
              <div {...stylex.props(layout.actions)}>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Icon icon={InfoIcon} />
                      Roles
                    </Button>
                  </PopoverTrigger>
                  {/* It only explains: Popover keeps focus on the button, so no ring frames the panel. */}
                  <PopoverContent>
                    <PopoverTitle>Roles</PopoverTitle>
                    <dl {...stylex.props(layout.roles)}>
                      {roles.map((role) => (
                        <div key={role.value}>
                          <dt {...stylex.props(layout.roleName)}>
                            {role.label}
                          </dt>
                          <dd {...stylex.props(layout.roleLine)}>
                            {role.description}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </PopoverContent>
                </Popover>
                <InputGroup size="sm" style={layout.search}>
                  <InputGroupAddon>
                    <Icon icon={SearchIcon} />
                  </InputGroupAddon>
                  <InputGroupInput
                    type="search"
                    aria-label="Search members"
                    placeholder="Search members"
                    value={query}
                    onChange={(event) => {
                      setQuery(event.currentTarget.value);
                      setPage(1);
                    }}
                  />
                </InputGroup>
                <InviteDialog onInvited={invite} />
              </div>
            }
          />
        </div>
        <Card size="sm">
          <CardContent flush>
            {loading ? (
              <ItemGroup aria-label="Members, loading">
                <LoadingRow />
                <ItemSeparator />
                <LoadingRow />
                <ItemSeparator />
                <LoadingRow />
              </ItemGroup>
            ) : null}
            {!loading && found.length === 0 ? (
              <Empty size="sm">
                <EmptyHeader>
                  <EmptyTitle>No one matches</EmptyTitle>
                  <EmptyDescription>
                    Search finds people by their name or email.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : null}
            {loading || found.length === 0 ? null : (
              <ItemGroup aria-label="Members">
                {onPage.map((person, index) => (
                  <Fragment key={person.email}>
                    {index > 0 && <ItemSeparator />}
                    <Item size="xs">
                      <Who person={person} />
                      <ItemActions>
                        {person.state === "invited" && (
                          <Badge size="sm" variant="info">
                            Invited
                          </Badge>
                        )}
                        <Select items={roles} defaultValue={person.role}>
                          <SelectTrigger
                            size="sm"
                            variant="ghost"
                            aria-label={`Role of ${person.name}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent />
                        </Select>
                        <RowMenu name={person.name}>
                          <DropdownMenuItem
                            onSelect={() => {
                              copy(person);
                            }}
                          >
                            Copy email
                          </DropdownMenuItem>
                          {person.state === "invited" && (
                            <>
                              <DropdownMenuItem
                                onSelect={() =>
                                  toast("Invitation sent again", {
                                    description: person.email,
                                  })
                                }
                              >
                                Resend invitation
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => {
                                  revoke(person.email);
                                }}
                              >
                                Revoke invitation
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => {
                              move(person.email, "removed");
                            }}
                          >
                            Remove from workspace
                          </DropdownMenuItem>
                        </RowMenu>
                      </ItemActions>
                    </Item>
                  </Fragment>
                ))}
              </ItemGroup>
            )}
            {!loading && removed.length > 0 && (
              <>
                <p {...stylex.props(layout.removedLabel)}>Removed</p>
                <ItemGroup aria-label="Removed">
                  {removed.map((person, index) => (
                    <Fragment key={person.email}>
                      {index > 0 && <ItemSeparator />}
                      <Item size="xs">
                        <Who person={person} quiet />
                        <ItemActions>
                          <Badge size="sm">Removed</Badge>
                          <RowMenu name={person.name}>
                            <DropdownMenuItem
                              onSelect={() => {
                                move(person.email, "active");
                              }}
                            >
                              Restore
                            </DropdownMenuItem>
                          </RowMenu>
                        </ItemActions>
                      </Item>
                    </Fragment>
                  ))}
                </ItemGroup>
              </>
            )}
          </CardContent>
          {found.length > pageSize ? (
            <CardFooter>
              <Pagination
                total={found.length}
                pageSize={pageSize}
                page={Math.min(page, pages)}
                onPageChange={setPage}
                aria-label="Pages of members"
              >
                <PaginationRange />
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardFooter>
          ) : null}
        </Card>
      </section>
      <Toaster toaster={toast} />
    </div>
  );
}
