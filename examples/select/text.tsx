import { Avatar, AvatarFallback } from "@grasp-os/ui/components/avatar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@grasp-os/ui/components/select";
import { Text } from "@grasp-os/ui/components/text";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  list: {
    display: "grid",
    width: "100%",
    maxWidth: 440,
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr) auto",
    alignItems: "center",
    columnGap: 12,
    minHeight: 56,
  },
  words: { display: "grid", minWidth: 0 },
});

const levels = [
  { value: "use", label: "Can use" },
  { value: "edit", label: "Can edit" },
  { value: "none", label: "Remove" },
];

const people = [
  { name: "Finance team", note: "12 people", level: "use" },
  { name: "Daan de Vries", note: "Controller", level: "edit" },
  { name: "Mei Tanaka", note: "Accounts payable", level: "use" },
];

// A share list: each row's level reads as its words with a small chevron, no box, a ghost button's
// hover, so it stays beside the name on a phone. The keys, the list and the items are a field Select's.
export default function SelectText() {
  return (
    <ul aria-label="Who can use it" {...stylex.props(layout.list)}>
      {people.map((person) => (
        <li key={person.name} {...stylex.props(layout.row)}>
          <Avatar name={person.name} size="sm" decorative>
            <AvatarFallback />
          </Avatar>
          <span {...stylex.props(layout.words)}>
            <Text
              as="span"
              size="sm"
              weight="medium"
              color="default"
              wrap="anywhere"
            >
              {person.name}
            </Text>
            <Text as="span" size="sm" color="muted" wrap="anywhere">
              {person.note}
            </Text>
          </span>
          <Select items={levels} defaultValue={person.level}>
            <SelectTrigger
              size="sm"
              variant="ghost"
              aria-label={`Access for ${person.name}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent />
          </Select>
        </li>
      ))}
    </ul>
  );
}
