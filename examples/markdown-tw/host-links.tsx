"use client";

import { Button } from "@grasp-os/ui/components-tw/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@grasp-os/ui/components-tw/dialog";
import {
  Markdown,
  MarkdownLinkProvider,
} from "@grasp-os/ui/components-tw/markdown";
import type { MarkdownLink } from "@grasp-os/ui/components-tw/markdown";
import { Link } from "@grasp-os/ui/components/link";
import { focusRing, focusRingText } from "@grasp-os/ui/lib/styles";
import {
  colors,
  font,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import type { AnchorHTMLAttributes, ReactNode } from "react";

// An answer whose links the host draws. The page's own `renderLink`: a link out of the product is a
// button with no address, so a middle-click or the keyboard cannot skip the question; it asks first,
// with the full address. A path inside the product goes through the product's router, as Link's
// child (`asChild`). Around it, a MarkdownLinkProvider draws the product's citations (`cite:`) as
// numbered chips, for every Markdown inside it. Anything else is Markdown's own: a javascript:
// link stays words.
const answer = `Tailspin Logistics raised its prices by four percent from January [1](cite:1 "Rates rise 4% from 1 January").
Its notice is [on their site](https://tailspin.example.com/notices/2026-rates), and the other two
suppliers kept their terms [2](cite:2). The figures are on [the contracts page](/contracts/q4).

A link the model was tricked into writing, [like this one](javascript:alert(1)), is only words.`;

const styles = stylex.create({
  answer: { display: "grid", gap: space["5"], width: "100%", maxWidth: 560 },
  // Drawn as an inline link (its underline), but a button: there is no address to follow.
  asking: {
    padding: 0,
    borderWidth: 0,
    borderRadius: radius.sm,
    cornerShape: radius.shape,
    backgroundColor: "transparent",
    font: "inherit",
    color: "inherit",
    textDecorationLine: "underline",
    textDecorationThickness: size.linkUnderlineWidth,
    textUnderlineOffset: size.linkUnderlineOffset,
    textDecorationColor: colors.linkUnderline,
    cursor: "pointer",
  },
  // A citation: its number in a small chip after the claim.
  citation: {
    marginInlineStart: space["1"],
    paddingInline: space["1"],
    borderWidth: 0,
    borderRadius: radius.sm,
    cornerShape: radius.shape,
    backgroundColor: colors.muted,
    color: colors.foreground,
    fontFamily: font.sans,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    verticalAlign: "text-top",
    cursor: "pointer",
  },
  address: { overflowWrap: "anywhere", fontFamily: font.mono },
});

// A router's own link, as a product has one: a stand-in that draws an `a` from its `to`.
const RouterLink = ({
  to,
  ...rest
}: {
  to: string;
  children?: ReactNode;
} & AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <a {...rest} href={`#${to}`} data-router-link="" />
);

/** The product's citations: `[n](cite:n "what it says")` as chip n. */
const citation = (link: MarkdownLink) => {
  const n = link.scheme === "cite" ? Number(link.href.slice(5)) : Number.NaN;
  return Number.isInteger(n) && n > 0 ? (
    <button
      type="button"
      aria-label={`Source ${n}`}
      title={link.title}
      {...stylex.props(styles.citation, focusRing)}
    >
      {n}
    </button>
  ) : undefined;
};

export default function MarkdownHostLinks() {
  const [leaving, setLeaving] = useState<string | null>(null);
  const renderLink = (link: MarkdownLink) => {
    if (link.type === "image") {
      return undefined;
    }
    if (link.scheme === "https" || link.scheme === "http") {
      return (
        <button
          type="button"
          {...stylex.props(styles.asking, focusRingText)}
          onClick={() => {
            setLeaving(link.href);
          }}
        >
          {link.children}
        </button>
      );
    }
    if (link.scheme === "" && link.href.startsWith("/")) {
      return (
        <Link asChild>
          <RouterLink to={link.href}>{link.children}</RouterLink>
        </Link>
      );
    }
    return undefined;
  };
  return (
    <MarkdownLinkProvider renderLink={citation}>
      <div {...stylex.props(styles.answer)}>
        <Markdown renderLink={renderLink}>{answer}</Markdown>
      </div>
      <Dialog
        open={leaving !== null}
        onOpenChange={(next) => {
          if (!next) {
            setLeaving(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Open external link?</DialogTitle>
            <DialogDescription>
              <span {...stylex.props(styles.address)}>{leaving}</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <Button
              size="sm"
              onClick={() => {
                if (leaving !== null) {
                  window.open(leaving, "_blank", "noopener,noreferrer");
                }
                setLeaving(null);
              }}
            >
              Open
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MarkdownLinkProvider>
  );
}
