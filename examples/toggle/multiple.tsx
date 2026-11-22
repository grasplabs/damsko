import {
  ToggleGroup,
  ToggleGroupItem,
} from "@grasp-os/ui/components/toggle-group";
import {
  BoldIcon,
  Icon,
  ItalicIcon,
  UnderlineIcon,
} from "@grasp-os/ui/lib/icons";

export default function ToggleGroupMultiple() {
  return (
    <ToggleGroup aria-label="Text style" multiple defaultValue={["bold"]}>
      <ToggleGroupItem value="bold" aria-label="Bold">
        <Icon icon={BoldIcon} />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        <Icon icon={ItalicIcon} />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        <Icon icon={UnderlineIcon} />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
