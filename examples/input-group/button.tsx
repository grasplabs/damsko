import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@grasp-os/ui/components/input-group";
import { CopyIcon, Icon, SendIcon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: 20, width: "100%", maxWidth: 384 },
});

const LINK = "https://northwind.example/invite/7f3k";

// A button inside the edge acts on what is in the field: copy a link, send a message.
export default function InputGroupWithButton() {
  // The button says how it went, by a tick once it copied, and keeps its name for an agent.
  const copy = () => navigator.clipboard.writeText(LINK);
  return (
    <div {...stylex.props(layout.stack)}>
      <Field name="invite">
        <FieldLabel>Invite link</FieldLabel>
        <InputGroup>
          <InputGroupInput readOnly defaultValue={LINK} />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              aria-label="Copy link"
              onClick={copy}
              successText="Copied"
              errorText="Could not copy"
            >
              <Icon icon={CopyIcon} />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </Field>
      <InputGroup>
        <InputGroupInput aria-label="Message" placeholder="Write a reply" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton variant="default">
            <Icon icon={SendIcon} />
            Send
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
