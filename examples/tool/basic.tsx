import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@grasp-os/ui/components/tool";
import * as stylex from "@stylexjs/stylex";

import { layout } from "./layout";

// One finished call: its header names the tool and says it is done. A press opens what went in
// and what came back.
export default function ToolBasic() {
  return (
    <div {...stylex.props(layout.column)}>
      <Tool>
        <ToolHeader
          name="web_search"
          title="Searched the web"
          state="output-available"
        />
        <ToolContent>
          <ToolInput input={{ query: "competitor pricing pages", limit: 5 }} />
          <ToolOutput
            output={{
              results: [
                {
                  title: "Pricing · Northwind",
                  url: "northwind.example/pricing",
                },
                { title: "Plans · Fabrikam", url: "fabrikam.example/plans" },
              ],
            }}
          />
        </ToolContent>
      </Tool>
    </div>
  );
}
