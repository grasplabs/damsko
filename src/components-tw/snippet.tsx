// Snippet: a value you can copy, as one quiet line. The value in the mono face on a quiet fill in
// the system's corner, a CopyButton at its end. A press anywhere on it copies the value; the button
// shows the check for a moment, the field turns to the success ground, and the page's one live
// region says so. For an install command, an id, a key, a token's name or its value.
//
//   <Snippet value="pnpm dlx shadcn add @acme/button" aria-label="Copy the install command" />
//   <Snippet size="sm" value="--brand-mint" aria-label="Copy --brand-mint" swatch="var(--brand-mint)" />
//
// It is one button (the copy button), so a keyboard reaches it once and a screen reader hears its
// name; the field round it is a label for that button, so a press on the value presses it too. A
// value longer than its room stays on one line and scrolls sideways inside the field, the end with
// more fading; it is never broken and never cut short. While it is clipped the value is a Tab stop
// before the button, a group named by the value, so the arrow keys scroll to the rest of it and
// Home and End go to its ends. The timing, the check and the words are
// CopyButton's, the same for every copy in the library.
//
// Every value is a token. A caller may set layout only (`className`). In Tailwind: the field sets
// the ghost button's --damsko-ghost-* variables on itself, as StyleX's ghostVars did.
"use client";

import { useId } from "react";
import type { KeyboardEvent } from "react";

import { markScrollEdges, useScrollEdges } from "../hooks/use-scroll-edges";
import { cn } from "../lib-tw/utils";
import type { LayoutClass } from "../lib-tw/utils";
import { CopyButton } from "./copy-button";

/** Every prop a Snippet takes. */
export interface SnippetProps {
  /** What is shown and copied, exactly: a command, an id, a token's name or value. */
  value: string;
  /**
   * The copy button's name, saying what it copies ("Copy the install command"), shown in its
   * tooltip too.
   * @default the catalogue's copyButton.copy, "Copy"
   */
  "aria-label"?: string;
  /**
   * `sm` 28px, for a list of values (a token's name and values); `default` 32px, for one value on
   * its own (an install command). On a touch screen the button has a 44px target either way.
   * @default "default"
   */
  size?: "sm" | "default";
  /** A colour shown as a small round before the value, for a colour's name or value: any CSS colour. */
  swatch?: string;
  /** Called with the value once it is on the clipboard. */
  onCopy?: (value: string) => void;
  /** Layout only: margins, width and alignment. The look belongs to the field. */
  className?: LayoutClass;
}

// The copy button's result is read from the button itself (Button's data-status), so the field's
// ground follows it with no state of its own: `has-[[data-status=success]]:`, and at rest
// `not-has-[[data-status=success],[data-status=error]]:`.
const styles = {
  // The field: a quiet fill in the system's corner, one line. It is one surface: its copy button
  // draws no fill or ring of its own in it (the --damsko-ghost-* variables), the field's fill
  // answers the pointer and the field takes the keyboard's ring, just inside its edge; the icon is
  // quiet until the pointer comes, then the result's own colour.
  field: [
    "[--damsko-ghost-hover:transparent] [--damsko-ghost-active:transparent] [--damsko-ghost-ring:transparent]",
    "[--damsko-ghost-ink:var(--damsko-muted-foreground)] hover:not-has-[[data-status=success],[data-status=error]]:[--damsko-ghost-ink:var(--damsko-foreground)] has-[[data-status=success]]:[--damsko-ghost-ink:var(--damsko-mint-deep)] has-[[data-status=error]]:[--damsko-ghost-ink:var(--damsko-destructive)]",
    "relative inline-flex items-center box-border max-w-full min-w-0 m-0 py-0 ps-3 font-mono text-xs font-normal text-start text-foreground cursor-copy select-none tap-highlight-none align-middle",
    // Hover only at rest: while it says "copied", that wins.
    "bg-code-bg hover:not-has-[[data-status=success],[data-status=error]]:bg-[color-mix(in_oklch,var(--damsko-code-bg),var(--damsko-foreground)_7%)] has-[[data-status=success]]:bg-success-subtle",
    // Forced colours drop the fill: a line keeps the field.
    "border-0 forced-colors:border border-solid border-[ButtonText] rounded-xl corner-squircle",
    "shadow-[inset_0_0_0_1px_transparent] has-[[data-status=success]]:shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--damsko-mint-deep)_35%,transparent)] has-[[data-status=error]]:shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--damsko-destructive)_60%,transparent)]",
    // The ground and the edge change with the button's crossfade, never ahead of it.
    "active:[transform:scale(var(--damsko-button-press-scale))] transition-[background-color,box-shadow,transform] duration-[var(--damsko-duration-hover),var(--damsko-motion-swap),var(--damsko-motion-press)] ease-ui",
    "outline-none has-focus-visible:[outline:var(--damsko-ring-width)_solid_var(--damsko-ring)] outline-offset-[calc(-1*var(--damsko-ring-width))]",
  ],
  // The button is a square as tall as the field: the room at the end makes up the rest, so the
  // icon stands as far from the end as the words from the start (space-3).
  sm: "h-control-xs pe-[max(0px,calc(var(--damsko-space-3)-(var(--damsko-control-xs)-var(--damsko-icon-sm))/2))]",
  default:
    "h-control-sm pe-[max(0px,calc(var(--damsko-space-3)-(var(--damsko-control-sm)-var(--damsko-icon-sm))/2))]",
  // A colour before the value: a small round of it (its colour inline) with a 1px ring in the
  // muted ink, so a colour like the field's own ground still shows as a round.
  swatch:
    "bg-(--damsko-swatch) shrink-0 size-3 me-2 rounded-circle shadow-[inset_0_0_0_1px_var(--damsko-muted-foreground)] forced-color-adjust-none",
  // The value: one line, never broken, never cut with an ellipsis. Narrower than its text, it
  // scrolls sideways inside the field with no bar and the end with more fades out.
  value: [
    "grow min-w-0 overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-hidden outline-none [mask-image:none]",
    "data-under-end:not-data-under-start:[mask-image:linear-gradient(to_right,black_calc(100%-var(--damsko-space-8)),transparent)]",
    "data-under-start:not-data-under-end:[mask-image:linear-gradient(to_left,black_calc(100%-var(--damsko-space-8)),transparent)]",
    "data-under-start:data-under-end:[mask-image:linear-gradient(to_right,transparent,black_var(--damsko-space-8),black_calc(100%-var(--damsko-space-8)),transparent)]",
  ],
};

// The arrows scroll a focused box by themselves; Home and End go to the value's ends.
const toEnds = (event: KeyboardEvent<HTMLSpanElement>) => {
  if (event.key !== "Home" && event.key !== "End") {
    return;
  }
  event.preventDefault();
  const box = event.currentTarget;
  box.scrollLeft = event.key === "Home" ? 0 : box.scrollWidth;
};

/** A value you can copy, as one quiet line with a copy button at its end. */
export const Snippet = ({
  value,
  "aria-label": label,
  size: sized = "default",
  swatch,
  onCopy,
  className,
}: SnippetProps) => {
  // The ends of the value with more beyond them are marked for the fade there. Clipped, the value
  // is a Tab stop of its own, so the keyboard's arrows scroll to the rest of it (WCAG 2.1.1); a
  // value that fits is none, and the button is the one stop.
  const valueId = useId();
  const edges = useScrollEdges({
    onChange: (found, element) => {
      markScrollEdges(found, element);
      element.tabIndex = found.overflows ? 0 : -1;
      // A stop has a role and a name: a group named by the value it holds. A value that fits is
      // plain words.
      if (found.overflows) {
        element.setAttribute("role", "group");
        element.setAttribute("aria-labelledby", valueId);
      } else {
        element.removeAttribute("role");
        element.removeAttribute("aria-labelledby");
      }
    },
  });
  const hasSwatch = swatch !== undefined && swatch !== "";
  return (
    // A label round the button: a press anywhere on the field presses the button, once.
    <label
      data-slot="snippet"
      data-size={sized}
      className={cn(
        styles.field,
        sized === "sm" ? styles.sm : styles.default,
        className
      )}
    >
      {hasSwatch ? (
        <span
          aria-hidden="true"
          className={styles.swatch}
          style={{ "--damsko-swatch": swatch }}
        />
      ) : null}
      {/* Out of the tab order while the value fits (above): browsers differ on whether a box that
          could scroll is a Tab stop, so it is said here. */}
      {/* oxlint-disable-next-line jsx-a11y/no-static-element-interactions -- it is a group, named, while it is a stop (above); the keys reach it only then */}
      <span
        ref={edges}
        id={valueId}
        tabIndex={-1}
        onKeyDown={toEnds}
        data-slot="snippet-value"
        dir="ltr"
        className={cn(styles.value)}
      >
        {value}
      </span>
      <CopyButton
        value={value}
        onCopy={onCopy}
        size={sized === "sm" ? "icon-xs" : "icon-sm"}
        aria-label={label}
      />
    </label>
  );
};
