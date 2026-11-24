import {
  ToggleGroup,
  ToggleGroupItem,
} from "@grasp-os/ui/components/toggle-group";

const languages = [
  { value: "en", name: "English" },
  { value: "nl", name: "Nederlands" },
  { value: "de", name: "Deutsch" },
  { value: "fr", name: "Français" },
  { value: "es", name: "Español" },
];

// More items than the box is wide (five languages on a phone): those that do not fit go on to
// another row, centred, and nothing runs past the track.
export default function ToggleWrap() {
  return (
    <ToggleGroup
      aria-label="Language"
      size="sm"
      defaultValue={["en"]}
      deselectable={false}
    >
      {languages.map((each) => (
        <ToggleGroupItem key={each.value} value={each.value} lang={each.value}>
          {each.name}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
