import {
  InputGroup,
  InputGroupAddon,
  InputGroupClear,
  InputGroupInput,
} from "@grasp-os/ui/components/input-group";
import { Icon, SearchIcon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", width: "100%", maxWidth: 384 },
});

// An icon says what goes in; the clear square shows once there is text, and puts the caret back.
export default function InputGroupSearch() {
  return (
    <div {...stylex.props(layout.stack)}>
      <InputGroup>
        <InputGroupAddon>
          <Icon icon={SearchIcon} />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          aria-label="Search projects"
          defaultValue="Spring launch"
        />
        <InputGroupClear aria-label="Clear search" />
      </InputGroup>
    </div>
  );
}
