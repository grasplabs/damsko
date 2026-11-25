import { Avatar, AvatarFallback } from "@grasp-os/ui/components/avatar";
import { Combobox, ComboboxEmpty } from "@grasp-os/ui/components/combobox";
import type { ComboboxItem } from "@grasp-os/ui/components/combobox";
import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import { Icon, UsersIcon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";

// People and a team, as the page knows them.
const people = [
  { id: "amara", name: "Amara Okafor", role: "Head of operations" },
  { id: "jonas", name: "Jonas Weber", role: "Finance" },
  { id: "lena", name: "Lena Ruiz", role: "Design" },
  { id: "sam", name: "Sam Patel", role: "Facilities" },
];

const choices: ComboboxItem[] = [
  ...people.map((person) => ({
    value: person.id,
    label: person.name,
    description: person.role,
    media: (
      <Avatar name={person.name} size="xs" decorative>
        <AvatarFallback />
      </Avatar>
    ),
  })),
  {
    value: "design-team",
    label: "Design team",
    description: "4 people",
    media: <Icon icon={UsersIcon} />,
  },
];

const layout = stylex.create({
  box: { width: "100%", maxWidth: 360 },
});

// Several at once: each choice is a chip with its face and a button that takes it away. Type to
// find more; Backspace in the empty field reaches the last chip.
export default function ComboboxMultiple() {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
      {...stylex.props(layout.box)}
    >
      <Field name="people">
        <FieldLabel>Invite</FieldLabel>
        <Combobox
          multiple
          items={choices}
          defaultValue={["amara", "design-team"]}
          placeholder="Add people or teams"
        >
          <ComboboxEmpty>No one has that name</ComboboxEmpty>
        </Combobox>
      </Field>
    </form>
  );
}
