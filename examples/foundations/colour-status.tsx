import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@grasp-os/ui/components/alert";
import { media, space } from "@grasp-os/ui/lib/tokens.stylex";
// Colour, scene: status says it in words. Each tone is a mark and its words, then a soft ground;
// the colour helps, the sentence carries it.
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  grid: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(2, minmax(0, 1fr))",
      [media.maxSm]: "minmax(0, 1fr)",
    },
    gap: space["4"],
    padding: space["6"],
  },
});

export default function ColourStatus() {
  return (
    <div {...stylex.props(styles.grid)}>
      <Alert variant="default">
        <AlertTitle>Sync runs tonight</AlertTitle>
        <AlertDescription>
          Reports refresh at 02:00, as every night.
        </AlertDescription>
      </Alert>
      <Alert variant="success">
        <AlertTitle>Calendar connected</AlertTitle>
        <AlertDescription>Meetings now show in the timeline.</AlertDescription>
      </Alert>
      <Alert variant="warning">
        <AlertTitle>Trial ends in 3 days</AlertTitle>
        <AlertDescription>
          Projects stay as they are after it ends.
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>Sync stopped</AlertTitle>
        <AlertDescription>
          New files are not arriving. Nothing is lost.
        </AlertDescription>
      </Alert>
    </div>
  );
}
