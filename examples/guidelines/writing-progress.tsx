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
            loadingLabel="Saving"
            successLabel="Saved"
            errorLabel="Not saved"
          >
            Save changes
          </Button>
          <Button
            variant="secondary"
            onClick={invite}
            loadingLabel="Sending"
            successLabel="Sent"
            errorLabel="Not sent"
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
            loadingLabel="Please wait"
            successLabel="Done!"
            errorLabel="Error"
          >
            Save changes
          </Button>
          <Button
            variant="secondary"
            onClick={blank}
            loadingLabel="Please wait"
            successLabel="Success"
            errorLabel="Error"
          >
            <Icon icon={SendIcon} />
            Send invite
          </Button>
        </div>
      </Not>
    </Pair>
  );
}
