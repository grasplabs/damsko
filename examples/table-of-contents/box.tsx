import { TableOfContents } from "@grasp-os/ui/components/table-of-contents";
import { focusRing, scrollbarHidden } from "@grasp-os/ui/lib/styles";
import * as stylex from "@stylexjs/stylex";

import { itemsOf, look, privacyPolicy } from "./article";

// The policy scrolls in its box under a header that stays in view. `offset` puts the reading line
// below that header, so a section counts as read once its heading comes out from under it.
const sections = privacyPolicy("box");

export default function TableOfContentsBox() {
  return (
    <div {...stylex.props(look.frame)}>
      <div
        id="table-of-contents-box-page"
        tabIndex={0}
        role="region"
        aria-label="Privacy policy"
        {...stylex.props(
          look.page,
          look.pageWithHeader,
          scrollbarHidden,
          focusRing
        )}
      >
        <div {...stylex.props(look.header, look.headerWide)}>
          <p {...stylex.props(look.headerTitle)}>Privacy policy</p>
          <p {...stylex.props(look.headerNote)}>Updated 3 November 2026</p>
        </div>
        {sections.map((section) => (
          <section key={section.id}>
            <h3
              id={section.id}
              {...stylex.props(look.heading, look.headingUnder)}
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
      <div {...stylex.props(look.side)}>
        <TableOfContents
          container="#table-of-contents-box-page"
          offset={112}
          title="In this policy"
          items={itemsOf(sections)}
        />
      </div>
    </div>
  );
}
