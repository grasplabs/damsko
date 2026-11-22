import { Field } from "@grasp-os/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@grasp-os/ui/components/input-group";
import { CopyIcon, Icon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  frame: { width: 168, maxWidth: "100%" },
});

// One input group in one state. The docs draw it once per state; hover, keyboard focus and a
// pressed button are forced from the group's own CSS. In a product, a Field around it sets
// `data-invalid` and `disabled`; `button` adds a Copy button inside the edge.
export default function InputGroupState({
  value,
  invalid = false,
  readOnly = false,
  disabled = false,
  button = false,
}: {
  value?: string;
  invalid?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  button?: boolean;
}) {
  return (
    <div {...stylex.props(layout.frame)}>
      <Field data-invalid={invalid || undefined} disabled={disabled}>
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>@</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Username"
            placeholder="alex.morgan"
            defaultValue={value}
            readOnly={readOnly}
          />
          {button && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton aria-label="Copy username" disabled={disabled}>
                <Icon icon={CopyIcon} />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>
      </Field>
    </div>
  );
}
