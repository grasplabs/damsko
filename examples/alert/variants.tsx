import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@grasp-os/ui/components/alert";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: 12, width: "100%", maxWidth: 560 },
});

export default function AlertVariants() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Alert>
        <AlertTitle>How the score is worked out</AlertTitle>
        <AlertDescription>
          It counts the reviews closed in the selected weeks.
        </AlertDescription>
      </Alert>
      <Alert variant="success">
        <AlertTitle>The export is ready</AlertTitle>
        <AlertDescription>
          The CSV has finished and is ready to download.
        </AlertDescription>
      </Alert>
      <Alert variant="warning">
        <AlertTitle>Almost at this month&apos;s limit</AlertTitle>
        <AlertDescription>
          Two refreshes are left for this workspace.
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>The answers did not load</AlertTitle>
        <AlertDescription>Try again in a moment.</AlertDescription>
      </Alert>
      <Alert variant="info">
        <AlertTitle>Scores update once a day</AlertTitle>
        <AlertDescription>
          Reviews closed today count from tomorrow morning.
        </AlertDescription>
      </Alert>
    </div>
  );
}
