"use client";

import { Button } from "@grasp-os/ui/components/button";
import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import { Switch } from "@grasp-os/ui/components/switch";
import { ChevronDownIcon, Icon } from "@grasp-os/ui/lib/icons";
import { menuStyles } from "@grasp-os/ui/lib/styles";
import {
  colors,
  font,
  media,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import { durations } from "@grasp-os/ui/lib/tokens.values";
// Motion, scene: feel each duration. Three real parts, each answering in its own time, each named
// with its token and its time: a press, a menu opening and leaving, words swapping in place. "Slow down" plays every one at a tenth of its speed, through
// the Web Animations API, so the curve and the order can be seen. With reduced motion nothing
// travels: each part simply changes.
import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";

const PHONE = media.maxSm;
const SLOW = 10;

// Plays every transition and animation that starts inside `ref` at 1/SLOW of its speed.
function useSlow(ref: RefObject<HTMLElement | null>, slow: boolean) {
  useEffect(() => {
    const root = ref.current;
    if (!root) {
      return;
    }
    const rate = slow ? 1 / SLOW : 1;
    const apply = () => {
      for (const animation of root.getAnimations({ subtree: true })) {
        animation.playbackRate = rate;
      }
    };
    root.addEventListener("transitionrun", apply);
    root.addEventListener("transitionstart", apply);
    root.addEventListener("animationstart", apply);
    return () => {
      root.removeEventListener("transitionrun", apply);
      root.removeEventListener("transitionstart", apply);
      root.removeEventListener("animationstart", apply);
    };
  }, [ref, slow]);
}

const styles = stylex.create({
  scene: { display: "grid", fontFamily: font.sans },
  bar: {
    display: "flex",
    justifyContent: "flex-end",
    paddingBlock: space["4"],
    paddingInline: { default: space["6"], [PHONE]: space["4"] },
    boxShadow: `inset 0 calc(-1 * ${size.hairline}) 0 ${colors.border}`,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(2, minmax(0, 1fr))",
      [PHONE]: "minmax(0, 1fr)",
    },
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  tile: {
    display: "grid",
    gridTemplateRows: "1fr auto",
    minWidth: 0,
    boxShadow: `inset calc(-1 * ${size.hairline}) calc(-1 * ${size.hairline}) 0 ${colors.border}`,
  },
  stage: {
    display: "grid",
    placeItems: "center",
    minHeight: `calc(2 * ${space["24"]})`,
    padding: space["6"],
  },
  caption: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    flexWrap: "wrap",
    columnGap: space["3"],
    rowGap: space["1"],
    paddingBlock: space["3"],
    paddingInline: { default: space["6"], [PHONE]: space["4"] },
  },
  what: {
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.foreground,
  },
  token: {
    fontFamily: font.mono,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
    whiteSpace: "nowrap",
    fontVariantNumeric: "tabular-nums",
  },

  // The menu: its trigger, and the panel standing under it.
  menu: { display: "grid", justifyItems: "start", rowGap: space.popupGap },
  // Held open in the page, not over it: the menu's own overscroll stop would keep the wheel here.
  panelPlace: { "--transform-origin": "top left", overscrollBehavior: "auto" },
  shut: { visibility: "hidden" },
});

function Tile({
  what,
  token,
  children,
}: {
  what: string;
  token: string;
  children: ReactNode;
}) {
  return (
    <li {...stylex.props(styles.tile)}>
      <div {...stylex.props(styles.stage)}>{children}</div>
      <div {...stylex.props(styles.caption)}>
        <span {...stylex.props(styles.what)}>{what}</span>
        <span {...stylex.props(styles.token)}>{token}</span>
      </div>
    </li>
  );
}

// The menu's real look and motion (menuStyles), held open at rest so the page shows it whole.
// Pressing the trigger sends it away in duration-leave and brings it back in duration-popup, as a real menu does.
function Menu() {
  const [open, setOpen] = useState(true);
  return (
    <div {...stylex.props(styles.menu)}>
      <Button
        variant="outline"
        aria-expanded={open}
        onClick={() => {
          setOpen(!open);
        }}
      >
        Report
        <Icon icon={ChevronDownIcon} />
      </Button>
      <div
        role="group"
        aria-label="Report"
        inert={!open}
        data-ending-style={open ? undefined : ""}
        {...stylex.props(
          menuStyles.panel,
          menuStyles.motion,
          styles.panelPlace,
          !open && styles.shut
        )}
      >
        <div {...stylex.props(menuStyles.item)}>Rename</div>
        <div {...stylex.props(menuStyles.item, menuStyles.highlighted)}>
          Share with the team
        </div>
        <div {...stylex.props(menuStyles.item)}>Ask an agent to check it</div>
      </div>
    </div>
  );
}

const wait = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

function Swap() {
  const approve = () => wait(durations.work);
  return (
    <Button
      variant="default"
      onClick={approve}
      loadingLabel="Approving"
      successLabel="Approved"
      errorLabel="Failed"
    >
      Approve
    </Button>
  );
}

export default function MotionDurations() {
  const [slow, setSlow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useSlow(ref, slow);
  return (
    <div ref={ref} {...stylex.props(styles.scene)}>
      <div {...stylex.props(styles.bar)}>
        <Field orientation="horizontal">
          <FieldLabel>{`Slow down ×${SLOW}`}</FieldLabel>
          <Switch
            checked={slow}
            onCheckedChange={(on) => {
              setSlow(on);
            }}
          />
        </Field>
      </div>
      <ul {...stylex.props(styles.grid)}>
        <Tile
          what="Press and hold"
          token={`duration-press ${durations.press}ms`}
        >
          <Button variant="default">Run the agent</Button>
        </Tile>
        <Tile
          what="Open and close"
          token={`duration-popup ${durations.popup}ms, leave ${durations.leave}ms`}
        >
          <Menu />
        </Tile>
        <Tile
          what="Words that swap"
          token={`duration-swap ${durations.swap}ms`}
        >
          <Swap />
        </Tile>
      </ul>
    </div>
  );
}
