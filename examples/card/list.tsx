import { Card, CardDescription, CardTitle } from "@grasp-os/ui/components/card";
import * as stylex from "@stylexjs/stylex";

const projects = [
  { name: "Quarterly review", note: "Due on Friday." },
  {
    name: "Onboarding guide for the new regional teams in Noord-Holland",
    note: "A long name wraps; the card grows.",
  },
  { name: "Pricing", note: "Waiting for finance." },
];

const layout = stylex.create({
  list: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 16,
    width: "100%",
    margin: 0,
    padding: 0,
  },
});

// Cards in a list: each an <li>, its title a heading, so both a list and its headings can be read.
export default function CardList() {
  return (
    // role="list" keeps it a list for screen readers that drop it when its bullets are hidden.
    <ul {...stylex.props(layout.list)}>
      {projects.map((project) => (
        <Card key={project.name} asChild>
          <li>
            <CardTitle>{project.name}</CardTitle>
            <CardDescription>{project.note}</CardDescription>
          </li>
        </Card>
      ))}
    </ul>
  );
}
