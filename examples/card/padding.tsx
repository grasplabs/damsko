import { Card, CardDescription, CardTitle } from "@grasp-os/ui/components/card";
import * as stylex from "@stylexjs/stylex";

const people = ["Anna de Vries", "Sanne Bakker", "Joris Smit"];

const layout = stylex.create({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
    width: "100%",
  },
  rows: { margin: 0, padding: 0, listStyle: "none" },
  row: {
    paddingBlock: 10,
    paddingInline: 16,
    fontSize: 14,
    lineHeight: "20px",
    borderTop: "1px solid rgba(0,0,0,0.06)",
  },
  first: { borderTop: "none" },
});

// default for a grid of many, lg for one that stands alone, none for rows that run to the edge.
export default function CardPadding() {
  return (
    <div {...stylex.props(layout.grid)}>
      <Card padding="default">
        <CardTitle>Design review</CardTitle>
        <CardDescription>16px inside.</CardDescription>
      </Card>
      <Card padding="lg">
        <CardTitle>Launch plan</CardTitle>
        <CardDescription>24px inside.</CardDescription>
      </Card>
      <Card padding="none">
        <ul aria-label="Reviewers" {...stylex.props(layout.rows)}>
          {people.map((person, index) => (
            <li
              key={person}
              {...stylex.props(layout.row, index === 0 && layout.first)}
            >
              {person}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
