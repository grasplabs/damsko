import { Toggle } from "@grasp-os/ui/components/toggle";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@grasp-os/ui/components/toggle-group";

// One toggle in one state. The docs draw it once per state; hover and keyboard focus are forced
// from the toggle's own CSS. `place="group"` puts it on a group's track, where on is raised: the
// track makes it a little larger, so the docs show it as its own row, not a cell among these.
export default function ToggleState({
  pressed = false,
  place = "alone",
  disabled = false,
}: {
  pressed?: boolean;
  place?: "alone" | "group";
  disabled?: boolean;
}) {
  if (place === "group") {
    return (
      <ToggleGroup
        aria-label="Filters"
        defaultValue={pressed ? ["archived"] : []}
        disabled={disabled}
      >
        <ToggleGroupItem value="archived">Show archived</ToggleGroupItem>
      </ToggleGroup>
    );
  }
  return (
    <Toggle defaultPressed={pressed} disabled={disabled}>
      Show archived
    </Toggle>
  );
}
