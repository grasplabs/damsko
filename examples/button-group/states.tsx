import { Button } from "@grasp-os/ui/components/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@grasp-os/ui/components/button-group";
import type { ActionStatus } from "@grasp-os/ui/hooks/use-action";
import { ChevronDownIcon, Icon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";

const look = stylex.create({
  // Takes no box of its own: the group lays out the button inside it as its own child.
  only: { display: "contents" },
});

// One split button in one state. The docs draw it once per state. Hover, keyboard focus and
// pressed are forced from the buttons' own CSS onto Send only, as a pointer or the keyboard would
// have them: one button at a time, never both. In a product a Button whose press returns a Promise shows it by itself.
export default function ButtonGroupState({
  status = "idle",
  disabled = false,
  forced,
}: {
  status?: ActionStatus;
  disabled?: boolean;
  forced?: "hover" | "focus-visible" | "active";
}) {
  return (
    <ButtonGroup aria-label="Send">
      <span data-force={forced} {...stylex.props(look.only)}>
        <Button
          variant="ghost"
          status={status}
          successLabel="Sent"
          errorLabel="Not sent"
          disabled={disabled}
        >
          Send
        </Button>
      </span>
      <ButtonGroupSeparator />
      <Button
        variant="ghost"
        size="icon"
        aria-label="More ways to send"
        disabled={disabled}
      >
        <Icon icon={ChevronDownIcon} />
      </Button>
    </ButtonGroup>
  );
}
