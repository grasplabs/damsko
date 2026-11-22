import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@grasp-os/ui/components/alert";
import { Button } from "@grasp-os/ui/components/button";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  stack: { display: "grid", gap: 12, width: "100%", maxWidth: 720 },
  again: { justifySelf: "start" },
});

// News about the whole page or the app, across its top: its action after the words, and a close
// button at the end. Closed, it goes at once, and focus goes on to the next control, never to the
// page; here the page can show it again.
export default function AlertBanner() {
  const [shown, setShown] = useState(0);
  return (
    <div {...stylex.props(layout.stack)}>
      <Alert
        key={shown}
        appearance="banner"
        variant="warning"
        onClose={() => {
          // A page would remember it was closed here.
        }}
      >
        <AlertTitle>Scheduled maintenance</AlertTitle>
        <AlertDescription>
          Sign-in is paused on Sunday from 02:00 to 04:00.
        </AlertDescription>
        <AlertAction>
          <Button size="xs" variant="secondary">
            Read more
          </Button>
        </AlertAction>
      </Alert>
      <Alert appearance="subtle" variant="destructive">
        <AlertDescription>The time zone did not save.</AlertDescription>
      </Alert>
      <Button
        size="sm"
        variant="ghost"
        style={layout.again}
        onClick={() => {
          setShown(shown + 1);
        }}
      >
        Show the banner again
      </Button>
    </div>
  );
}
