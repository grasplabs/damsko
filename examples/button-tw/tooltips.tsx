import { Button } from "@grasp-os/ui/components-tw/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@grasp-os/ui/components-tw/tooltip";
import { DownloadIcon, Icon, TrashIcon } from "@grasp-os/ui/lib-tw/icons";

// The tooltips fixture, not shown on the page: an icon-only button in a paragraph of words, one
// with `tooltip` words of its own, one with none, one out of use that keeps focus, and one out of
// use inside a Tooltip of the caller's that says why.
export default function ButtonTooltips() {
  return (
    <>
      <p>
        The report is ready.{" "}
        <Button variant="ghost" size="icon-sm" aria-label="Download the report">
          <Icon icon={DownloadIcon} />
        </Button>
      </p>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Export"
        tooltip="Export as a spreadsheet"
      >
        <Icon icon={DownloadIcon} />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Quiet" tooltip={false}>
        <Icon icon={DownloadIcon} />
      </Button>
      <Button variant="outline" tooltip="Saves a copy to your files">
        Save a copy
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Archive"
        disabled
        focusableWhenDisabled
      >
        <Icon icon={TrashIcon} />
      </Button>
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0}>
            <Button variant="ghost" size="icon" aria-label="Delete" disabled>
              <Icon icon={TrashIcon} />
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>Only an owner can delete this</TooltipContent>
      </Tooltip>
    </>
  );
}
