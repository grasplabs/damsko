import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtImage,
  ChainOfThoughtStep,
} from "@grasp-os/ui/components/chain-of-thought";
import { ChartColumnIcon } from "@grasp-os/ui/lib/icons";
import { size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  column: { width: "100%", maxWidth: `calc(${size.popupWidth} * 1.6)` },
  picture: { display: "block", maxWidth: "100%", height: "auto" },
});

// A step that made a picture shows it under its line, with a quiet caption.
export default function ChainOfThoughtImageExample() {
  return (
    <ChainOfThought defaultOpen style={layout.column}>
      <ChainOfThoughtHeader>Read 1 file and made a chart</ChainOfThoughtHeader>
      <ChainOfThoughtContent>
        <ChainOfThoughtStep
          label="Read churn-q3.csv"
          description="1,204 rows"
        />
        <ChainOfThoughtStep label="Made a chart" icon={ChartColumnIcon}>
          <ChainOfThoughtImage caption="Churn by quarter, the last four quarters">
            <img
              src="/media/quarter-chart.png"
              alt="A bar chart of churn by quarter"
              width={240}
              height={160}
              {...stylex.props(layout.picture)}
            />
          </ChainOfThoughtImage>
        </ChainOfThoughtStep>
      </ChainOfThoughtContent>
    </ChainOfThought>
  );
}
