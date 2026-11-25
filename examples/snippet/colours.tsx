import { Snippet } from "@grasp-os/ui/components/snippet";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  list: {
    display: "grid",
    justifyItems: "start",
    gap: space[2],
    // On a touch screen each control's target reaches the middle of the gap to the next.
    "--tap-room-block": `calc(${space[2]} / 2)`,
  },
});

const tokens = ["--damsko-mint", "--damsko-foreground", "--damsko-background"];

export default function SnippetColours() {
  return (
    <div {...stylex.props(layout.list)}>
      {tokens.map((name) => (
        <Snippet
          key={name}
          size="sm"
          value={name}
          aria-label={`Copy ${name}`}
          swatch={`var(${name})`}
        />
      ))}
    </div>
  );
}
