import { Button } from "@grasp-os/ui/components/button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverFooter,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@grasp-os/ui/components/popover";
import { useState } from "react";

// A stand-in for a check that finds a fault: it sends nothing, so it does not say "Not sent". Given
// no errorLabel of its own, the button says the catalogue's neutral words, and the popover stays open.
const check = () =>
  new Promise((_, reject) =>
    setTimeout(() => {
      reject(new Error("The address did not answer."));
    }, 600)
  );

export default function PopoverCheckFailed() {
  const [open, setOpen] = useState(false);
  const test = async () => {
    await check();
    setOpen(false);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="secondary">Test the connection</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Test the connection</PopoverTitle>
          <PopoverDescription>
            It asks the address once and says whether it answered.
          </PopoverDescription>
        </PopoverHeader>
        <PopoverFooter>
          <PopoverClose asChild>
            <Button variant="outline">Cancel</Button>
          </PopoverClose>
          <Button variant="default" onClick={test} loadingLabel="Testing">
            Test
          </Button>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
}
