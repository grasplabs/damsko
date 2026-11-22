import { DiffViewer } from "@grasp-os/ui/components/diff-viewer";

const before =
  "Thanks for your order. We will send the invoice within 30 days, and payment is due a month after that. Write to us if anything looks wrong.";
const after =
  "Thank you for your order. We will send the invoice within 14 days, and payment is due 30 days after that. Reply to this email if anything looks wrong.";

// Prose changed in the flow of its words: what was taken out struck through, what was put in underlined.
export default function DiffViewerProse() {
  return (
    <DiffViewer
      mode="inline"
      title="Order email"
      oldValue={before}
      newValue={after}
    />
  );
}
