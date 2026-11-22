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

const features = [
  {
    value: "reports",
    title: "Reports",
    content: "Every review and its answers, by week or by team.",
  },
  {
    value: "sharing",
    title: "Sharing",
    content: "Invite people by email; they see only the projects you share.",
  },
  {
    value: "reminders",
    title: "Reminders",
    content: "A note to the owner a day before a review is due.",
  },
  { value: "export", title: "Export", content: "Owners only.", disabled: true },
];

export default function AccordionMultiple() {
  return (
    <Accordion
      multiple
      defaultValue={["reports", "sharing"]}
      style={layout.box}
    >
      {features.map((entry) => (
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
