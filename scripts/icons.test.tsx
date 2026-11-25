// A product draws any Hugeicons drawing through Damsko's Icon, with no change to lib/icons: the
// drawing its own import gave, at the holder's size and stroke, and one marked directional turns
// round in right-to-left text as the house set's arrows do.
//
//   pnpm exec vp test scripts/icons.test.tsx
import { ArrowRight03Icon, Briefcase01Icon } from "@hugeicons/core-free-icons";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { ArrowRightIcon, directional, Icon } from "../src/lib/icons";

describe("a drawing the house set does not hold", () => {
  test("is drawn by Icon as the house set's are: its own parts, hidden beside words, named alone", () => {
    const beside = renderToStaticMarkup(<Icon icon={Briefcase01Icon} />);
    expect(beside).toMatch(/^<svg[^>]* aria-hidden="true"/u);
    expect(beside.match(/<path /gu)).toHaveLength(Briefcase01Icon.length);
    // The token's stroke stands on the svg; the drawing's own stroke attributes are left out.
    expect(beside).not.toContain('stroke-width="1.5"');

    const alone = renderToStaticMarkup(
      <Icon icon={Briefcase01Icon} label="Clients" />
    );
    expect(alone).toMatch(/^<svg[^>]* role="img" aria-label="Clients"/u);
  });

  test("marked directional, it mirrors right to left; unmarked, it is drawn as it is", () => {
    const next = directional(ArrowRight03Icon);
    expect(renderToStaticMarkup(<Icon icon={next} />)).toContain(
      'data-mirror=""'
    );
    expect(renderToStaticMarkup(<Icon icon={Briefcase01Icon} />)).not.toContain(
      "data-mirror"
    );
    expect(renderToStaticMarkup(<Icon icon={ArrowRightIcon} />)).toContain(
      'data-mirror=""'
    );
  });
});
