import { AvatarGroup } from "@grasp-os/ui/components/avatar";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  rows: { display: "grid", gap: space[4], justifyItems: "start" },
});

const people = [
  { name: "Lars Visser", src: "/people/avatar-1.svg" },
  { name: "Bas Lam", src: "/people/avatar-2.svg" },
  { name: "Mira Walker" },
  { name: "Tom Becker", src: "/people/avatar-3.svg" },
  { name: "Wim Mulder" },
  { name: "Anna de Vries" },
];

// Initials only, the widest first: MW, WM, MW.
const initials = [
  { name: "Mira Walker" },
  { name: "Wim Mulder" },
  { name: "Mark Wood" },
  { name: "Omar Haddad" },
  { name: "Anna Vos" },
];

// A few people as one stack: up to four faces, then +N for the rest, named once for a screen
// reader. Two, four and six people at xs and sm; then initials only, the widest (MW, WM), so
// no letter is ever cut by the next face.
export default function AvatarGroupExample() {
  return (
    <div {...stylex.props(layout.rows)}>
      <AvatarGroup items={people.slice(0, 2)} />
      <AvatarGroup items={people.slice(0, 4)} />
      <AvatarGroup items={people} />
      <AvatarGroup items={people} size="sm" />
      <AvatarGroup items={initials} />
      <AvatarGroup items={initials} size="sm" />
    </div>
  );
}
