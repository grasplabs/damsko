import { Badge } from "@grasp-os/ui/components/badge";
import * as stylex from "@stylexjs/stylex";

import { Not, Pair, Write } from "./pair";
import { writing } from "./writing-fixtures";

// A state said in a word, the same word wherever it is shown. Wrong: one state, finished, said
// three ways, so a reader wonders whether they differ.
export default function WritingStatus() {
  return (
    <Pair>
      <Write why="one word for each state">
        <div {...stylex.props(writing.row)}>
          <Badge variant="success">Ready</Badge>
          <Badge>Draft</Badge>
          <Badge variant="destructive">Failed</Badge>
        </div>
      </Write>
      <Not why="one state, three words">
        <div {...stylex.props(writing.row)}>
          <Badge variant="success">Done</Badge>
          <Badge variant="success">Complete</Badge>
          <Badge variant="success">Finished</Badge>
        </div>
      </Not>
    </Pair>
  );
}
