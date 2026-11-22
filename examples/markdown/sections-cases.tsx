import { Markdown } from "@grasp-os/ui/components/markdown";
import { useEffect, useState } from "react";

// A fixture for tests/markdown.spec.ts, not on the page: the edges of sections in Markdown.
const nested = `<details>
<summary>Outer</summary>

Outer words.

<details>
<summary>Inner</summary>

Inner words.

</details>

</details>`;

const notSections = `<details>
No summary line, so it stays text.
</details>

<div>Other HTML stays text.</div>

<details>
<summary>Never closed</summary>

Still text, as it never closes.`;

const streamed = `Before.

<details>
<summary>Arrives whole</summary>

- One
- Two

</details>

After.`;

/** The streamed answer, a few characters at a time. */
const useStream = (text: string) => {
  const [shown, setShown] = useState("");
  useEffect(() => {
    const timer = setInterval(() => {
      setShown((now) => {
        if (now.length >= text.length) {
          clearInterval(timer);
          return now;
        }
        return text.slice(0, now.length + 4);
      });
    }, 30);
    return () => {
      clearInterval(timer);
    };
  }, [text]);
  return { shown, done: shown.length >= text.length };
};

export default function MarkdownSectionsCases() {
  const { shown, done } = useStream(streamed);
  return (
    <div>
      <section data-case="nested">
        <Markdown>{nested}</Markdown>
      </section>
      <section data-case="not">
        <Markdown>{notSections}</Markdown>
      </section>
      <section data-case="small">
        <Markdown size="sm">{nested}</Markdown>
      </section>
      <section data-case="streamed" data-done={done || undefined}>
        <Markdown streaming={!done}>{shown}</Markdown>
      </section>
    </div>
  );
}
