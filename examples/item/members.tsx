import { Avatar, AvatarFallback } from "@grasp-os/ui/components/avatar";
import { Button } from "@grasp-os/ui/components/button";
import {
  Item,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from "@grasp-os/ui/components/item";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@grasp-os/ui/components/select";
import { EllipsisIcon, Icon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";
import { Fragment } from "react";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 640 },
  role: { width: "8rem" },
});

const roles = [
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
];

const members = [
  {
    name: "Anna de Vries",
    email: "anna.de.vries@northwind.example",
    role: "admin",
  },
  { name: "Ravi Menon", email: "ravi@northwind.example", role: "editor" },
  { name: "Mei Tanaka", email: "mei@northwind.example", role: "viewer" },
];

// A workspace's members: each row a face, a name and an address, then a role and a menu on the row's
// end edge. In a narrow row the role and the menu drop under the words, so an address stays whole.
export default function ItemMembers() {
  return (
    <div {...stylex.props(layout.box)}>
      <ItemGroup separated aria-label="Members">
        {members.map((member, index) => (
          <Item key={member.email} size="sm">
            <ItemMedia align="center">
              <Avatar name={member.name} size="xs" decorative>
                <AvatarFallback />
              </Avatar>
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{member.name}</ItemTitle>
              <ItemDescription>{member.email}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <>
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
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label={`More for ${member.name}`}
                >
                  <Icon icon={EllipsisIcon} />
                </Button>
              </>
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
    </div>
  );
}
