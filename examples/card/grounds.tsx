import { Card, CardDescription, CardTitle } from "@grasp-os/ui/components/card";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
    width: "100%",
  },
});

// The default is the usual card, lifted off the page. Outline is a quiet panel that lies in it.
export default function CardGrounds() {
  return (
    <div {...stylex.props(layout.grid)}>
      <Card>
        <CardTitle>Default</CardTitle>
        <CardDescription>The usual card, lifted off the page.</CardDescription>
      </Card>
      <Card variant="outline">
        <CardTitle>Outline</CardTitle>
        <CardDescription>A quiet panel that lies in the page.</CardDescription>
      </Card>
    </div>
  );
}
