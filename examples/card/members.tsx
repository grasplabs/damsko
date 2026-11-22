import { Button } from "@grasp-os/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@grasp-os/ui/components/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@grasp-os/ui/components/input-group";
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
} from "@grasp-os/ui/components/item";
import { Icon, PlusIcon, SearchIcon } from "@grasp-os/ui/lib/icons";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 640 },
  search: { width: 240 },
  list: {
    display: "grid",
    gap: space[2],
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
});

// A Settings page's members: a search and Invite in the header. In a narrow card they go under the
// title, its full width, and never past its edge; the card's own width decides, not the window's.
export default function CardMembers() {
  return (
    <div {...stylex.props(layout.box)}>
      <Card asChild>
        <section>
          <CardHeader>
            <CardTitle level={2}>Members</CardTitle>
            <CardDescription>
              Everyone who can open this workspace.
            </CardDescription>
            <CardAction>
              <InputGroup style={layout.search}>
                <InputGroupAddon>
                  <Icon icon={SearchIcon} />
                </InputGroupAddon>
                <InputGroupInput
                  type="search"
                  aria-label="Search members"
                  placeholder="Search members"
                />
              </InputGroup>
              <Button variant="default">
                <Icon icon={PlusIcon} />
                Invite
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ul {...stylex.props(layout.list)}>
              <li>
                <Item variant="outline">
                  <ItemContent>
                    <ItemTitle>Anna de Vries</ItemTitle>
                    <ItemDescription>anna@northwind.example</ItemDescription>
                  </ItemContent>
                </Item>
              </li>
              <li>
                <Item variant="outline">
                  <ItemContent>
                    <ItemTitle>Ravi Menon</ItemTitle>
                    <ItemDescription>ravi@northwind.example</ItemDescription>
                  </ItemContent>
                </Item>
              </li>
            </ul>
          </CardContent>
        </section>
      </Card>
    </div>
  );
}
