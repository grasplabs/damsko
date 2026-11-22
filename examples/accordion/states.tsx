import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@grasp-os/ui/components/accordion";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  box: { width: 128 },
});

// One section of an accordion in one state. The docs draw it once per state; hover, keyboard focus
// and pressed are forced from its own CSS. Open shows a one-line panel under the heading.
export default function AccordionState({
  open = false,
  disabled = false,
}: {
  open?: boolean;
  disabled?: boolean;
}) {
  return (
    <Accordion defaultValue={open ? ["details"] : []} style={layout.box}>
      {[
        {
          value: "details",
          title: "Details",
          content: "Due on Friday.",
          disabled,
        },
      ].map((entry) => (
        <AccordionItem
          key={entry.value}
          value={entry.value}
          disabled={entry.disabled}
        >
          <AccordionTrigger>{entry.title}</AccordionTrigger>
          <AccordionContent>{entry.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
