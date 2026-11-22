import {
  Test,
  TestError,
  TestErrorMessage,
  TestErrorStack,
  TestResults,
  TestResultsContent,
  TestResultsHeader,
} from "@grasp-os/ui/components/test-results";
import * as stylex from "@stylexjs/stylex";

import { layout } from "./layout";

// A run that failed: its line counts the tests and is open on them; the failed test is open on
// its error.
export default function TestResultsBasic() {
  return (
    <div {...stylex.props(layout.column)}>
      <TestResults summary={{ passed: 4, failed: 1, skipped: 0, total: 5 }}>
        <TestResultsHeader />
        <TestResultsContent>
          <Test name="formats a price in USD" status="passed" />
          <Test name="formats a price in EUR" status="passed" />
          <Test name="rounds to two decimals" status="failed" defaultOpen>
            <TestError>
              <TestErrorMessage>
                Expected "$10.13", received "$10.125"
              </TestErrorMessage>
              <TestErrorStack>
                at Object.&lt;anonymous&gt; (src/format-price.test.ts:31:18)
              </TestErrorStack>
            </TestError>
          </Test>
          <Test name="formats zero as free" status="passed" />
          <Test name="rejects a negative price" status="passed" />
        </TestResultsContent>
      </TestResults>
    </div>
  );
}
