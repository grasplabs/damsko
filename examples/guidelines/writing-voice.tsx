import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@grasp-os/ui/components/alert";

import { Not, Pair, Write } from "./pair";

// The same news twice: as a colleague would say it, and as a product says it when it tries to be
// liked.
export default function WritingVoice() {
  return (
    <Pair>
      <Write why="calm, says what to do">
        <Alert variant="warning">
          <AlertTitle>The export is not finished</AlertTitle>
          <AlertDescription>
            It stopped at 214 of 380 rows. Export again to get the rest.
          </AlertDescription>
        </Alert>
      </Write>
      <Not why="cute, and blames">
        <Alert variant="warning">
          <AlertTitle>Whoops! You broke the export</AlertTitle>
          <AlertDescription>
            Something went wrong on your end. Please try again later.
          </AlertDescription>
        </Alert>
      </Not>
    </Pair>
  );
}
