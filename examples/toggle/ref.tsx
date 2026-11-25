import {
  ToggleGroup,
  ToggleGroupItem,
} from "@grasp-os/ui/components/toggle-group";
import { useState } from "react";

const views = [
  { value: "day", name: "Day" },
  { value: "week", name: "Week" },
  { value: "month", name: "Month" },
];

// For the spec only (tests/toggle.spec.ts), at /examples/toggle/ref; not on the page. A ref given to
// the group reaches its element, beside the group's own watch of its rows.
export default function ToggleRef() {
  const [named, setNamed] = useState("nothing");
  return (
    <div>
      <ToggleGroup
        aria-label="View"
        defaultValue={["week"]}
        deselectable={false}
        ref={(group) => {
          if (group !== null) {
            setNamed(
              group.getAttribute("aria-label") ?? "a group with no name"
            );
          }
        }}
      >
        {views.map((each) => (
          <ToggleGroupItem key={each.value} value={each.value}>
            {each.name}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <p>The ref holds {named}</p>
    </div>
  );
}
