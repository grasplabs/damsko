import { Button } from "@grasp-os/ui/components/button";
import {
  ButtonGroup,
  ButtonGroupText,
} from "@grasp-os/ui/components/button-group";
import { Label } from "@grasp-os/ui/components/label";
import { useState } from "react";

const steps = [50, 75, 100, 125, 150];

// Words in the group beside its buttons. With `asChild` they are the element given, here a Label
// that names the value it stands before, with the text's look.
export default function ButtonGroupTextExample() {
  const [at, setAt] = useState(2);
  return (
    <ButtonGroup aria-label="Zoom">
      <ButtonGroupText asChild>
        <Label htmlFor="zoom-level">Zoom</Label>
      </ButtonGroupText>
      <Button
        variant="ghost"
        disabled={at === 0}
        onClick={() => {
          setAt(at - 1);
        }}
      >
        Out
      </Button>
      <Button id="zoom-level" variant="ghost">
        {`${String(steps[at] ?? 100)}%`}
      </Button>
      <Button
        variant="ghost"
        disabled={at === steps.length - 1}
        onClick={() => {
          setAt(at + 1);
        }}
      >
        In
      </Button>
    </ButtonGroup>
  );
}
