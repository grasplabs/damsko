import { TableOfContents } from "@grasp-os/ui/components/table-of-contents";
import { CopyIcon, Icon, MessageCircleIcon } from "@grasp-os/ui/lib/icons";
import {
  focusRing,
  focusRingText,
  scrollbarHidden,
} from "@grasp-os/ui/lib/styles";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { itemsOf, look, publishingGuide } from "./article";
import type { Section } from "./article";

// The guide in parts: a first section with no part, "Using it", and a "Reference" whose sections
// are collapsed on the page. The page's own actions stand in the table of contents' foot.
const sections = publishingGuide("parts");

const markdown = sections
  .map(
    (section) =>
      `${section.level === 3 ? "###" : "##"} ${section.label}\n\n${section.text.join("\n\n")}`
  )
  .join("\n\n");

/** A section's heading, its words under it; a collapsed one opens from its heading. */
const Body = ({
  section,
  afterPart,
}: {
  section: Section;
  afterPart: boolean;
}) => {
  const heading = (
    <h3
      id={section.id}
      {...stylex.props(
        look.heading,
        section.level === 3 && look.sub,
        section.collapsed === true && look.foldHeading,
        afterPart && look.afterPart
      )}
    >
      {section.label}
    </h3>
  );
  const words = section.text.map((text) => (
    <p key={text} {...stylex.props(look.paragraph)}>
      {text}
    </p>
  ));
  if (section.collapsed === true) {
    return (
      <details {...stylex.props(look.fold, afterPart && look.afterPart)}>
        <summary {...stylex.props(look.summary, focusRingText)}>
          {heading}
        </summary>
        {words}
      </details>
    );
  }
  return (
    <section>
      {heading}
      {words}
    </section>
  );
};

export default function TableOfContentsParts() {
  const [copied, setCopied] = useState(false);
  return (
    <div {...stylex.props(look.frame)}>
      <div
        id="table-of-contents-parts-page"
        tabIndex={0}
        role="region"
        aria-label="Publishing a post"
        {...stylex.props(look.page, scrollbarHidden, focusRing)}
      >
        <h2 {...stylex.props(look.title)}>Publishing a post</h2>
        <p {...stylex.props(look.lead)}>
          From a first draft to a post your readers see, and the settings that
          shape it.
        </p>
        {sections.map((section, index) => (
          <div key={section.id}>
            {section.group !== undefined &&
            section.group !== sections[index - 1]?.group ? (
              <p {...stylex.props(look.part)}>{section.group}</p>
            ) : null}
            <Body
              section={section}
              afterPart={
                section.group !== undefined &&
                section.group !== sections[index - 1]?.group
              }
            />
          </div>
        ))}
        <div {...stylex.props(look.end)} />
      </div>
      <div {...stylex.props(look.side)}>
        <TableOfContents
          container="#table-of-contents-parts-page"
          items={itemsOf(sections)}
          footer={
            <div {...stylex.props(look.actions)}>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard
                    .writeText(markdown)
                    .catch(() => undefined);
                  setCopied(true);
                }}
                {...stylex.props(look.action, focusRingText)}
              >
                <Icon icon={CopyIcon} />
                {copied ? "Copied" : "Copy as Markdown"}
              </button>
              <a
                href="https://claude.ai/new"
                {...stylex.props(look.action, focusRingText)}
              >
                <Icon icon={MessageCircleIcon} />
                Open in chat
              </a>
            </div>
          }
        />
      </div>
    </div>
  );
}
