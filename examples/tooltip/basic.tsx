import { Button } from "@grasp-os/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@grasp-os/ui/components/tooltip";

export default function TooltipBasic() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="secondary">Publish</Button>
      </TooltipTrigger>
      <TooltipContent>Everyone in the workspace can read it</TooltipContent>
    </Tooltip>
  );
}
