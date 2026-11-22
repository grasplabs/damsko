"use client";

import { Button } from "@grasp-os/ui/components/button";
import { Snippet } from "@grasp-os/ui/components/snippet";
import { visuallyHidden } from "@grasp-os/ui/lib/styles";
import {
  colors,
  font,
  media,
  radius,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";

import { ProjectList } from "./projects";

const styles = stylex.create({
  page: {
    display: "grid",
    boxSizing: "border-box",
    width: "100%",
    minHeight: "32rem",
    paddingInline: space["6"],
    paddingBlock: space["12"],
  },
  loadedPage: {
    display: "grid",
    placeItems: "center",
    boxSizing: "border-box",
    width: "100%",
    minHeight: "32rem",
    paddingInline: space["6"],
    paddingBlock: space["12"],
  },
  whole: { minHeight: "100dvh" },
  pageWhole: {
    display: "grid",
    boxSizing: "border-box",
    width: "100%",
    minHeight: "100dvh",
    paddingInline: space["6"],
    paddingBlock: space["12"],
  },
  words: {
    display: "grid",
    justifyItems: "center",
    alignSelf: "center",
    justifySelf: "center",
    gap: space["4"],
    maxWidth: "28rem",
    textAlign: "center",
  },
  heading: {
    margin: 0,
    fontFamily: font.serif,
    fontSize: font.headingLg,
    lineHeight: font.headingLgLine,
    fontWeight: font.weightNormal,
    color: colors.foreground,
  },
  sentence: {
    margin: 0,
    fontSize: font.textBase,
    lineHeight: font.textBaseLine,
    color: colors.bodyForeground,
    textWrap: "pretty",
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: space["2"],
  },
  // The one fact that can change by itself: whether Grasp can be reached, said as it changes.
  fact: {
    display: "inline-flex",
    alignItems: "center",
    gap: space["2"],
    margin: 0,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
  },
  dot: {
    width: 8,
    height: 8,
    flexShrink: 0,
    borderRadius: radius.circle,
    // In forced colours a dot's fill is dropped: its edge stays.
    borderWidth: { default: 0, [media.forcedColors]: 1 },
    borderStyle: "solid",
    borderColor: "CanvasText",
  },
  reachable: { backgroundColor: colors.success },
  unreachable: { backgroundColor: colors.destructive },
  checking: {
    backgroundColor: colors.mutedForeground,
    // A slow breath while it checks; still for anyone who asked for less motion.
    animationName: stylex.keyframes({
      "0%": { opacity: 1 },
      "50%": { opacity: 0.35 },
      "100%": { opacity: 1 },
    }),
    animationDuration: { default: "1.6s", [media.reducedMotion]: "0s" },
    animationIterationCount: "infinite",
  },
  reference: { width: "min(100%, 18rem)" },
  loaded: { width: "100%", maxWidth: "40rem" },
});

type Reach = "checking" | "unreachable" | "reachable";

const facts: Record<Reach, string> = {
  checking: "Checking whether Grasp can be reached",
  unreachable: "Grasp cannot be reached right now",
  reachable: "Grasp can be reached again",
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * A whole page that did not load: a real heading, one plain sentence, Try
 * again (working, then failed again or the page), a quiet way to the start page, the one fact that
 * changes by itself (can Grasp be reached), and a reference to copy for support. It is said once,
 * when it appears; Try again's outcome is said by the button. The first try fails again here, the
 * second gets through, as a patchy connection does.
 */
export function PageFailed({ whole = false }: { whole?: boolean }) {
  const [reach, setReach] = useState<Reach>("checking");
  const [tries, setTries] = useState(0);
  const [back, setBack] = useState(false);
  // Said once: the live region is empty in the first HTML and gets its words when the page runs.
  const [said, setSaid] = useState("");

  useEffect(() => {
    setSaid(
      "This page did not load. Grasp could not reach its servers; nothing you saved is lost."
    );
    const timer = setTimeout(() => {
      setReach("unreachable");
    }, 1500);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const retry = async () => {
    setReach("checking");
    await wait(1200);
    setTries(tries + 1);
    if (tries === 0) {
      setReach("unreachable");
      throw new Error("The page did not load.");
    }
    setReach("reachable");
    await wait(600);
    setBack(true);
  };

  if (back) {
    return (
      <div {...stylex.props(styles.loadedPage, whole && styles.whole)}>
        <div {...stylex.props(styles.loaded)}>
          <ProjectList arrived />
        </div>
      </div>
    );
  }

  const Heading = whole ? "h1" : "h2";
  return (
    <div {...stylex.props(whole ? styles.pageWhole : styles.page)}>
      <div data-slot="page-failed" {...stylex.props(styles.words)}>
        <Heading {...stylex.props(styles.heading)}>
          This page did not load
        </Heading>
        <p {...stylex.props(styles.sentence)}>
          Grasp could not reach its servers. Nothing you saved is lost.
        </p>
        <div {...stylex.props(styles.actions)}>
          <Button
            variant="default"
            onClick={retry}
            loadingLabel="Trying again"
            successLabel="Loaded"
            errorLabel="Not loaded"
          >
            Try again
          </Button>
          <Button variant="ghost" asChild>
            <a href="#start">Go to the start page</a>
          </Button>
        </div>
        <p {...stylex.props(styles.fact)}>
          <span
            aria-hidden="true"
            {...stylex.props(styles.dot, styles[reach])}
          />
          {facts[reach]}
        </p>
        <Snippet
          value="Ref 7F3A-21C9"
          aria-label="Reference for support"
          size="sm"
          style={styles.reference}
        />
      </div>
      {/* Not every screen reader treats <output> as a live region */}
      <p
        role="status"
        data-slot="page-failed-said"
        {...stylex.props(visuallyHidden)}
      >
        {said}
      </p>
    </div>
  );
}

// A page that failed, in its place in the app: the heading, one sentence, Try again.
export default function PageFailedExample() {
  return <PageFailed />;
}
