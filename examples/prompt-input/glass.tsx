"use client";

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@grasp-os/ui/components/prompt-input";
import { colors, font, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  // A page that scrolls behind the prompt input at its foot.
  page: {
    position: "relative",
    width: "100%",
    maxWidth: size.promptInputWidth,
  },
  words: {
    margin: 0,
    paddingBlockEnd: space["12"],
    color: colors.foreground,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
  },
  foot: {
    position: "absolute",
    insetInline: 0,
    bottom: 0,
  },
});

// Over what scrolls behind it, as at a chat's foot: the card's colour most of the way, over a
// blur of the words under it.
export default function PromptInputGlass() {
  return (
    <div {...stylex.props(styles.page)}>
      <p {...stylex.props(styles.words)}>
        Seat prices held at 12 a seat through the spring, while churn among
        teams of fewer than ten fell for the third month running. The pilot at
        13 a seat ran in two regions and ends on the last day of the quarter;
        its first figures arrive the week after.
      </p>
      <div {...stylex.props(styles.foot)}>
        <PromptInput variant="glass" compact onSubmit={() => undefined}>
          <PromptInputBody>
            <PromptInputTextarea
              aria-label="Message"
              placeholder="Ask a follow-up"
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputSubmit />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
