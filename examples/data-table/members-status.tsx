import { Avatar, AvatarFallback } from "@grasp-os/ui/components/avatar";
import { DataTable } from "@grasp-os/ui/components/data-table";
import { colors, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

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

const layout = stylex.create({
  person: { display: "flex", alignItems: "center", gap: space[2], minWidth: 0 },
  words: { display: "grid", minWidth: 0 },
  // Each on one line, cut with an ellipsis where the column is narrow.
  line: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  email: { color: colors.mutedForeground },
});

// A person in a cell: their initials (the name beside it says who), their name and their email.
const Person = ({ member }: { member: Member }) => (
  <span {...stylex.props(layout.person)}>
    <Avatar name={member.name} size="sm" decorative>
      <AvatarFallback />
    </Avatar>
    <span {...stylex.props(layout.words)}>
      <span {...stylex.props(layout.line)}>{member.name}</span>
      <span {...stylex.props(layout.line, layout.email)}>{member.email}</span>
    </span>
  </span>
);

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
          cell: (member) => <Person member={member} />,
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
