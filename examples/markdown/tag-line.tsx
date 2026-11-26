import { Markdown } from "@grasp-os/ui/components/markdown";

// For the spec only (tests/markdown.spec.ts), at /examples/markdown/tag-line; not on the page. A
// tool's tag on a line of its own, as a model passes it on, over a list of links: the tag is its
// words, and the list is a list.
const answer = `I found **41 issues** assigned to you that are **In Progress** in Linear:

<untrusted-ExpoGBLIFfAjjZadRE8wCg>
- [GRA-2306](https://linear.app/grasp-os/issue/GRA-2306/connector-layer) — Connector layer phase 0: threat model
- [GRA-2235](https://linear.app/grasp-os/issue/GRA-2235/guests) — Guests: outsiders with a platform account
- [GRA-2056](https://linear.app/grasp-os/issue/GRA-2056/keep-people) — Keep people and teams current
</untrusted-ExpoGBLIFfAjjZadRE8wCg>`;

export default function MarkdownTagLine() {
  return <Markdown>{answer}</Markdown>;
}
