import {
  Item,
  ItemContent,
  ItemGroup,
  ItemTitle,
} from "@grasp-os/ui/components/item";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 280 },
});

// A page's own list of its sections: every row plainly opens its own page, so none draws a
// chevron (`showChevron={false}`); the open one is `active`.
export default function ItemSections() {
  return (
    <nav aria-label="Settings" {...stylex.props(layout.box)}>
      <ItemGroup>
        {["Profile", "Notifications", "Billing"].map((name) => (
          <Item
            key={name}
            size="sm"
            href={`#${name.toLowerCase()}`}
            active={name === "Profile"}
            showChevron={false}
          >
            <ItemContent>
              <ItemTitle>{name}</ItemTitle>
            </ItemContent>
          </Item>
        ))}
      </ItemGroup>
    </nav>
  );
}
