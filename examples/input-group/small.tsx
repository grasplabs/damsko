import { Badge } from "@grasp-os/ui/components/badge";
import { Input } from "@grasp-os/ui/components/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@grasp-os/ui/components/input-group";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  row: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
    maxWidth: 520,
  },
  grow: { flexGrow: 1, flexBasis: 0, minWidth: 0 },
});

// In a settings row, a field that holds a badge beside a plain small Input: the same 32px height and
// the same words.
export default function InputGroupSmall() {
  return (
    <div {...stylex.props(layout.row)}>
      <Input
        size="sm"
        aria-label="Workspace name"
        defaultValue="Contoso Finance"
        style={layout.grow}
      />
      <InputGroup size="sm" style={layout.grow}>
        <InputGroupInput
          aria-label="Workspace address"
          defaultValue="contoso"
        />
        <InputGroupAddon align="inline-end">
          <Badge>Pro</Badge>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
