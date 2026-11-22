import { Snippet } from "@grasp-os/ui/components/snippet";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  list: { display: "grid", justifyItems: "start", gap: space[3] },
});

export default function SnippetSizes() {
  return (
    <div {...stylex.props(layout.list)}>
      <Snippet size="sm" value="usr_4f81c2" aria-label="Copy the user ID" />
      <Snippet value="usr_4f81c2" aria-label="Copy the user ID" />
    </div>
  );
}
