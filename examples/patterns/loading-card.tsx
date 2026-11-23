import { Button } from "@grasp-os/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@grasp-os/ui/components/card";
import { Skeleton } from "@grasp-os/ui/components/skeleton";
import { fadeIn } from "@grasp-os/ui/lib/styles";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";

const layout = stylex.create({
  stack: { display: "grid", gap: space["3"], width: "100%", maxWidth: 560 },
  actions: { display: "flex", justifyContent: "flex-end" },
  // As long as a short title, never past the card; the sentence runs to its line's end.
  title: { width: "10rem", maxWidth: "100%" },
  sentence: { width: "100%" },
  facts: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: space["4"],
    margin: 0,
  },
  label: { color: colors.mutedForeground, fontSize: font.textSm },
  figure: {
    margin: 0,
    fontSize: font.headingSm,
    lineHeight: font.headingSmLine,
    fontVariantNumeric: "tabular-nums",
  },
  wait: { width: "4rem" },
});

// A card whose words are still coming: a Skeleton stands in the header where the title and the
// sentence will be, each as tall as the line it stands for, so the card keeps its height when they
// arrive. The card says it is busy; what it holds waits its own way. Load again to watch it.
export default function LoadingCard() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!loading) {
      return;
    }
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1600);
    return () => {
      clearTimeout(timer);
    };
  }, [loading]);
  return (
    <div {...stylex.props(layout.stack)}>
      <div {...stylex.props(layout.actions)}>
        <Button
          variant="outline"
          size="sm"
          focusableWhenDisabled
          disabled={loading}
          onClick={() => {
            setLoading(true);
          }}
        >
          Load again
        </Button>
      </div>
      <Card asChild>
        <section aria-busy={loading} aria-label="Usage">
          <CardHeader>
            {loading ? (
              <>
                <Skeleton size="lg" style={layout.title} />
                <Skeleton size="default" style={layout.sentence} />
              </>
            ) : (
              <>
                <CardTitle level={2}>
                  <span {...stylex.props(fadeIn)}>Usage</span>
                </CardTitle>
                <CardDescription>
                  <span {...stylex.props(fadeIn)}>
                    Seats and storage this month.
                  </span>
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent>
            <dl {...stylex.props(layout.facts)}>
              <div>
                <dt {...stylex.props(layout.label)}>Seats</dt>
                <dd {...stylex.props(layout.figure)}>
                  {loading ? (
                    <Skeleton size="lg" style={layout.wait} />
                  ) : (
                    <span {...stylex.props(fadeIn)}>18 of 25</span>
                  )}
                </dd>
              </div>
              <div>
                <dt {...stylex.props(layout.label)}>Storage</dt>
                <dd {...stylex.props(layout.figure)}>
                  {loading ? (
                    <Skeleton size="lg" style={layout.wait} />
                  ) : (
                    <span {...stylex.props(fadeIn)}>42 GB</span>
                  )}
                </dd>
              </div>
            </dl>
          </CardContent>
        </section>
      </Card>
    </div>
  );
}
