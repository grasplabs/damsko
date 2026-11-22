import { Card, CardDescription } from "@grasp-os/ui/components/card";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  card: { width: 112 },
  // With no padding the card still stands as tall as its padded neighbours, its words on its edge.
  fill: { display: "grid", alignItems: "center", minHeight: 52 },
});

// One card in one state. The docs draw it on each ground and with each padding, holding one line
// so it fits its cell. A card has no hover, focus or press of its own: what it holds does.
export default function CardState({
  variant = "default",
  padding = "default",
}: {
  variant?: "default" | "outline";
  padding?: "none" | "default" | "lg";
}) {
  return (
    <Card variant={variant} padding={padding} style={layout.card}>
      {padding === "none" ? (
        <div {...stylex.props(layout.fill)}>
          <CardDescription>Review</CardDescription>
        </div>
      ) : (
        <CardDescription>Review</CardDescription>
      )}
    </Card>
  );
}
