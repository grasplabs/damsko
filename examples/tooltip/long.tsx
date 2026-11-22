import { Button } from "@grasp-os/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@grasp-os/ui/components/tooltip";

// Longer words wrap at tooltip-width onto more lines.
export default function TooltipLong() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="secondary">Refresh</Button>
      </TooltipTrigger>
      <TooltipContent>
        Fetches the latest figures from every source, and charts keep their
        place while new numbers arrive
      </TooltipContent>
    </Tooltip>
  );
}
