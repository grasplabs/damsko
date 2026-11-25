import {
  ToggleGroup,
  ToggleGroupItem,
} from "@grasp-os/ui/components/toggle-group";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  column: { display: "grid", gap: space["4"], justifyItems: "start" },
  wide: { width: 300 },
});

const views = [
  { value: "day", name: "Day" },
  { value: "week", name: "Week" },
  { value: "month", name: "Month" },
];

// For the spec only (tests/toggle.spec.ts), at /examples/toggle/sized; not on the page. A group at
// its own width and one given a wider width: in both the items stand from the track's start.
export default function ToggleSized() {
  return (
    <div {...stylex.props(styles.column)}>
      {[
        { label: "View", style: undefined },
        { label: "View, wide", style: styles.wide },
      ].map((group) => (
        <ToggleGroup
          key={group.label}
          aria-label={group.label}
          defaultValue={["week"]}
          deselectable={false}
          style={group.style}
        >
          {views.map((each) => (
            <ToggleGroupItem key={each.value} value={each.value}>
              {each.name}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      ))}
    </div>
  );
}
