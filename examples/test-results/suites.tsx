import {
  Test,
  TestError,
  TestErrorMessage,
  TestErrorStack,
  TestResults,
  TestResultsContent,
  TestResultsHeader,
  TestSuite,
  TestSuiteContent,
  TestSuiteName,
  TestSuiteStats,
} from "@grasp-os/ui/components/test-results";
import type { TestResultStatus } from "@grasp-os/ui/components/test-results";
import * as stylex from "@stylexjs/stylex";

import { layout } from "./layout";

interface Result {
  name: string;
  status: TestResultStatus;
  duration: number;
  error?: { message: string; stack: string };
}

const suites: { name: string; tests: Result[] }[] = [
  {
    name: "auth.test.ts",
    tests: [
      {
        name: "logs in with valid credentials",
        status: "passed",
        duration: 38,
      },
      { name: "rejects an invalid password", status: "passed", duration: 21 },
      { name: "refreshes an expired token", status: "passed", duration: 64 },
    ],
  },
  {
    name: "user-api.test.ts",
    tests: [
      { name: "creates a user", status: "passed", duration: 112 },
      {
        name: "updates a user profile",
        status: "failed",
        duration: 240,
        error: {
          message: "Expected status 200, received 500",
          stack: "at Object.<anonymous> (src/user-api.test.ts:45:12)",
        },
      },
      { name: "deletes a user", status: "skipped", duration: 0 },
    ],
  },
  {
    name: "db.test.ts",
    tests: [
      { name: "connects to the database", status: "passed", duration: 18 },
      {
        name: "times out a slow query",
        status: "failed",
        duration: 5000,
        error: {
          message: "Exceeded timeout of 5000 ms for a test.",
          stack: "at Object.<anonymous> (src/db.test.ts:22:3)",
        },
      },
    ],
  },
];

const count = (tests: Result[], status: TestResultStatus) =>
  tests.filter((test) => test.status === status).length;

const all = suites.flatMap((suite) => suite.tests);

// Tests grouped by file: each suite a row with its counts, open when it has a failure. A skipped
// test says so in its name.
export default function TestResultsSuites() {
  return (
    <div {...stylex.props(layout.column)}>
      <TestResults
        summary={{
          passed: count(all, "passed"),
          failed: count(all, "failed"),
          skipped: count(all, "skipped"),
          total: all.length,
          duration: all.reduce((sum, test) => sum + test.duration, 0),
        }}
      >
        <TestResultsHeader />
        <TestResultsContent>
          {suites.map((suite) => (
            <TestSuite
              key={suite.name}
              name={suite.name}
              status={count(suite.tests, "failed") > 0 ? "failed" : "passed"}
            >
              <TestSuiteName>
                <TestSuiteStats
                  passed={count(suite.tests, "passed")}
                  failed={count(suite.tests, "failed")}
                  skipped={count(suite.tests, "skipped")}
                />
              </TestSuiteName>
              <TestSuiteContent>
                {suite.tests.map((test) => (
                  <Test
                    key={test.name}
                    name={test.name}
                    status={test.status}
                    duration={
                      test.status === "skipped" ? undefined : test.duration
                    }
                  >
                    {test.error === undefined ? undefined : (
                      <TestError>
                        <TestErrorMessage>
                          {test.error.message}
                        </TestErrorMessage>
                        <TestErrorStack>{test.error.stack}</TestErrorStack>
                      </TestError>
                    )}
                  </Test>
                ))}
              </TestSuiteContent>
            </TestSuite>
          ))}
        </TestResultsContent>
      </TestResults>
    </div>
  );
}
