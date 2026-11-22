import { Markdown } from "@grasp-os/ui/components/markdown";

// Lists as an answer writes them: numbered steps, bullets, a list inside an item, and an item of
// two paragraphs.
const answer = `To move the team to the new office:

1. Book the rooms
2. Tell the team
   - Support, by Friday
   - Sales, on Monday
3. Move the desks

- Keys are at the front desk.
- Parking is in the basement.

  Ask for a card at the gate.`;

export default function MarkdownLists() {
  return <Markdown>{answer}</Markdown>;
}
