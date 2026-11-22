import {
  CodeBlock,
  CodeBlockContent,
} from "@grasp-os/ui/components/code-block";
import {
  Subagent,
  SubagentContent,
  SubagentHeader,
  SubagentInstructions,
  SubagentOutput,
  SubagentTool,
  SubagentTools,
} from "@grasp-os/ui/components/subagent";
import {
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceTitle,
} from "@grasp-os/ui/components/trace";
import { CircleCheckIcon, Icon } from "@grasp-os/ui/lib/icons";
import { size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  column: { width: "100%", maxWidth: `calc(${size.popupWidth} * 1.6)` },
  found: { margin: 0 },
});

const steps = [
  {
    command: "grep -rn cacheKey scripts",
    stdout:
      "scripts/optimize-images.ts:14:  const cacheKey = process.env.COMMIT_SHA",
  },
  {
    command: "sed -n 13,15p scripts/optimize-images.ts",
    stdout:
      'const cacheDir = ".next/cache/images"\nconst cacheKey = process.env.COMMIT_SHA\nconst cached = await restoreCache(cacheDir, cacheKey)',
  },
  { command: "ls public/images | wc -l", stdout: "1240" },
];

const schema = `type Finding = {
  cause: string;
  files: string[];
};`;

// A run with all it was given and did: how long it took, its model, its task, each tool call
// opening on what it printed, the shape of what it returns and what it found.
export default function SubagentDetails() {
  return (
    <Subagent defaultOpen style={styles.column}>
      <SubagentHeader
        name="Ran the research agent"
        model="research-model-2"
        icon={CircleCheckIcon}
      >
        <TraceDescription>48s</TraceDescription>
      </SubagentHeader>
      <SubagentContent>
        <SubagentInstructions>
          Find out why image optimization reruns on every deploy.
        </SubagentInstructions>
        <SubagentTools>
          {steps.map((step) => (
            <TraceCollapsible key={step.command}>
              <TraceCollapsibleTrigger>
                <SubagentTool>
                  <TraceIcon>
                    <Icon icon={CircleCheckIcon} />
                  </TraceIcon>
                  <TraceTitle>Ran {step.command}</TraceTitle>
                </SubagentTool>
              </TraceCollapsibleTrigger>
              <TraceCollapsibleContent>
                <CodeBlock language="text">
                  <CodeBlockContent wrap maxLines={8}>
                    {step.stdout}
                  </CodeBlockContent>
                </CodeBlock>
              </TraceCollapsibleContent>
            </TraceCollapsible>
          ))}
        </SubagentTools>
        <SubagentOutput schema={schema} />
        <p {...stylex.props(styles.found)}>
          The cache is keyed on the commit SHA, so every deploy misses it and
          optimizes all 1,240 images again.
        </p>
      </SubagentContent>
    </Subagent>
  );
}
