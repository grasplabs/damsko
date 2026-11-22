import { TableOfContents } from "@grasp-os/ui/components/table-of-contents";
import { focusRing, scrollbarHidden } from "@grasp-os/ui/lib/styles";
import * as stylex from "@stylexjs/stylex";

import { itemsOf, look, workspaceGuide } from "./article";

// A tick for each section beside the page; resting on them or focusing them opens the names.
const sections = workspaceGuide("compact");

export default function TableOfContentsCompact() {
  return (
    <div {...stylex.props(look.frameCompact)}>
      <div
        id="table-of-contents-compact-page"
        tabIndex={0}
        role="region"
        aria-label="Setting up a workspace"
        {...stylex.props(look.page, scrollbarHidden, focusRing)}
      >
        <h2 {...stylex.props(look.title)}>Setting up a workspace</h2>
        <p {...stylex.props(look.lead)}>
          Everything a team needs before its first project, and what to do when
          it is done.
        </p>
        {sections.map((section) => (
          <section key={section.id}>
            <h3
              id={section.id}
              {...stylex.props(look.heading, section.level === 3 && look.sub)}
            >
              {section.label}
            </h3>
            {section.text.map((words) => (
              <p key={words} {...stylex.props(look.paragraph)}>
                {words}
              </p>
            ))}
          </section>
        ))}
        <div {...stylex.props(look.end)} />
      </div>
      <div {...stylex.props(look.beside)}>
        <TableOfContents
          variant="compact"
          container="#table-of-contents-compact-page"
          items={itemsOf(sections)}
        />
      </div>
    </div>
  );
}
