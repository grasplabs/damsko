import { Card, CardDescription, CardTitle } from "@grasp-os/ui/components/card";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  card: { width: "100%", maxWidth: 320 },
});

export default function CardBasic() {
  return (
    <Card style={layout.card}>
      <CardTitle>Quarterly review</CardTitle>
      <CardDescription>
        Due on Friday. Three people are working on it.
      </CardDescription>
    </Card>
  );
}
