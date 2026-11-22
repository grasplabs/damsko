import { Alert, AlertTitle } from "@grasp-os/ui/components/alert";
import { Badge } from "@grasp-os/ui/components/badge";
import { Button } from "@grasp-os/ui/components/button";
import { Card, CardDescription, CardTitle } from "@grasp-os/ui/components/card";
import { Checkbox } from "@grasp-os/ui/components/checkbox";
import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import { Input } from "@grasp-os/ui/components/input";
import { Progress } from "@grasp-os/ui/components/progress";
import { Switch } from "@grasp-os/ui/components/switch";
import { Tabs, TabsList, TabsTrigger } from "@grasp-os/ui/components/tabs";
import type { ThemeId, ThemeMode } from "@grasp-os/ui/components/theme-toggle";
import {
  colors,
  font,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import { pixel, pixelVars } from "@grasp-os/ui/lib/vars.stylex";
// The board a theme is judged on: real components, standing on a theme and a mode set on their own
// subtree (`data-theme`, `data-mode`), so six of them can stand side by side on one page.
// Its default export is one panel; the theme examples use `ThemePanel`.
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";

import "../../src/styles/themes.css";

const styles = stylex.create({
  // The ground and the words come from the theme the panel carries: its own tokens, restated.
  panel: {
    display: "grid",
    gap: space["4"],
    boxSizing: "border-box",
    minWidth: 0,
    padding: space["5"],
    backgroundColor: colors.background,
    color: colors.bodyForeground,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    borderRadius: radius.base,
    cornerShape: radius.shape,
    boxShadow: size.borderStrong,
  },
  head: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: space["2"],
  },
  name: {
    margin: 0,
    fontFamily: font.serif,
    fontSize: font.headingSm,
    lineHeight: font.headingSmLine,
    fontWeight: font.weightNormal,
    color: colors.foreground,
  },
  mode: {
    color: colors.mutedForeground,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
  },
  row: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space["2"],
  },
  soft: {
    display: "grid",
    gap: space["3"],
    padding: space["4"],
    backgroundColor: colors.muted,
    borderRadius: radius.base,
    cornerShape: radius.shape,
  },
  light: { display: "flex", gap: space["1"], alignItems: "center" },
  stop: { width: 14, height: 14, borderRadius: radius.circle },
  mint: { backgroundColor: colors.mint },
  lime: { backgroundColor: colors.brandLime },
  pine: { backgroundColor: colors.pine },
  // Pine taken further (a proposal): an ordered dither on the ground, two offset 4px grids of the
  // system's pixel in the light's colour, densest at the top and fading down the way the light falls. CSS
  // only: no canvas, nothing moves, nothing redrawn while the page scrolls. Never under words, only
  // on the grounds: the cards and fields stand on it with their own fills.
  dither: {
    [pixelVars.color]:
      "light-dark(oklch(0.4321 0.0778 175.187 / 0.16), oklch(0.8005 0.1625 165.25 / 0.11))",
    backgroundImage: `${pixel.fineFill}, ${pixel.fineFill}`,
    backgroundSize: "4px 4px, 4px 4px",
    backgroundPosition: "0 0, 2px 2px",
  },
  // The fade lives on a layer of its own, so the panel's words and parts are never masked.
  ditherLayer: {
    position: "absolute",
    inset: 0,
    borderRadius: "inherit",
    pointerEvents: "none",
    maskImage: "linear-gradient(to bottom, black, transparent 45%)",
  },
  holder: { position: "relative" },
  stack: { display: "grid", gap: space["4"], minWidth: 0 },
  above: { position: "relative" },
});

/** What the panel shows: a theme in a mode, with its name and mode over it. */
export function ThemePanel({
  theme,
  mode,
  title,
  dithered = false,
  children,
}: {
  theme: ThemeId;
  mode: Exclude<ThemeMode, "system"> | "system";
  title?: ReactNode;
  /** The proposal: a dither on the ground. */
  dithered?: boolean;
  children?: ReactNode;
}) {
  return (
    <section
      data-theme={theme}
      data-mode={mode}
      aria-label={`${theme}, ${mode}`}
      {...stylex.props(styles.panel, dithered && styles.holder)}
    >
      {dithered && (
        <span
          aria-hidden="true"
          {...stylex.props(styles.ditherLayer, styles.dither)}
        />
      )}
      <div {...stylex.props(styles.head, dithered && styles.above)}>
        <h3 {...stylex.props(styles.name)}>
          {title ?? theme[0]!.toUpperCase() + theme.slice(1)}
        </h3>
        <span {...stylex.props(styles.mode)}>{mode}</span>
      </div>
      {dithered ? (
        <div {...stylex.props(styles.above, styles.stack)}>
          {children ?? <ThemeBoard />}
        </div>
      ) : (
        (children ?? <ThemeBoard />)
      )}
    </section>
  );
}

/** Real components, in the theme of whatever holds them. */
export function ThemeBoard() {
  return (
    <>
      <Card>
        <CardTitle>Spring launch</CardTitle>
        <CardDescription>Everything the team ships in March.</CardDescription>
      </Card>
      <div {...stylex.props(styles.row)}>
        <Badge variant="success">On track</Badge>
        <Badge variant="warning">Needs review</Badge>
        <Badge>Draft</Badge>
        <span aria-hidden="true" {...stylex.props(styles.light)}>
          <span {...stylex.props(styles.stop, styles.lime)} />
          <span {...stylex.props(styles.stop, styles.mint)} />
          <span {...stylex.props(styles.stop, styles.pine)} />
        </span>
      </div>
      <Field>
        <FieldLabel>Project name</FieldLabel>
        <Input defaultValue="Quarterly review" />
      </Field>
      <Tabs defaultValue="tasks">
        <TabsList variant="default" aria-label="Views">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="people">People</TabsTrigger>
        </TabsList>
      </Tabs>
      <div {...stylex.props(styles.soft)}>
        <Field orientation="horizontal">
          <FieldLabel>Weekly summary</FieldLabel>
          <Switch defaultChecked />
        </Field>
        <Field orientation="horizontal">
          <Checkbox defaultChecked />
          <FieldLabel>Tell the owner</FieldLabel>
        </Field>
        <Progress label="Uploading files" value={64} />
      </div>
      <Alert variant="warning">
        <AlertTitle>Almost at this month's limit</AlertTitle>
      </Alert>
      <div {...stylex.props(styles.row)}>
        <Button variant="default">Save changes</Button>
        <Button variant="outline">Cancel</Button>
        <Button variant="default">Approve</Button>
      </div>
    </>
  );
}

const board = stylex.create({ one: { width: "100%", maxWidth: 360 } });

/** One panel: Pine at night, the one people should want to turn on. */
export default function ThemePanelExample() {
  return (
    <div {...stylex.props(board.one)}>
      <ThemePanel theme="pine" mode="dark" />
    </div>
  );
}
