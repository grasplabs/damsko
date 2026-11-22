import { Button } from "@grasp-os/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@grasp-os/ui/components/card";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 560 },
  facts: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: space[4],
    margin: 0,
  },
  label: { color: colors.mutedForeground, fontSize: font.textSm },
  figure: {
    margin: 0,
    fontSize: font.headingSm,
    lineHeight: font.headingSmLine,
    fontVariantNumeric: "tabular-nums",
  },
});

// The export works a moment, then says it is done (a press always answers).
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// A part of a page on a card: a title, a sentence and the part's own button over what it holds,
// then a line at its foot. The card is a section, named by its title.
export default function CardSection() {
  const exporting = () => wait(900);
  return (
    <div {...stylex.props(layout.box)}>
      <Card asChild>
        <section>
          <CardHeader>
            <CardTitle level={2}>Usage</CardTitle>
            <CardDescription>Seats and storage this month.</CardDescription>
            <CardAction>
              <Button
                size="sm"
                variant="secondary"
                onClick={exporting}
                successLabel="Exported"
                errorLabel="Not exported"
              >
                Export
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <dl {...stylex.props(layout.facts)}>
              <div>
                <dt {...stylex.props(layout.label)}>Seats</dt>
                <dd {...stylex.props(layout.figure)}>18 of 25</dd>
              </div>
              <div>
                <dt {...stylex.props(layout.label)}>Storage</dt>
                <dd {...stylex.props(layout.figure)}>42 GB</dd>
              </div>
            </dl>
          </CardContent>
          <CardFooter>Updated 10 minutes ago</CardFooter>
        </section>
      </Card>
    </div>
  );
}
