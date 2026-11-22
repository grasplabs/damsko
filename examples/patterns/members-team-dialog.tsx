"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@grasp-os/ui/components/avatar";
import { Button } from "@grasp-os/ui/components/button";
import { Checkbox } from "@grasp-os/ui/components/checkbox";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@grasp-os/ui/components/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@grasp-os/ui/components/empty";
import { Field, FieldError, FieldLabel } from "@grasp-os/ui/components/field";
import { Input } from "@grasp-os/ui/components/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@grasp-os/ui/components/input-group";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@grasp-os/ui/components/item";
import { Icon, SearchIcon } from "@grasp-os/ui/lib/icons";
import { colors, font, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useState } from "react";

const layout = stylex.create({
  fields: { display: "grid", gap: space["4"] },
  people: { display: "grid", gap: space["2"] },
  label: {
    margin: 0,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    fontWeight: font.weightMedium,
    color: colors.foreground,
  },
  // The list scrolls inside the field, so the dialog keeps its size with forty people. Its rows
  // step out by Item's own inline room, so each checkbox stands on the fields' start edge.
  list: {
    height: "16rem",
    overflowY: "auto",
    scrollbarWidth: "none",
    marginInline: `calc(-1 * ${space.tableCellInline})`,
  },
  // The Sidebar's soft edge: while more rows lie below, the foot fades; once scrolled, the top too.
  fadeEnd: {
    maskImage: `linear-gradient(to bottom, black calc(100% - ${space["10"]}), transparent calc(100% - ${space["1"]}))`,
  },
  fadeStart: {
    maskImage: `linear-gradient(to bottom, transparent ${space["1"]}, black ${space["10"]})`,
  },
  fadeBoth: {
    maskImage: `linear-gradient(to bottom, transparent ${space["1"]}, black ${space["10"]}, black calc(100% - ${space["10"]}), transparent calc(100% - ${space["1"]}))`,
  },
  rows: { display: "grid", margin: 0, padding: 0, listStyle: "none" },
  // A hairline between rows, as the people card's list has.
  // The line over each row but the first runs the fields' width, not the row's: the rows step out
  // by Item's inline room, the line steps back in by the same.
  row: { position: "relative" },
  line: {
    "::before": {
      content: "''",
      position: "absolute",
      top: 0,
      insetInline: space.tableCellInline,
      height: size.hairline,
      backgroundColor: colors.border,
    },
  },
  press: { display: "block", cursor: "pointer" },
  who: { display: "inline-flex", alignItems: "center", gap: space["2"] },
  count: {
    margin: 0,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
  },
});

/** Someone who can be in a team. */
export interface TeamPerson {
  name: string;
  email: string;
  src?: string;
}

/** A team: its name, and who is in it, by email. */
export interface TeamValue {
  id: string;
  name: string;
  members: string[];
}

const counted = (count: number) =>
  count === 1 ? "1 person" : `${count} people`;

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * The team's own dialog: its name, renamed in a field, and one field to find people and tick them.
 * Who is in the team shows ticked, first; unticking takes them out. Save changes keeps both; a team
 * with no name is refused, and in the `failSave` state the save fails and says so, keeping the
 * changes in the dialog.
 */
export function TeamDialog({
  team,
  everyone,
  onClose,
  onSave,
  failSave = false,
}: {
  team: TeamValue | null;
  everyone: readonly TeamPerson[];
  onClose: () => void;
  onSave: (team: TeamValue) => void;
  failSave?: boolean;
}) {
  const [name, setName] = useState(team?.name ?? "");
  const [members, setMembers] = useState<string[]>(team?.members ?? []);
  const [query, setQuery] = useState("");
  const [nameless, setNameless] = useState(false);
  // The order is set when the dialog opens: the team's people first, so ticking never moves a row.
  const [order] = useState(() =>
    [...everyone].sort(
      (a, b) =>
        Number(team?.members.includes(b.email)) -
        Number(team?.members.includes(a.email))
    )
  );

  // Whether rows lie above or below what shows, for the soft edges.
  const scroller = useRef<HTMLElement>(null);
  const [edges, setEdges] = useState({ up: false, down: false });
  const measure = () => {
    const element = scroller.current;
    if (element !== null) {
      setEdges({
        up: element.scrollTop > 1,
        down:
          element.scrollHeight - element.clientHeight - element.scrollTop > 1,
      });
    }
  };

  const found =
    query.trim() === ""
      ? order
      : order.filter((person) =>
          `${person.name} ${person.email}`
            .toLowerCase()
            .includes(query.trim().toLowerCase())
        );
  useEffect(measure, [found.length, team]);

  const tick = (email: string, on: boolean) => {
    setMembers((all) =>
      on ? [...all, email] : all.filter((each) => each !== email)
    );
  };
  const [saveWorking, setSaveWorking] = useState(false);
  const save = async () => {
    setSaveWorking(true);
    await (async () => {
      if (name.trim() === "") {
        setNameless(true);
        throw new Error("The team needs a name.");
      }
      await wait(900);
      if (failSave) {
        throw new Error("Not saved");
      }
      if (team) {
        onSave({ ...team, name: name.trim(), members });
      }
    })().finally(() => {
      setSaveWorking(false);
    });
  };

  return (
    <Dialog
      open={team !== null}
      onOpenChange={(open, details) => {
        if (saveWorking) {
          details.cancel();
          return;
        }
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{team?.name ?? ""}</DialogTitle>
          <DialogDescription>
            Who is in the team, and what it is called.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div {...stylex.props(layout.fields)}>
            <Field name="team-name" data-invalid={nameless}>
              <FieldLabel>Name</FieldLabel>
              <Input
                value={name}
                onChange={(event) => {
                  setName(event.currentTarget.value);
                  setNameless(false);
                }}
              />
              {nameless ? (
                <FieldError match>Give the team a name.</FieldError>
              ) : null}
            </Field>
            <section aria-label="People" {...stylex.props(layout.people)}>
              <p {...stylex.props(layout.label)}>People</p>
              <InputGroup>
                <InputGroupAddon>
                  <Icon icon={SearchIcon} />
                </InputGroupAddon>
                <InputGroupInput
                  type="search"
                  aria-label="Find people"
                  placeholder="Find people"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.currentTarget.value);
                  }}
                />
              </InputGroup>
              {/* Scroll area has no soft edge of its own: a plain scroller with the Sidebar's fade. */}
              <section
                ref={scroller}
                aria-label="People to tick"
                onScroll={measure}
                {...stylex.props(
                  layout.list,
                  edges.up && edges.down && layout.fadeBoth,
                  edges.up && !edges.down && layout.fadeStart,
                  !edges.up && edges.down && layout.fadeEnd
                )}
              >
                {found.length === 0 ? (
                  <Empty size="sm">
                    <EmptyHeader>
                      <EmptyTitle>No one by that name</EmptyTitle>
                      <EmptyDescription>
                        Invite them from the people list first.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  <ul {...stylex.props(layout.rows)}>
                    {found.map((person, index) => (
                      <li
                        key={person.email}
                        {...stylex.props(layout.row, index > 0 && layout.line)}
                      >
                        {/* The whole row is the checkbox's label: a press anywhere on it ticks. */}
                        <label {...stylex.props(layout.press)}>
                          <Item size="xs">
                            <ItemMedia>
                              <span {...stylex.props(layout.who)}>
                                <Checkbox
                                  checked={members.includes(person.email)}
                                  onCheckedChange={(on) => {
                                    tick(person.email, on === true);
                                  }}
                                  aria-label={person.name}
                                />
                                <Avatar name={person.name} size="xs" decorative>
                                  <AvatarImage src={person.src} />
                                  <AvatarFallback />
                                </Avatar>
                              </span>
                            </ItemMedia>
                            <ItemContent>
                              <ItemTitle>{person.name}</ItemTitle>
                              <ItemDescription>{person.email}</ItemDescription>
                            </ItemContent>
                          </Item>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              {/* Not every screen reader treats <output> as a live region. */}
              <p role="status" {...stylex.props(layout.count)}>
                {counted(members.length)} in the team
              </p>
            </section>
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
          <Button
            size="sm"
            variant="default"
            onClick={save}
            loadingLabel="Saving"
            errorLabel="Not saved"
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Everyone in the workspace who can be in a team. */
// Pictures only where the picture fits the name; everyone else shows their initials.
export const everyone: TeamPerson[] = [
  { name: "Anna de Vries", email: "anna@northwind.example" },
  { name: "Ravi Menon", email: "ravi@northwind.example" },
  { name: "Sofia Laine", email: "sofia@northwind.example" },
  {
    name: "Tom Becker",
    email: "tom@northwind.example",
    src: "/people/avatar-3.svg",
  },
  { name: "Lena Okafor", email: "lena@northwind.example" },
  {
    name: "Bas Lam",
    email: "bas@northwind.example",
    src: "/people/avatar-2.svg",
  },
  { name: "Mira Jansen", email: "mira@northwind.example" },
  { name: "Omar Haddad", email: "omar@northwind.example" },
  { name: "Ilse Vos", email: "ilse@northwind.example" },
  { name: "Pieter Jansen", email: "pieter@northwind.example" },
];

// The team's dialog on its own, opened from its button on Finance: its people ticked first, the
// rest to find. It opens when asked, never by itself: a dialog held open on the page would take the
// page from the reader.
export default function MembersTeamDialog() {
  const [finance, setFinance] = useState<TeamValue>({
    id: "finance",
    name: "Finance",
    members: everyone.slice(0, 6).map((person) => person.email),
  });
  const [open, setOpen] = useState<TeamValue | null>(null);
  // A new dialog each time it opens, so it starts from the team as it was saved.
  const [opened, setOpened] = useState(0);
  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setOpened(opened + 1);
          setOpen(finance);
        }}
      >
        {finance.name}
      </Button>
      <TeamDialog
        key={opened}
        team={open}
        everyone={everyone}
        onClose={() => {
          setOpen(null);
        }}
        onSave={(saved) => {
          setFinance(saved);
          setOpen(null);
        }}
      />
    </>
  );
}
