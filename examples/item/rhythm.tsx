import { Avatar, AvatarFallback } from "@grasp-os/ui/components/avatar";
import { BrandIcon } from "@grasp-os/ui/components/brand-icon";
import { Button } from "@grasp-os/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@grasp-os/ui/components/card";
import {
  Item,
  ItemGroup,
  ItemMedia,
  ItemContent,
  ItemSeparator,
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

import { logos } from "../brand-icon/logos";

const layout = stylex.create({
  stack: { display: "grid", gap: 16, width: "100%", maxWidth: 720 },
  role: { width: "8rem" },
});

const roles = [
  { value: "admin", label: "Admin" },
  { value: "viewer", label: "Viewer" },
];

// Lists among setting rows: `size="xs"` stands each row on the setting rows' height (56px with a
// description, 48px without) and their inset, so a settings page has one rhythm.
export default function ItemRhythm() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Card asChild size="sm">
        <section>
          <CardHeader>
            <CardTitle level={2}>Members</CardTitle>
          </CardHeader>
          <CardContent flush>
            <ItemGroup aria-label="Members">
              <Item size="xs">
                <ItemMedia align="center">
                  <Avatar name="Anna de Vries" size="xs" decorative>
                    <AvatarFallback />
                  </Avatar>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Anna de Vries</ItemTitle>
                  <ItemDescription>anna@northwind.example</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <>
                    <Select items={roles} defaultValue="admin">
                      <SelectTrigger
                        size="sm"
                        aria-label="Anna de Vries's role"
                        style={layout.role}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent />
                    </Select>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label="More for Anna de Vries"
                    >
                      <Icon icon={EllipsisIcon} />
                    </Button>
                  </>
                </ItemActions>
              </Item>
              <ItemSeparator />
              <Item size="xs">
                <ItemMedia align="center">
                  <Avatar name="Ravi Menon" size="xs" decorative>
                    <AvatarFallback />
                  </Avatar>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Ravi Menon</ItemTitle>
                  <ItemDescription>ravi@northwind.example</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Select items={roles} defaultValue="viewer">
                    <SelectTrigger
                      size="sm"
                      aria-label="Ravi Menon's role"
                      style={layout.role}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent />
                  </Select>
                </ItemActions>
              </Item>
            </ItemGroup>
          </CardContent>
        </section>
      </Card>
      <Card asChild size="sm">
        <section>
          <CardHeader>
            <CardTitle level={2}>Providers</CardTitle>
          </CardHeader>
          <CardContent flush>
            <ItemGroup aria-label="Providers">
              <Item size="xs">
                <ItemMedia align="center">
                  <BrandIcon {...logos.chatgpt} size="sm" decorative />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>OpenAI</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <Button size="sm" variant="outline">
                    Test
                  </Button>
                </ItemActions>
              </Item>
              <ItemSeparator />
              <Item size="xs">
                <ItemMedia align="center">
                  <BrandIcon {...logos.claude} size="sm" decorative />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Anthropic</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <Button size="sm" variant="outline">
                    Test
                  </Button>
                </ItemActions>
              </Item>
            </ItemGroup>
          </CardContent>
        </section>
      </Card>
    </div>
  );
}
