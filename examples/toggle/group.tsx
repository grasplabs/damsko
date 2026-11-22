import {
  ToggleGroup,
  ToggleGroupItem,
} from "@grasp-os/ui/components/toggle-group";

export default function ToggleGroupBasic() {
  return (
    <ToggleGroup aria-label="View" defaultValue={["list"]} deselectable={false}>
      <ToggleGroupItem value="list">List</ToggleGroupItem>
      <ToggleGroupItem value="board">Board</ToggleGroupItem>
      <ToggleGroupItem value="calendar">Calendar</ToggleGroupItem>
    </ToggleGroup>
  );
}
