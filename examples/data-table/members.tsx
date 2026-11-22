import { Avatar, AvatarFallback } from "@grasp-os/ui/components/avatar";
import { DataTable } from "@grasp-os/ui/components/data-table";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@grasp-os/ui/components/select";
import { colors, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  seen: string;
}

const roles = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
];

const members: Member[] = [
  {
    id: "m1",
    name: "Amara Okafor",
    email: "amara@contoso.example",
    role: "owner",
    seen: "2026-11-17",
  },
  {
    id: "m2",
    name: "Jonas Weber",
    email: "jonas@contoso.example",
    role: "admin",
    seen: "2026-11-16",
  },
  {
    id: "m3",
    name: "Lena Ruiz",
    email: "lena@contoso.example",
    role: "member",
    seen: "2026-11-12",
  },
  {
    id: "m4",
    name: "Sam Patel",
    email: "sam@contoso.example",
    role: "member",
    seen: "2026-11-03",
  },
];

const date = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

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

// Members of a workspace, as a settings page has them: the person (picture, name, email), their
// role as a Select in the row that keeps the row's height, when they were last seen, and the row's
// menu at its end.
export default function DataTableMembers() {
  const [role, setRole] = useState<Record<string, string>>({});
  return (
    <DataTable
      aria-label="Members"
      rows={members}
      getRowId={(member) => member.id}
      unit={{ one: "member", other: "members" }}
      columns={[
        {
          id: "name",
          header: "Name",
          value: (member) => member.name,
          cell: (member) => <Person member={member} />,
          sortable: true,
        },
        {
          id: "role",
          header: "Role",
          control: true,
          value: (member) => role[member.id] ?? member.role,
          cell: (member) => (
            <Select
              items={roles}
              value={role[member.id] ?? member.role}
              onValueChange={(next) => {
                if (typeof next === "string") {
                  setRole((all) => ({ ...all, [member.id]: next }));
                }
              }}
            >
              <SelectTrigger
                size="sm"
                variant="ghost"
                aria-label={`Role of ${member.name}`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent />
            </Select>
          ),
        },
        {
          id: "seen",
          header: "Last seen",
          value: (member) => member.seen,
          cell: (member) => date.format(new Date(member.seen)),
          sortable: true,
          hideBelow: "sm",
        },
      ]}
      rowActions={(member) => [
        { label: "Resend invite", onSelect: () => undefined },
        { label: `Remove ${member.name}`, onSelect: () => undefined },
      ]}
    />
  );
}
