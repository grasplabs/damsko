import {
  Test,
  TestResults,
  TestResultsContent,
  TestResultsHeader,
  TestResultsProgress,
} from "@grasp-os/ui/components/test-results";
import * as stylex from "@stylexjs/stylex";

import { layout } from "./layout";

// A run where every test passed stays closed: its line says how many ran and how long it took.
// Open, a bar shows how many passed above the tests and their times.
export default function TestResultsPassed() {
  return (
    <div {...stylex.props(layout.column)}>
      <TestResults
        summary={{ passed: 4, failed: 0, skipped: 0, total: 4, duration: 1840 }}
      >
        <TestResultsHeader />
        <TestResultsContent>
          <TestResultsProgress />
          <Test name="adds an item to the cart" status="passed" duration={41} />
          <Test name="removes an item" status="passed" duration={63} />
          <Test name="applies a discount code" status="passed" duration={212} />
          <Test name="charges the saved card" status="passed" duration={1524} />
        </TestResultsContent>
      </TestResults>
    </div>
  );
}
