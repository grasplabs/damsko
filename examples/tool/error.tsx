import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@grasp-os/ui/components/tool";
import * as stylex from "@stylexjs/stylex";

import { layout } from "./layout";

// A call that failed, open: why it failed stands in the output's place, named Error.
export default function ToolError() {
  return (
    <div {...stylex.props(layout.column)}>
      <Tool defaultOpen>
        <ToolHeader
          name="read_file"
          title="Read pricing.xlsx"
          state="output-error"
        />
        <ToolContent>
          <ToolInput input={{ path: "finance/pricing.xlsx" }} />
          <ToolOutput errorText="The file is locked by another editor. Try again once they close it." />
        </ToolContent>
      </Tool>
    </div>
  );
}
