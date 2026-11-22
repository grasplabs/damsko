import { ArrowRightIcon, Icon } from "@grasp-os/ui/lib/icons";
import { focusRing } from "@grasp-os/ui/lib/styles";
import {
  colors,
  duration,
  font,
  media,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import { iconVars } from "@grasp-os/ui/lib/vars.stylex";
// Get started's three ways in, as the blog's list: each row one link on a hairline, a quiet
// tabular number, the name in the serif and one line under it. Under the pointer the row moves as
// one piece: the name steps 4px, the number turns ink, an arrow fades in.
import * as stylex from "@stylexjs/stylex";

import { linkMarker } from "./markers.stylex";
import { partStyles, rich } from "./parts";

const styles = stylex.create({
  list: {
    margin: 0,
    marginTop: space["10"],
    padding: 0,
    listStyle: "none",
    boxShadow: `inset 0 -1px 0 ${colors.border}`,
  },
  row: {
    display: "grid",
    gridTemplateColumns: "2.5rem minmax(0, 1fr) auto",
    alignItems: "center",
    columnGap: space["2"],
    minHeight: 64,
    paddingBlock: space["3"],
    color: "inherit",
    textDecorationLine: "none",
    boxShadow: `inset 0 1px 0 ${colors.border}`,
    borderRadius: radius.mark,
  },
  number: {
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    fontVariantNumeric: "tabular-nums",
    color: {
      default: colors.mutedForeground,
      [stylex.when.ancestor(":hover", linkMarker)]: {
        default: null,
        [media.hover]: colors.foreground,
      },
    },
    transitionProperty: "color",
    transitionDuration: duration.hover,
    transitionTimingFunction: duration.ease,
  },
  words: {
    display: "grid",
    minWidth: 0,
    transform: {
      default: "none",
      [stylex.when.ancestor(":hover", linkMarker)]: {
        default: null,
        [media.hover]: "translateX(4px)",
      },
    },
    transitionProperty: "transform",
    transitionDuration: duration.mark,
    transitionTimingFunction: duration.ease,
  },
  name: {
    fontFamily: font.serif,
    fontSize: font.headingMd,
    lineHeight: font.headingMdLine,
    letterSpacing: font.trackingTitle,
    color: colors.foreground,
  },
  line: {
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
  },
  arrow: {
    [iconVars.size]: size.iconSm,
    color: colors.foreground,
    opacity: {
      default: 0,
      [stylex.when.ancestor(":hover", linkMarker)]: {
        default: null,
        [media.hover]: 1,
      },
    },
    transform: {
      default: "translateX(-3px)",
      [stylex.when.ancestor(":hover", linkMarker)]: {
        default: null,
        [media.hover]: "none",
      },
    },
    transitionProperty: "opacity, transform",
    transitionDuration: duration.mark,
    transitionTimingFunction: duration.ease,
  },
});

export interface Way {
  name: string;
  line: string;
  href: string;
}

export function WaysView({ items }: { items: Way[] }) {
  const root = stylex.props(partStyles.block, styles.list);
  return (
    <ol {...root} className={`not-prose ${root.className ?? ""}`}>
      {items.map((item, index) => (
        <li key={item.href}>
          <a
            href={item.href}
            {...stylex.props(linkMarker, styles.row, focusRing)}
          >
            <span {...stylex.props(styles.number)}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <span {...stylex.props(styles.words)}>
              <span {...stylex.props(styles.name)}>{item.name}</span>
              <span {...stylex.props(styles.line)}>{rich(item.line)}</span>
            </span>
            <span aria-hidden="true" {...stylex.props(styles.arrow)}>
              <Icon icon={ArrowRightIcon} />
            </span>
          </a>
        </li>
      ))}
    </ol>
  );
}
