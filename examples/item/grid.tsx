import { BrandIcon } from "@grasp-os/ui/components/brand-icon";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGrid,
  ItemMedia,
  ItemTitle,
} from "@grasp-os/ui/components/item";

import { logos } from "../brand-icon/logos";

const apps = [
  { brand: "slack", name: "Slack", fact: "182 tools" },
  { brand: "notion", name: "Notion", fact: "18 tools" },
  { brand: "google", name: "Google Workspace", fact: "15 tools" },
  { brand: "stripe", name: "Stripe", fact: "247 tools" },
  { brand: "trello", name: "Trello", fact: "96 tools" },
] as const;

// Items as tiles, as many per row as fit: small outlined Items with a mark, a name and one line,
// each row's tiles one height. A list, read row by row.
export default function ItemGridExample() {
  return (
    <ItemGrid aria-label="Apps">
      {apps.map((app) => (
        <Item key={app.name} variant="outline" size="xs" href={`#${app.brand}`}>
          <ItemMedia align="center">
            <BrandIcon {...logos[app.brand]} size="default" decorative />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{app.name}</ItemTitle>
            <ItemDescription>{app.fact}</ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </ItemGrid>
  );
}
