import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@grasp-os/ui/components/input-group";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: 16, width: "100%", maxWidth: 384 },
});

// The heights of Input and Button: 36px by default, 44px where a form has room.
export default function InputGroupSizes() {
  return (
    <div {...stylex.props(layout.stack)}>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>@</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          aria-label="Username, default"
          placeholder="alex.morgan"
        />
      </InputGroup>
      <InputGroup size="lg">
        <InputGroupAddon>
          <InputGroupText>@</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          aria-label="Username, large"
          placeholder="alex.morgan"
        />
      </InputGroup>
    </div>
  );
}
