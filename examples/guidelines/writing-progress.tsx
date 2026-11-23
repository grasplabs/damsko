import { Button } from "@grasp-os/ui/components/button";
import { Icon, SendIcon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";

import { Not, Pair, Write } from "./pair";
import { writing } from "./writing-fixtures";

// Stand-ins for real requests: one that works and one that fails.
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const saveChanges = () => wait(1200);
const sendInvite = async () => {
  await wait(1200);
  throw new Error("The invite was not sent.");
};

// Press each one. The button says it is working, then how it went, in the action's own words:
// Saved, Could not send. Wrong: the same work, said as Done! and Error.
export default function WritingProgress() {
  const save = saveChanges;
  const invite = sendInvite;
  const vague = saveChanges;
  const blank = sendInvite;
  return (
    <Pair>
      <Write why="the action's own words">
        <div {...stylex.props(writing.row)}>
          <Button
            variant="default"
            onClick={save}
            loadingText="Saving"
            successText="Saved"
            errorText="Not saved"
          >
            Save changes
          </Button>
          <Button
            variant="outline"
            onClick={invite}
            loadingText="Sending"
            successText="Sent"
            errorText="Not sent"
          >
            <Icon icon={SendIcon} />
            Send invite
          </Button>
        </div>
      </Write>
      <Not why="could be any action">
        <div {...stylex.props(writing.row)}>
          <Button
            variant="default"
            onClick={vague}
            loadingText="Please wait"
            successText="Done!"
            errorText="Error"
          >
            Save changes
          </Button>
          <Button
            variant="outline"
            onClick={blank}
            loadingText="Please wait"
            successText="Success"
            errorText="Error"
          >
            <Icon icon={SendIcon} />
            Send invite
          </Button>
        </div>
      </Not>
    </Pair>
  );
}
