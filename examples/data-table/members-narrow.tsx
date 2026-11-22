import { DataTable } from "@grasp-os/ui/components/data-table";

const members = [
  {
    id: "m1",
    name: "Amara Okafor",
    email: "amara@contoso.example",
    role: "Owner",
    teams: "Research, Design",
    seen: "2026-11-17",
  },
  {
    id: "m2",
    name: "Jonas Weber",
    email: "jonas@contoso.example",
    role: "Admin",
    teams: "Design",
    seen: "2026-11-16",
  },
  {
    id: "m3",
    name: "Lena Ruiz",
    email: "lena@contoso.example",
    role: "Member",
    teams: "Operations",
    seen: "2026-11-12",
  },
];

const date = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

// Columns that make room on a narrow box: Teams goes under the tablet breakpoint and Last seen under
// the phone's, measured on the table's own box. Neither is the only place its fact lives: both are
// on the member's own page, so the row keeps who they are and their role. Role's info mark says
// what each role may do.
export default function DataTableMembersNarrow() {
  return (
    <DataTable
      aria-label="Members"
      rows={members}
      getRowId={(member) => member.id}
      columns={[
        {
          id: "name",
          header: "Name",
          value: (member) => member.name,
        },
        {
          id: "role",
          header: "Role",
          value: (member) => member.role,
          sortable: true,
          // What each role may do, behind an info mark beside the column's name.
          description:
            "Owners and admins manage members and billing; members use the workspace.",
        },
        {
          id: "teams",
          header: "Teams",
          value: (member) => member.teams,
          hideBelow: "md",
        },
        {
          id: "seen",
          header: "Last seen",
          value: (member) => member.seen,
          cell: (member) => date.format(new Date(member.seen)),
          hideBelow: "sm",
        },
      ]}
    />
  );
}
