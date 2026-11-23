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

// A stand-in for the real request: it takes a moment, so the action shows that it is working.
const publishReport = () => new Promise((resolve) => setTimeout(resolve, 1200));

// The action is a Button whose press returns a Promise: it works with the popover open, and closes it once done.
export default function PopoverBasic() {
  const [open, setOpen] = useState(false);
  const publish = async () => {
    await publishReport();
    setOpen(false);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">Publish report</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Publish this report</PopoverTitle>
          <PopoverDescription>
            Everyone in the workspace can read it once it is published. You can
            unpublish it at any time.
          </PopoverDescription>
        </PopoverHeader>
        <PopoverFooter>
          <PopoverClose asChild>
            <Button size="sm" variant="outline">
              Cancel
            </Button>
          </PopoverClose>
          <Button
            size="sm"
            variant="default"
            onClick={publish}
            loadingText="Publishing"
            errorText="Could not publish"
          >
            Publish
          </Button>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
}
