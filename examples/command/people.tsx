import { Avatar, AvatarFallback } from "@grasp-os/ui/components/avatar";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandList,
} from "@grasp-os/ui/components/command";
import type { CommandItemData } from "@grasp-os/ui/components/command";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  command: { maxWidth: 440 },
});

const people = [
  { value: "anna", name: "Anna de Vries", line: "Head of finance" },
  { value: "ravi", name: "Ravi Menon", line: "Financial controller" },
  { value: "sofia", name: "Sofia Laine", line: "Operations" },
];

// A list of people to pick from: each row's face stands where an icon would, through `media`.
const items: CommandItemData[] = people.map((person) => ({
  value: person.value,
  label: person.name,
  description: person.line,
  media: (
    <Avatar decorative name={person.name} size="xs">
      <AvatarFallback />
    </Avatar>
  ),
}));

export default function CommandPeople() {
  return (
    <Command items={items} style={layout.command}>
      <CommandInput aria-label="Find a person" placeholder="Find a person" />
      <CommandEmpty />
      <CommandList />
    </Command>
  );
}
