import {
  colors,
  font,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

// A plain stand-in for a message, for these examples only: Message is its own component.
export interface Turn {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const styles = stylex.create({
  message: {
    display: "grid",
    gap: space["1"],
    maxWidth: "36rem",
    fontFamily: font.sans,
  },
  user: { marginInlineStart: "auto", justifyItems: "end" },
  author: {
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
  },
  text: {
    margin: 0,
    paddingBlock: space["2"],
    paddingInline: space["3"],
    borderRadius: `min(${radius.base}, ${space["4"]})`,
    cornerShape: radius.shape,
    backgroundColor: colors.muted,
    color: colors.bodyForeground,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },
  userText: { backgroundColor: colors.card, boxShadow: size.borderStrong },
});

export function StandInMessage({ turn }: { turn: Turn }) {
  const user = turn.role === "user";
  return (
    <article {...stylex.props(styles.message, user && styles.user)}>
      <span {...stylex.props(styles.author)}>{user ? "You" : "Assistant"}</span>
      <p {...stylex.props(styles.text, user && styles.userText)}>{turn.text}</p>
    </article>
  );
}

// Not a stage of its own: the examples' stand-in, drawn once here so the file is an example too.
export default function StandIn() {
  return (
    <StandInMessage
      turn={{
        id: "1",
        role: "assistant",
        text: "A message, as Message will draw it.",
      }}
    />
  );
}
