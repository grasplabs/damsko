import {
  HoverCard,
  HoverCardContent,
  HoverCardDescription,
  HoverCardTitle,
  HoverCardTrigger,
} from "@grasp-os/ui/components/hover-card";
import { font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const documents = [
  {
    id: "q3-forecast",
    name: "Q3 forecast",
    about: "Revenue and hiring for July to September, by team.",
    changed: "Changed 2 days ago",
  },
  {
    id: "launch-plan",
    name: "Launch plan",
    about: "What ships, who announces it, and the order of the week.",
    changed: "Changed last week",
  },
];

const layout = stylex.create({
  list: {
    display: "grid",
    gap: space["3"],
    // On a touch screen each control's target reaches the middle of the gap to the next.
    "--tap-room-block": `calc(${space["3"]} / 2)`,
    margin: 0,
    padding: 0,
    listStyle: "none",
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
  },
});

// Links in a list open their card beside them, level with the link: under it the card would
// cover the next link in the list, so the pointer could not move down to it.
export default function HoverCardDocument() {
  return (
    <ul {...stylex.props(layout.list)}>
      {documents.map((document) => (
        <li key={document.id}>
          <HoverCard>
            <HoverCardTrigger href={`#${document.id}`}>
              {document.name}
            </HoverCardTrigger>
            <HoverCardContent side="end" align="start">
              <HoverCardTitle>{document.name}</HoverCardTitle>
              <HoverCardDescription>{document.about}</HoverCardDescription>
              <HoverCardDescription variant="muted">
                {document.changed}
              </HoverCardDescription>
            </HoverCardContent>
          </HoverCard>
        </li>
      ))}
    </ul>
  );
}
