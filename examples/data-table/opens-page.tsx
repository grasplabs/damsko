import { DataTable } from "@grasp-os/ui/components/data-table";

interface Member {
  id: string;
  name: string;
  email: string;
  team: string;
  seen: string;
}

const members: Member[] = [
  {
    id: "m1",
    name: "Amara Okafor",
    email: "amara@contoso.example",
    team: "Finance",
    seen: "2026-11-17",
  },
  {
    id: "m2",
    name: "Jonas Weber",
    email: "jonas@contoso.example",
    team: "Operations",
    seen: "2026-11-16",
  },
  {
    id: "m3",
    name: "Maria-Fernanda Rodríguez van der Linden",
    email: "maria@contoso.example",
    team: "Finance",
    seen: "2026-11-12",
  },
  {
    id: "m4",
    name: "Sam Patel",
    email: "sam@contoso.example",
    team: "Support",
    seen: "2026-11-03",
  },
];

const date = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

// A row that opens a page (`rowHref`): the name is a real link, drawn as the cell's words on its
// column's line; the whole row is its press area, while the checkbox and the row's menu stay their
// own. A long name wraps in whole words at the start.
export default function DataTableOpensPage() {
  return (
    <DataTable
      aria-label="Members"
      rows={members}
      getRowId={(member) => member.id}
      unit={{ one: "member", other: "members" }}
      selectable
      getRowHref={(member) => `#member-${member.id}`}
      columns={[
        {
          id: "name",
          header: "Name",
          wrap: true,
          value: (member) => member.name,
        },
        {
          id: "email",
          header: "Email",
          value: (member) => member.email,
          hideBelow: "sm",
        },
        { id: "team", header: "Team", value: (member) => member.team },
        {
          id: "seen",
          header: "Last seen",
          value: (member) => member.seen,
          cell: (member) => date.format(new Date(member.seen)),
        },
      ]}
      rowActions={(member) => [
        { label: "Resend invite", onSelect: () => undefined },
        { label: `Remove ${member.name}`, onSelect: () => undefined },
      ]}
    />
  );
}
