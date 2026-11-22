import { Button } from "@grasp-os/ui/components/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@grasp-os/ui/components/card";
import { Text } from "@grasp-os/ui/components/text";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  card: { width: "100%", maxWidth: 400 },
  end: { marginInlineStart: "auto" },
});

// shadcn's parts: a header with its action at the end, what the card holds, and a footer.
export default function CardParts() {
  return (
    <Card padding="lg" style={layout.card}>
      <CardHeader>
        <CardTitle>Storage</CardTitle>
        <CardDescription>12 of 50 GB used this month.</CardDescription>
        <CardAction>
          <Button size="sm" variant="secondary">
            Manage
          </Button>
        </CardAction>
      </CardHeader>
      <Text size="sm" color="muted">
        Files older than a year move to the archive on the first of the month.
      </Text>
      <CardFooter>
        <Button size="sm" variant="default">
          Upgrade
        </Button>
        <Text size="sm" color="muted" style={layout.end}>
          Renews 1 December
        </Text>
      </CardFooter>
    </Card>
  );
}
