import { Button } from "@grasp-os/ui/components/button";
import { Kbd } from "@grasp-os/ui/components/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@grasp-os/ui/components/tooltip";
import {
  CopyIcon,
  DownloadIcon,
  Icon,
  SettingsIcon,
} from "@grasp-os/ui/lib/icons";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useShortcutHint } from "@ui-sdk/react/shortcuts";

// Buttons that are only an icon keep their `aria-label` as their name; the tooltip adds to it, and
// a screen reader hears it as the button's description.
const styles = stylex.create({
  row: {
    display: "flex",
    gap: space["1"],
  },
});

export default function TooltipIcon() {
  const copyKeys = useShortcutHint("mod+shift+c");
  return (
    <div {...stylex.props(styles.row)}>
      <Tooltip shortcut="mod+shift+c">
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Copy link">
            <Icon icon={CopyIcon} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Copy a link to this report <Kbd>{copyKeys.text}</Kbd>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Download">
            <Icon icon={DownloadIcon} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Saves a PDF of this report</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Settings">
            <Icon icon={SettingsIcon} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Report settings</TooltipContent>
      </Tooltip>
    </div>
  );
}
