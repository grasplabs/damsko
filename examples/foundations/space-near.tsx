import { Input } from "@grasp-os/ui/components/input";
import { Label } from "@grasp-os/ui/components/label";
import {
  colors,
  font,
  media,
  radius,
  shadow,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
// Space, scene: near and far. The same two fields twice. On the left every gap is the same, so a
// label floats between the field above and the field below. On the right the label sits a short
// step from its field (space-2, as Field does) and the next field a long step away (space-5, the
// form gap), so each pair reads as one thing. The room is washed in mint and named.
import * as stylex from "@stylexjs/stylex";

const WASH = `color-mix(in oklab, ${colors.mint} 34%, transparent)`;

// By the scene's own room, not the window's: the two forms stand side by side only where each
// keeps its longest label ("Who approves its reports") and its values on one line.
const stacked = "@container near (width < 44rem)";

const styles = stylex.create({
  // A container has no width of its own to give: it takes the room it is handed.
  box: { width: "100%", containerType: "inline-size", containerName: "near" },
  stage: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(2, minmax(0, 1fr))",
      [stacked]: "minmax(0, 1fr)",
    },
    gap: space["6"],
    padding: { default: space["6"], [media.maxSm]: space["4"] },
  },
  form: {
    display: "grid",
    alignContent: "start",
    rowGap: space["6"],
    minWidth: 0,
    padding: { default: space["6"], [media.maxSm]: space["5"] },
    borderRadius: radius.xl,
    cornerShape: radius.shape,
    backgroundColor: colors.card,
    boxShadow: shadow.sm,
  },
  head: { display: "grid", rowGap: space["1"] },
  verdict: {
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    fontWeight: font.weightMedium,
    color: colors.foreground,
  },
  why: {
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
    textWrap: "pretty",
  },
  // The fields, with the room between them as real rows: the room in the first column, its name
  // in the second.
  fields: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    columnGap: space["3"],
    alignItems: "center",
  },
  room: { gridColumn: 1, backgroundColor: WASH },
  name: {
    gridColumn: 2,
    display: "flex",
    alignItems: "center",
    height: 0,
    fontFamily: font.mono,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
    whiteSpace: "nowrap",
  },
  cell: { gridColumn: 1, minWidth: 0 },
  // A label has the whole row: no room's name stands beside it, and on a phone it needs the width.
  wide: { gridColumn: "1 / -1" },
  s2: { height: space["2"] },
  s4: { height: space["4"] },
  s5: { height: space["5"] },
});

type Room = "s2" | "s4" | "s5";

const names: Record<Room, string> = {
  s2: "space-2",
  s4: "space-4",
  s5: "space-5",
};

function Gap({ room }: { room: Room }) {
  return (
    <>
      <div aria-hidden="true" {...stylex.props(styles.room, styles[room])} />
      <span aria-hidden="true" {...stylex.props(styles.name)}>
        {names[room]}
      </span>
    </>
  );
}

function Fields({ id, near, far }: { id: string; near: Room; far: Room }) {
  return (
    <div {...stylex.props(styles.fields)}>
      <div {...stylex.props(styles.cell, styles.wide)}>
        <Label htmlFor={`${id}-agent`}>Agent name</Label>
      </div>
      <Gap room={near} />
      <div {...stylex.props(styles.cell)}>
        <Input id={`${id}-agent`} defaultValue="Pipeline reporter" />
      </div>
      <Gap room={far} />
      <div {...stylex.props(styles.cell, styles.wide)}>
        <Label htmlFor={`${id}-approver`}>Who approves its reports</Label>
      </div>
      <Gap room={near} />
      <div {...stylex.props(styles.cell)}>
        <Input id={`${id}-approver`} defaultValue="Maya Okafor" />
      </div>
    </div>
  );
}

export default function SpaceNear() {
  return (
    <div {...stylex.props(styles.box)}>
      <div {...stylex.props(styles.stage)}>
        <div {...stylex.props(styles.form)}>
          <div {...stylex.props(styles.head)}>
            <p {...stylex.props(styles.verdict)}>Every gap the same</p>
            <p {...stylex.props(styles.why)}>
              Each label floats halfway between two fields.
            </p>
          </div>
          <Fields id="even" near="s4" far="s4" />
        </div>
        <div {...stylex.props(styles.form)}>
          <div {...stylex.props(styles.head)}>
            <p {...stylex.props(styles.verdict)}>Near, then far</p>
            <p {...stylex.props(styles.why)}>
              Each label holds on to its own field.
            </p>
          </div>
          <Fields id="grasp" near="s2" far="s5" />
        </div>
      </div>
    </div>
  );
}
