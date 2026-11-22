import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@grasp-os/ui/components/alert";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: 12, width: "100%", maxWidth: 560 },
});

// How each is heard, set by `live`: polite waits for the reader, assertive says it at once, off is
// read where it stands. The look stays the variant's.
export default function AlertLive() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Alert live="polite">
        <AlertTitle>Export ready</AlertTitle>
        <AlertDescription>The report is in your downloads.</AlertDescription>
      </Alert>
      <Alert live="assertive" variant="destructive">
        <AlertTitle>The sync stopped</AlertTitle>
        <AlertDescription>Reconnect the drive to go on.</AlertDescription>
      </Alert>
      <Alert live="off" variant="warning">
        <AlertDescription>
          This page shows last week&apos;s numbers until Monday.
        </AlertDescription>
      </Alert>
    </div>
  );
}
