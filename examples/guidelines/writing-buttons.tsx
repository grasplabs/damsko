import { Button } from "@grasp-os/ui/components/button";
import { Icon, SendIcon, TrashIcon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";

import { Not, Pair, Write } from "./pair";
import { writing } from "./writing-fixtures";

// A verb and the thing it acts on: the button promises what happens. Read alone, out of its
// dialog or form, it still says what it does.
export default function WritingButtons() {
  return (
    <Pair>
      <Write why="a verb and the thing">
        <div {...stylex.props(writing.row)}>
          <Button variant="default">Save changes</Button>
          <Button variant="outline">
            <Icon icon={SendIcon} />
            Send invite
          </Button>
          <Button variant="destructive">
            <Icon icon={TrashIcon} />
            Delete project
          </Button>
        </div>
      </Write>
      <Not why="says nothing alone">
        <div {...stylex.props(writing.row)}>
          <Button variant="default">OK</Button>
          <Button variant="outline">Yes</Button>
          <Button variant="destructive">Submit</Button>
        </div>
      </Not>
    </Pair>
  );
}
