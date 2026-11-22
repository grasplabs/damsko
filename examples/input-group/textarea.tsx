import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@grasp-os/ui/components/input-group";
import { Icon, SendIcon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", width: "100%", maxWidth: 420 },
});

// Several lines with an addon under them (`align="block-end"`): what the message is for, and Send.
export default function InputGroupWithTextarea() {
  return (
    <div {...stylex.props(layout.stack)}>
      <InputGroup>
        <InputGroupTextarea
          aria-label="Reply"
          placeholder="Write a reply to the team"
        />
        <InputGroupAddon align="block-end">
          <InputGroupText>Everyone in Finance sees it</InputGroupText>
          <InputGroupButton variant="default" size="xs">
            <Icon icon={SendIcon} />
            Send
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
