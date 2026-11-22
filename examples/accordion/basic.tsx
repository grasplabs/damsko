import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@grasp-os/ui/components/accordion";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 300 },
});

const questions = [
  {
    value: "security",
    title: "How is our data kept safe?",
    content:
      "It is encrypted in transit and at rest, and backed up every night.",
  },
  {
    value: "tools",
    title: "Can it connect to other tools?",
    content:
      "Yes: calendars, chat and file storage, from the workspace settings.",
  },
  {
    value: "phone",
    title: "Is there a phone app?",
    content: "Not yet. The site works on a phone's browser in the meantime.",
  },
  {
    value: "help",
    title: "Where can we get help?",
    content:
      "Write to the support team from the help menu; they answer on working days.",
  },
];

export default function AccordionBasic() {
  return (
    <Accordion style={layout.box}>
      {questions.map((entry) => (
        <AccordionItem key={entry.value} value={entry.value}>
          <AccordionTrigger>{entry.title}</AccordionTrigger>
          <AccordionContent>{entry.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
