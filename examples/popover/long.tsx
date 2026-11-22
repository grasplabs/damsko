import { Button } from "@grasp-os/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@grasp-os/ui/components/popover";
import * as stylex from "@stylexjs/stylex";

// More than the panel holds: it grows to popup-height, then its body scrolls, with the title
// scrolling too. The body is a region named by the title, so the keys reach it.
const notes = [
  "Reports now open where you left them, at the same section and the same scroll.",
  "A chart can be copied as an image, at twice its size on screen, for slides and messages.",
  "Comments stay beside the line they were left on, even after the text around them changes.",
  "Exports keep the report's own type and colours, and its tables keep their headings on every page.",
  "Shared links show who opened them and when, for the people the report is shared with.",
];

const styles = stylex.create({
  note: {
    margin: 0,
  },
});

export default function PopoverLong() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">What is new</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>What is new in reports</PopoverTitle>
          <PopoverDescription>Five changes from this week.</PopoverDescription>
        </PopoverHeader>
        {notes.map((note) => (
          <p key={note} {...stylex.props(styles.note)}>
            {note}
          </p>
        ))}
      </PopoverContent>
    </Popover>
  );
}
