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
import { CircleCheckIcon, Icon, WrenchIcon } from "@grasp-os/ui/lib/icons";
import {
  colors,
  media,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  column: {
    display: "grid",
    gap: space["3"],
    width: "100%",
    maxWidth: `calc(${size.popupWidth} * 1.6)`,
  },
  // The call's card: a hairline round it, its trigger and content inset by the row's padding.
  card: {
    display: "grid",
    boxSizing: "border-box",
    width: "100%",
    minWidth: 0,
    paddingInline: size.collapsiblePadding,
    borderWidth: size.hairline,
    borderStyle: "solid",
    borderColor: { default: colors.border, [media.forcedColors]: "CanvasText" },
    borderRadius: radius.base,
    cornerShape: radius.shape,
  },
  // The trigger holds to its start, only as wide as its line and chevron.
  start: { justifySelf: "start" },
  // The line stands a step clear of the card's edge above and below.
  roomy: { marginBlock: space["2"] },
  content: {
    display: "grid",
    rowGap: space["3"],
    minWidth: 0,
    paddingBlockEnd: space["2"],
  },
});

const input = { query: "competitor pricing pages", limit: 5 };
const output = {
  results: [
    { title: "Pricing · Northwind", url: "northwind.example/pricing" },
    { title: "Plans · Fabrikam", url: "fabrikam.example/plans" },
  ],
};
const inputCode = JSON.stringify(input, null, 2);
const outputCode = JSON.stringify(output, null, 2);

// One finished tool call in a card: its mark, what it did and its state, opening on what went in
// and what came back.
export default function TraceTool() {
  return (
    <div {...stylex.props(styles.column)}>
      <div {...stylex.props(styles.card)}>
        <Trace>
          <TraceCollapsible>
            <TraceCollapsibleTrigger style={styles.start}>
              <TraceLine style={styles.roomy}>
                <TraceIcon>
                  <Icon icon={WrenchIcon} />
                </TraceIcon>
                <TraceTitle>Searched the web</TraceTitle>
                <Badge size="sm" variant="success" icon={CircleCheckIcon}>
                  Completed
                </Badge>
              </TraceLine>
            </TraceCollapsibleTrigger>
            <TraceCollapsibleContent>
              <div {...stylex.props(styles.content)}>
                <CodeBlock language="json">
                  <CodeBlockHeader>
                    <CodeBlockTitle>Input</CodeBlockTitle>
                    <CodeBlockActions>
                      <CodeBlockCopyButton value={inputCode} />
                    </CodeBlockActions>
                  </CodeBlockHeader>
                  <CodeBlockContent wrap maxLines={12}>
                    {inputCode}
                  </CodeBlockContent>
                </CodeBlock>
                <CodeBlock language="json">
                  <CodeBlockHeader>
                    <CodeBlockTitle>Output</CodeBlockTitle>
                    <CodeBlockActions>
                      <CodeBlockCopyButton value={outputCode} />
                    </CodeBlockActions>
                  </CodeBlockHeader>
                  <CodeBlockContent wrap maxLines={12}>
                    {outputCode}
                  </CodeBlockContent>
                </CodeBlock>
              </div>
            </TraceCollapsibleContent>
          </TraceCollapsible>
        </Trace>
      </div>
    </div>
  );
}
