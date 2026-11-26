import { Button } from "@grasp-os/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@grasp-os/ui/components/card";
import { Text } from "@grasp-os/ui/components/text";
import * as stylex from "@stylexjs/stylex";

const plans = [
  {
    name: "Starter",
    note: "For one person.",
    lines: ["Five projects."],
  },
  {
    name: "Team",
    note: "For a team of up to twenty.",
    lines: [
      "Unlimited projects.",
      "Shared folders and comments.",
      "Every change kept for a year, to look back on or restore.",
    ],
  },
  {
    name: "Business",
    note: "For a whole company.",
    lines: ["Everything in Team.", "Sign-in with your own provider."],
  },
];

const layout = stylex.create({
  // Rows as tall as their tallest card: the cell's height comes from what the cards hold.
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 16,
    width: "100%",
    margin: 0,
    padding: 0,
  },
  lines: { display: "grid", gap: 4 },
});

// Cards side by side, each as tall as its cell: what each holds shows whole and its footer stands at
// the foot, in a row as tall as the tallest card.
export default function CardFullHeight() {
  return (
    <ul {...stylex.props(layout.grid)}>
      {plans.map((plan) => (
        <Card key={plan.name} size="sm" fullHeight asChild>
          <li>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.note}</CardDescription>
            </CardHeader>
            <CardContent>
              <div {...stylex.props(layout.lines)}>
                {plan.lines.map((line) => (
                  <Text key={line} size="sm">
                    {line}
                  </Text>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="outline">
                Choose {plan.name}
              </Button>
            </CardFooter>
          </li>
        </Card>
      ))}
    </ul>
  );
}
