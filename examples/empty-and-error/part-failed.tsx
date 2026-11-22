import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@grasp-os/ui/components/alert";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: 12, width: "100%", maxWidth: 560 },
});

// The page loaded and one part of it did not: a note where that part would be, the rest stays.
export default function PartFailed() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Alert variant="destructive">
        <AlertTitle>The weekly figures did not load</AlertTitle>
        <AlertDescription>
          The rest of the report is up to date. Open the page again to retry.
        </AlertDescription>
      </Alert>
      <Alert variant="warning">
        <AlertTitle>Two sources are still syncing</AlertTitle>
        <AlertDescription>
          Their projects will appear here when they finish.
        </AlertDescription>
      </Alert>
    </div>
  );
}
