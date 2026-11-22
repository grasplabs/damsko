import { DataTable } from "@grasp-os/ui/components/data-table";

interface Member {
  id: string;
  name: string;
  email: string;
  team: string;
  place: string;
  seen: string;
}

const members: Member[] = [
  {
    id: "m1",
    name: "Amara Okafor",
    email: "amara@contoso.example",
    team: "Finance",
    place: "Rotterdam",
    seen: "17 Nov",
  },
  {
    id: "m2",
    name: "Jonas Weber",
    email: "jonas@contoso.example",
    team: "Operations",
    place: "Berlin",
    seen: "16 Nov",
  },
  {
    id: "m3",
    name: "Lena Ruiz",
    email: "lena@contoso.example",
    team: "Finance",
    place: "Madrid",
    seen: "12 Nov",
  },
];

// A row that opens, with its first column held while the rest scroll (`stickyFirst`): the held name
// cell is its press area, not the whole row, since a held cell is a box of its own. The name itself
// opens the page as in any row.
export default function DataTableOpensHeld() {
  return (
    <DataTable
      aria-label="Members"
      rows={members}
      getRowId={(member) => member.id}
      stickyFirstColumn
      getRowHref={(member) => `#member-${member.id}`}
      columns={[
        { id: "name", header: "Name", value: (member) => member.name },
        { id: "email", header: "Email", value: (member) => member.email },
        { id: "team", header: "Team", value: (member) => member.team },
        { id: "place", header: "Office", value: (member) => member.place },
        { id: "seen", header: "Last seen", value: (member) => member.seen },
      ]}
    />
  );
}
