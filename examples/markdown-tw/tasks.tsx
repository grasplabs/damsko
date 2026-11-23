import { Markdown } from "@grasp-os/ui/components-tw/markdown";

const plan = `### Before Friday

- [x] Gather the comments
- [x] Count the open requests
- [ ] Add the survey results
- [ ] Share with the team

---

Done items are ticked; the rest wait.`;

export default function MarkdownTasks() {
  return <Markdown>{plan}</Markdown>;
}
