import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@grasp-os/ui/components/avatar";
import * as stylex from "@stylexjs/stylex";

const people = ["Tijn", "Lars", "Bas", "Koen"];

const layout = stylex.create({
  list: { display: "grid", gap: 12, margin: 0, padding: 0, listStyle: "none" },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontSize: 14,
    lineHeight: "20px",
    minWidth: 0,
  },
  name: { minWidth: 0, overflowWrap: "anywhere" },
});

// Beside its own name, the avatar is decorative, so the name is said once.
export default function AvatarBesideAName() {
  return (
    <ul aria-label="Reviewers" {...stylex.props(layout.list)}>
      {people.map((person, index) => (
        <li key={person} {...stylex.props(layout.row)}>
          <Avatar size="sm" name={person} decorative>
            <AvatarImage src={`/people/avatar-${index + 1}.svg`} />
            <AvatarFallback />
          </Avatar>
          <span {...stylex.props(layout.name)}>{person}</span>
        </li>
      ))}
    </ul>
  );
}
