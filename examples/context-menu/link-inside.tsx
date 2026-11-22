import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@grasp-os/ui/components/context-menu";
import { ArrowRightIcon, CopyIcon, TrashIcon } from "@grasp-os/ui/lib/icons";
import { colors, font, radius, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  link: {
    display: "block",
    padding: space[3],
    borderRadius: radius.base,
    color: colors.foreground,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
  },
});

// A fixture for tests/context-menu.spec.ts, not on the page: the area holds a link that takes the
// keys, so the area takes no tab stop of its own and the menu gives focus back to the link.
export default function ContextMenuLinkInside() {
  return (
    <ContextMenu>
      <ContextMenuTrigger aria-label="Q3 forecast" tabStop={false}>
        <a
          href="#q3-forecast"
          data-fixture-link=""
          {...stylex.props(layout.link)}
        >
          Q3 forecast
        </a>
      </ContextMenuTrigger>
      <ContextMenuContent
        finalFocus={() =>
          document.querySelector<HTMLElement>("[data-fixture-link]")
        }
      >
        <ContextMenuItem icon={ArrowRightIcon}>Open</ContextMenuItem>
        <ContextMenuItem icon={CopyIcon}>Duplicate</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem icon={TrashIcon} variant="destructive">
          Move to trash
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
