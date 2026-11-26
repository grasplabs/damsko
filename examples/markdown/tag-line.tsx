import { Markdown } from "@grasp-os/ui/components/markdown";

// For the spec only (tests/markdown.spec.ts), at /examples/markdown/tag-line; not on the page. A
// tool's tag on a line of its own, as a model passes it on, over a list of links: the tag is
// dropped, and the list is a list.
const answer = `I found **41 issues** assigned to you that are **in progress** in the tracker:

<untrusted-ExpoGBLIFfAjjZadRE8wCg>
- [ISS-2306](https://tracker.example.com/issue/ISS-2306/export-queue) — Move the export to a queue
- [ISS-2235](https://tracker.example.com/issue/ISS-2235/guests) — Guests see the pages shared with them
- [ISS-2056](https://tracker.example.com/issue/ISS-2056/keep-teams) — Keep teams current
</untrusted-ExpoGBLIFfAjjZadRE8wCg>`;

export default function MarkdownTagLine() {
  return <Markdown>{answer}</Markdown>;
}
