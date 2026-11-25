// The showcase's still pieces (site/pages/index.astro): the library's components drawn on the
// server and not made live, each composed here in React because their parts share a context (Tabs
// and its tabs, a Field and its control), which an .astro file does not pass between parts. They
// stand inert on the page, as part of the picture. The open dialog is drawn in place, in the
// Dialog's own look (`dialogStyles`), inside a frame that stands in for the window: a picture of a
// dialog, never one that opens, traps focus or makes the page inert.
import { Button } from "@grasp-os/ui/components/button";
import { dialogStyles } from "@grasp-os/ui/components/dialog";
import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import { Input } from "@grasp-os/ui/components/input";
import { Slider, SliderLabel } from "@grasp-os/ui/components/slider";
import { Tabs, TabsList, TabsTrigger } from "@grasp-os/ui/components/tabs";
import { ArrowRightIcon, Icon, XIcon } from "@grasp-os/ui/lib/icons";
import { colors, radius, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const still = stylex.create({
  // A piece of page the size of its box, with the dialog in it as the window would hold it.
  frame: {
    pointerEvents: "none",
    position: "relative",
    boxSizing: "border-box",
    display: "flex",
    width: "100%",
    minWidth: 0,
    height: "100%",
    padding: space["4"],
    overflow: "hidden",
    color: colors.bodyForeground,
    backgroundColor: colors.muted,
    borderRadius: radius.xl,
    cornerShape: radius.shape,
  },
  // The shade, over the frame rather than the window.
  shade: { position: "absolute" },
  // The middle of the frame, whatever the window's width.
  placed: {
    position: "absolute",
    inset: 0,
    margin: "auto",
    width: `min(${size.dialogWidth}, 100% - 2 * ${size.dialogGutter})`,
    height: "fit-content",
    maxHeight: `calc(100% - 2 * ${size.dialogGutter})`,
    borderRadius: radius.xl,
    cornerShape: radius.shape,
  },
});

export const PeriodTabs = () => (
  <Tabs defaultValue="month">
    <TabsList aria-label="Period">
      <TabsTrigger value="week">Week</TabsTrigger>
      <TabsTrigger value="month">Month</TabsTrigger>
      <TabsTrigger value="quarter">Quarter</TabsTrigger>
    </TabsList>
  </Tabs>
);

/** A dialog standing open in place: its panel, title, sentence, actions and close button. */
export const ArchiveDialog = () => (
  <div inert {...stylex.props(still.frame)}>
    <div {...stylex.props(dialogStyles.overlay, still.shade)} />
    <div {...stylex.props(dialogStyles.panel, still.placed)}>
      <div {...stylex.props(dialogStyles.header)}>
        <h2 {...stylex.props(dialogStyles.title)}>Archive Old projects?</h2>
        <p {...stylex.props(dialogStyles.description)}>
          It leaves the list. Anyone can bring it back.
        </p>
      </div>
      <div {...stylex.props(dialogStyles.footer)}>
        <Button variant="outline" size="sm">
          Cancel
        </Button>
        <Button size="sm">Archive</Button>
      </div>
      <span {...stylex.props(dialogStyles.close)}>
        <Button variant="ghost" size="icon-sm" aria-label="Close">
          <Icon icon={XIcon} />
        </Button>
      </span>
    </div>
  </div>
);

export const EmailField = () => (
  <Field name="email">
    <FieldLabel>Work email</FieldLabel>
    <Input type="email" defaultValue="noor@northwind.example" />
  </Field>
);

export const VolumeSlider = () => (
  <Slider defaultValue={64}>
    <SliderLabel>Volume</SliderLabel>
  </Slider>
);

/** The way into the docs from the fullscreen showcase: always in view, a link that works with no script. */
export const DocsDoor = ({ href, words }: { href: string; words: string }) => (
  <Button size="lg" asChild>
    <a href={href}>
      {words}
      <Icon icon={ArrowRightIcon} />
    </a>
  </Button>
);
