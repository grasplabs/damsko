import { Markdown } from "@grasp-os/ui/components/markdown";

// An agent's instructions with a collapsible section, written as GitHub's <details> with its
// <summary> line: Markdown draws it as one, closed until it is opened; `<details open>` stands open from the start.
const instructions = `## Rules

- Never approve or reject a claim yourself.
- Write in the claim's language.

<details>
<summary>The policy's **limits**</summary>

- Meals: €40 a day.
- Travel: second class by train, economy by air.
- Hotels: €160 a night, €220 in Amsterdam.

</details>

<details open>
<summary>Who decides</summary>

The claim's approver decides, never the agent.

</details>`;

export default function MarkdownSections() {
  return <Markdown>{instructions}</Markdown>;
}
