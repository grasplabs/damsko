import { Avatar, AvatarFallback } from "@grasp-os/ui/components/avatar";
import { Combobox, ComboboxEmpty } from "@grasp-os/ui/components/combobox";
import type { ComboboxItem } from "@grasp-os/ui/components/combobox";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@grasp-os/ui/components/field";
import { Icon, UsersIcon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";

// A small team, as the page knows it.
const team = [
  { id: "amara", name: "Amara Okafor", role: "Head of operations" },
  // An id may hold a space, as a display name used as an id does.
  { id: "jonas weber", name: "Jonas Weber", role: "Finance" },
  { id: "lena", name: "Lena Ruiz", role: "Design" },
  { id: "sam", name: "Sam Patel", role: "Facilities" },
  { id: "mei", name: "Mei Chen", role: "People and hiring" },
];

// Each person is an item: their avatar as its media, their role as its description. The avatar is
// decorative, as the name is written beside it.
const people: ComboboxItem[] = team.map((person) => ({
  value: person.id,
  label: person.name,
  description: person.role,
  media: (
    <Avatar name={person.name} size="xs" decorative>
      <AvatarFallback />
    </Avatar>
  ),
}));

const layout = stylex.create({
  box: { width: "100%", maxWidth: 320 },
});

// The chosen person's avatar stands at the start; type a name, or a role such as "design", to find
// someone. Empty the words to clear the choice: the quiet icon stands there again.
export default function ComboboxPeople() {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
      {...stylex.props(layout.box)}
    >
      <Field name="assignee">
        <FieldLabel>Assignee</FieldLabel>
        <Combobox
          items={people}
          media={<Icon icon={UsersIcon} />}
          defaultValue="amara"
          placeholder="Choose an assignee"
        >
          <ComboboxEmpty>No one has that name</ComboboxEmpty>
        </Combobox>
        <FieldDescription>They hear about every change.</FieldDescription>
      </Field>
    </form>
  );
}
