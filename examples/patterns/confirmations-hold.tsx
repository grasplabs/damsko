import { HoldButton } from "@grasp-os/ui/components/hold-button";
import { Icon, TrashIcon } from "@grasp-os/ui/lib/icons";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: space["3"],
  },
  words: { color: colors.mutedForeground, fontSize: font.textSm },
});

// A stand-in for the real request: it takes a moment, so the button shows that it is working.
const deleteDraft = () => new Promise((resolve) => setTimeout(resolve, 1200));

// What cannot be undone but is small asks with a hold, not a dialog: the press itself is the yes.
// A click asks in a small popover instead, for anyone who cannot hold.
export default function ConfirmationsHold() {
  return (
    <div {...stylex.props(layout.row)}>
      <span {...stylex.props(layout.words)}>Supplier notes, draft</span>
      <HoldButton
        variant="destructive"
        onConfirm={deleteDraft}
        loadingLabel="Deleting"
        successLabel="Deleted"
        errorLabel="Not deleted"
      >
        <Icon icon={TrashIcon} />
        Delete draft
      </HoldButton>
    </div>
  );
}
