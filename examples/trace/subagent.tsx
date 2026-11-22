import { Badge } from "@grasp-os/ui/components/badge";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@grasp-os/ui/components/code-block";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@grasp-os/ui/components/trace";
import { CircleCheckIcon, Icon } from "@grasp-os/ui/lib/icons";
import { size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  column: { width: "100%", maxWidth: `calc(${size.popupWidth} * 1.6)` },
  // What opens under the run's line, a step apart.
  content: {
    display: "grid",
    rowGap: space["3"],
    minWidth: 0,
    paddingBlockEnd: space["2"],
  },
  found: { margin: 0 },
});

const calls = [
  "Ran grep -rn cacheKey scripts",
  "Ran sed -n 13,15p scripts/optimize-images.ts",
];

const output = JSON.stringify(
  {
    cause: "The cache is keyed on the commit SHA.",
    files: ["scripts/optimize-images.ts"],
  },
  null,
  2
);

// A run handed to another agent, as a run inside the run: one row, its line the run and the model
// it ran on, open on the tool calls that agent made, what it returned and what it found.
export default function TraceSubagent() {
  return (
    <Trace style={styles.column}>
      <TraceCollapsible defaultOpen>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon>
              <Icon icon={CircleCheckIcon} />
            </TraceIcon>
            <TraceTitle>Ran the research agent</TraceTitle>
            <Badge size="sm">research-model-2</Badge>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <div {...stylex.props(styles.content)}>
            <Trace>
              {calls.map((call) => (
                <TraceLine key={call}>
                  <TraceIcon>
                    <Icon icon={CircleCheckIcon} />
                  </TraceIcon>
                  <TraceTitle>{call}</TraceTitle>
                </TraceLine>
              ))}
            </Trace>
            <CodeBlock language="json">
              <CodeBlockHeader>
                <CodeBlockTitle>Output</CodeBlockTitle>
                <CodeBlockActions>
                  <CodeBlockCopyButton value={output} />
                </CodeBlockActions>
              </CodeBlockHeader>
              <CodeBlockContent wrap maxLines={12}>
                {output}
              </CodeBlockContent>
            </CodeBlock>
            <p {...stylex.props(styles.found)}>
              The cache is keyed on the commit SHA.
            </p>
          </div>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  );
}
