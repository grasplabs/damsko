"use client";

import { Markdown } from "@grasp-os/ui/components/markdown";
import { useEffect, useState } from "react";

// For the spec only (tests/markdown.spec.ts), at /examples/markdown/math-growing; not on the page.
// A formula in a sentence, written until it is past the 4,000 characters a formula is drawn up to:
// drawn while it is under them, its TeX once it is past them.
const grown = (terms: number) =>
  `A long one: $$${"x+".repeat(terms)}x$$ and on.`;

export default function MarkdownMathGrowing() {
  const [terms, setTerms] = useState(1980);
  useEffect(() => {
    const timer = setInterval(() => {
      setTerms((now) => {
        if (now >= 2040) {
          clearInterval(timer);
          return now;
        }
        return now + 10;
      });
    }, 150);
    return () => {
      clearInterval(timer);
    };
  }, []);
  return (
    <div data-done={terms >= 2040 ? "" : undefined}>
      <Markdown streaming={terms < 2040}>{grown(terms)}</Markdown>
    </div>
  );
}
