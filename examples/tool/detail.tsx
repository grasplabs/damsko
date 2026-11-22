import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@grasp-os/ui/components/tool";
import * as stylex from "@stylexjs/stylex";

import { layout } from "./layout";

const result = `region,customers,churned,rate
North,412,19,4.6%
South,388,25,6.4%
East,201,8,4.0%
West,203,14,6.9%
Central,96,3,3.1%
Online,1204,61,5.1%
Partners,77,2,2.6%`;

// Two calls of one run: one that answered, opening to its query and its rows, and one that
// failed, opening to why.
export default function ToolDetail() {
  return (
    <div {...stylex.props(layout.column)}>
      <Tool>
        <ToolHeader
          name="run_sql"
          title="Queried the warehouse"
          state="output-available"
        />
        <ToolContent>
          <ToolInput
            input={
              "select region, count(*) as customers, sum(churned) as churned\nfrom accounts group by region"
            }
          />
          <ToolOutput output={result} />
        </ToolContent>
      </Tool>
      <Tool>
        <ToolHeader
          name="crm_search"
          title="Looked up the CRM"
          state="output-error"
        />
        <ToolContent>
          <ToolInput input={{ query: "accounts where renewal < 30 days" }} />
          <ToolOutput errorText="The CRM did not answer in 5 seconds. Nothing was changed." />
        </ToolContent>
      </Tool>
    </div>
  );
}
