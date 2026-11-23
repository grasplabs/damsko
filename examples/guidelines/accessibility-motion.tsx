import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@grasp-os/ui/components/collapsible";
import { Spinner } from "@grasp-os/ui/components/spinner";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  column: {
    display: "grid",
    gap: space["5"],
    width: "100%",
    maxWidth: 360,
    minWidth: 0,
  },
  working: {
    display: "flex",
    alignItems: "center",
    gap: space["2"],
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
  },
});

// Open the collapsible: it grows to its height in the system's time. Ask the system for reduced
// motion and it is simply open, at once. The spinner turns; with reduced motion it stands still and
// breathes, a slow fade, so it still says it works.
export default function AccessibilityMotion() {
  return (
    <div {...stylex.props(styles.column)}>
      <Collapsible>
        <CollapsibleTrigger>What reduced motion changes</CollapsibleTrigger>
        <CollapsibleContent>
          Every time the system gives becomes 0s. What would slide, grow or fade
          is simply there.
        </CollapsibleContent>
      </Collapsible>
      <p role="status" {...stylex.props(styles.working)}>
        <Spinner />
        Loading the report
      </p>
    </div>
  );
}
