import { Button } from "@grasp-os/ui/components/button";
import { ButtonGroup } from "@grasp-os/ui/components/button-group";
import {
  BoldIcon,
  Icon,
  ItalicIcon,
  RedoIcon,
  UnderlineIcon,
  UndoIcon,
} from "@grasp-os/ui/lib/icons";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  column: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: space[4],
  },
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: space[3],
    // Each control's touch target reaches the middle of the gap to the next (tapTarget).
    "--tap-room-inline": `calc(${space[3]} / 2)`,
    justifyContent: "center",
  },
  sample: {
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textBase,
    lineHeight: font.textBaseLine,
    color: colors.bodyForeground,
    textAlign: "center",
  },
  bold: { fontWeight: "bold" },
  italic: { fontStyle: "italic" },
  underline: { textDecorationLine: "underline" },
});

interface Look {
  bold: boolean;
  italic: boolean;
  underline: boolean;
}
type Mark = keyof Look;
const plain: Look = { bold: false, italic: false, underline: false };

// The sentence's styles, one step after another: it starts bold, so Undo has a step to take back.
const start: Look[] = [plain, { bold: true, italic: false, underline: false }];

// Icon-only buttons in a toolbar row: each is square, and its label is its name. The styles stay
// pressed and show on the sentence; Undo and Redo step through them.
export default function ButtonGroupIcons() {
  const [history, setHistory] = useState({ steps: start, at: 1 });
  const look = history.steps[history.at] ?? plain;
  // A new step drops the steps Undo had taken back, as an editor does.
  const flip = (mark: Mark) => () => {
    setHistory(({ steps, at }) => {
      const now = steps[at] ?? plain;
      return {
        steps: [...steps.slice(0, at + 1), { ...now, [mark]: !now[mark] }],
        at: at + 1,
      };
    });
  };
  const step = (by: number) => () => {
    setHistory(({ steps, at }) => ({ steps, at: at + by }));
  };
  return (
    <div {...stylex.props(layout.column)}>
      <div {...stylex.props(layout.row)}>
        <ButtonGroup aria-label="History">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Undo"
            disabled={history.at === 0}
            onClick={step(-1)}
          >
            <Icon icon={UndoIcon} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Redo"
            disabled={history.at === history.steps.length - 1}
            onClick={step(1)}
          >
            <Icon icon={RedoIcon} />
          </Button>
        </ButtonGroup>
        <ButtonGroup aria-label="Text style">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Bold"
            aria-pressed={look.bold}
            onClick={flip("bold")}
          >
            <Icon icon={BoldIcon} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Italic"
            aria-pressed={look.italic}
            onClick={flip("italic")}
          >
            <Icon icon={ItalicIcon} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Underline"
            aria-pressed={look.underline}
            onClick={flip("underline")}
          >
            <Icon icon={UnderlineIcon} />
          </Button>
        </ButtonGroup>
      </div>
      <p
        {...stylex.props(
          layout.sample,
          look.bold && layout.bold,
          look.italic && layout.italic,
          look.underline && layout.underline
        )}
      >
        The plan for the quarter
      </p>
    </div>
  );
}
