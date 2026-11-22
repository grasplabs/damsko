import { DataTable } from "@grasp-os/ui/components/data-table";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  state: "active" | "invited" | "removed";
}

const members: Member[] = [
  {
    id: "m1",
    name: "Amara Okafor",
    email: "amara@contoso.example",
    role: "Owner",
    state: "active",
  },
  {
    id: "m2",
    name: "Jonas Weber",
    email: "jonas@contoso.example",
    role: "Admin",
    state: "active",
  },
  {
    id: "m3",
    name: "Lena Ruiz",
    email: "lena@contoso.example",
    role: "Member",
    state: "invited",
  },
  {
    id: "m4",
    name: "Sam Patel",
    email: "sam@contoso.example",
    role: "Member",
    state: "removed",
  },
];

// A row's state over the whole row (`rowStatus`): Lena is invited and not yet here, so her row
// fades from its start to its end; Sam was removed, so his is greyed. Both are said in words too,
// and each row's actions stay whole and usable.
export default function DataTableMembersStatus() {
  return (
    <DataTable
      aria-label="Members"
      rows={members}
      getRowId={(member) => member.id}
      unit={{ one: "member", other: "members" }}
      getRowStatus={(member) =>
        member.state === "invited"
          ? "pending"
          : member.state === "removed"
            ? "removed"
            : undefined
      }
      columns={[
        {
          id: "name",
          header: "Name",
          value: (member) => member.name,
        },
        { id: "role", header: "Role", value: (member) => member.role },
      ]}
      rowActions={(member) =>
        member.state === "invited"
          ? [
              { label: "Resend invite", onSelect: () => undefined },
              {
                label: `Cancel invite for ${member.name}`,
                onSelect: () => undefined,
              },
            ]
          : [
              {
                label:
                  member.state === "removed"
                    ? `Restore ${member.name}`
                    : `Remove ${member.name}`,
                onSelect: () => undefined,
              },
            ]
      }
    />
  );
}
