import { BrandIcon } from "@grasp-os/ui/components/brand-icon";
import { Button } from "@grasp-os/ui/components/button";
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
import { Icon, KeyIcon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";

import { logos } from "../brand-icon/logos";

const layout = stylex.create({
  box: { display: "grid", gap: 24, width: "100%", maxWidth: 560 },
});

// A dense row needs no 40px square: a provider's logo, small, by its name (`ItemMedia`), and an icon
// bare in line with its title (the default `ItemMedia`). A list keeps one kind, so its words start on one edge.
export default function ItemInlineIcon() {
  return (
    <div {...stylex.props(layout.box)}>
      <ItemGroup separated aria-label="AI providers">
        <Item size="sm">
          <ItemMedia align="center">
            <BrandIcon {...logos.chatgpt} size="xs" decorative />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>OpenAI</ItemTitle>
            <ItemDescription>
              Key ending in 4f2a, added by Anna on 3 November
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button variant="outline" size="sm">
              Test
            </Button>
          </ItemActions>
        </Item>
        <Item size="sm">
          <ItemMedia align="center">
            <BrandIcon {...logos.claude} size="xs" decorative />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Anthropic</ItemTitle>
            <ItemDescription>
              Key ending in 9c1e, added by Ravi on 12 October
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button variant="outline" size="sm">
              Test
            </Button>
          </ItemActions>
        </Item>
      </ItemGroup>
      <ItemGroup aria-label="Other keys">
        <Item size="sm">
          <ItemMedia>
            <Icon icon={KeyIcon} />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Your own key</ItemTitle>
            <ItemDescription>
              Bring a key from any provider that speaks the OpenAI API.
            </ItemDescription>
          </ItemContent>
        </Item>
      </ItemGroup>
    </div>
  );
}
