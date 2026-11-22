import { Button } from "@grasp-os/ui/components/button";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  list: {
    display: "grid",
    gap: space["2"],
    width: "100%",
    maxWidth: 420,
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space["3"],
  },
  name: {
    fontFamily: font.sans,
    fontSize: font.textSm,
    color: colors.bodyForeground,
  },
});

const projects = ["Spring launch", "Office move", "Hiring plan"];

// The same button on every row: its words stay "Delete", and its name says which row, starting
// with those words, so a voice command ("press Delete") still finds it.
export default function ButtonRows() {
  return (
    <ul {...stylex.props(layout.list)}>
      {projects.map((project) => (
        <li key={project} {...stylex.props(layout.row)}>
          <span {...stylex.props(layout.name)}>{project}</span>
          <Button size="sm" variant="ghost" aria-label={`Delete ${project}`}>
            Delete
          </Button>
        </li>
      ))}
    </ul>
  );
}
