// Shows a part's hover, keyboard focus and pressed states standing still, for the States block.
// It reads the page's own stylesheets and, for every rule whose selector names :hover,
// :focus-visible or :active, adds the same rule with that state replaced by "inside a cell marked
// [data-force~="<state>"]". So a forced cell shows exactly what the part's real CSS does, and no
// value is ever copied. The same approach as the website's sheet.
//
// StyleX writes its rules into cascade layers and media queries; new rules are inserted next to
// the original, inside the same layer and the same query, so they keep its place in the cascade.
// `.x:hover` (0,2,0) becomes `.x:is([data-force~="hover"], [data-force~="hover"] *)`, also (0,2,0);
// the focus form weighs one attribute more, which only matters inside a forced cell.
const STATE = /:(hover|focus-visible|active)(?![\w-])/gu;

// Hover and pressed reach everything in the cell (the pointer is over all of it). Keyboard focus
// is on one thing only: the controls in the cell, not their words or the cell's label.
// A forced state stops at a layer: a popover, dialog, listbox or menu opened from a forced cell is
// drawn inside the cell, and without this the cell's forced focus reached every day and preset of a
// date range picker's calendar. What a layer holds shows its own real states.
const LAYER =
  ':is([popover], [role="dialog"], [role="alertdialog"], [role="listbox"], [role="menu"])';
// Keyboard focus lands on one stop of a roving group, so a forced focus cell rings only that one: not
// a control taken out of the tab order (tabindex="-1", the others of a roving group), nor a radio
// that is not the chosen one of its group, which Tab passes by too. In a date field Tab lands on the
// first date, so the end date and the calendar button after it are passed by too.
const OFF_TAB =
  ':is([tabindex="-1"], input[type="radio"]:not(:checked), [data-slot="date-picker"] input:not([type="hidden"]) ~ *)';
const forced = (state: string) =>
  state === "focus-visible"
    ? `:is([data-force~="${state}"] :is(button, a[href], input, select, textarea, [tabindex])):not(${LAYER}, ${LAYER} *, ${OFF_TAB})`
    : `:is([data-force~="${state}"], [data-force~="${state}"] *):not(${LAYER}, ${LAYER} *)`;

// A state inside :not(...) is left alone: ":not(:hover)" must keep its meaning.
const rewrite = (selector: string) => {
  let out = "";
  let depth = 0;
  for (let index = 0; index < selector.length;) {
    if (selector.startsWith(":not(", index)) {
      depth += 1;
      out += ":not(";
      index += 5;
      continue;
    }
    const char = selector[index];
    if (char === "(" && depth > 0) {
      depth += 1;
    } else if (char === ")" && depth > 0) {
      depth -= 1;
    }
    if (depth === 0 && char === ":") {
      STATE.lastIndex = index;
      const match = STATE.exec(selector);
      if (match && match.index === index) {
        out += forced(match[1] ?? "");
        index += match[0].length;
        continue;
      }
    }
    out += char;
    index += 1;
  }
  return out;
};

const seen = new WeakSet<CSSRule | CSSStyleSheet>();

const walk = (container: CSSStyleSheet | CSSGroupingRule) => {
  let rules: CSSRuleList;
  try {
    rules = container.cssRules;
  } catch {
    // A sheet from another origin: not ours to read.
    return;
  }
  for (let index = 0; index < rules.length; index += 1) {
    const rule = rules[index];
    if (!rule || seen.has(rule)) {
      continue;
    }
    seen.add(rule);
    if (rule instanceof CSSStyleRule) {
      const selector = rule.selectorText;
      STATE.lastIndex = 0;
      if (selector.includes("data-force") || !STATE.test(selector)) {
        continue;
      }
      const next = rewrite(selector);
      if (next === selector) {
        continue;
      }
      try {
        container.insertRule(`${next}{${rule.style.cssText}}`, index + 1);
        const inserted = container.cssRules[index + 1];
        if (inserted) {
          seen.add(inserted);
        }
        index += 1;
      } catch {
        // A selector this browser cannot parse once rewritten: leave the rule as it is.
      }
    } else if (rule instanceof CSSGroupingRule) {
      walk(rule);
    }
  }
};

const run = () => {
  if (!document.querySelector("[data-force]")) {
    return;
  }
  for (const sheet of document.styleSheets) {
    walk(sheet);
  }
  // Said once the forced rules are in, so a script that reads the forced cells can wait for this
  // instead of for a fixed time.
  document.documentElement.dataset.forcedStates = "ready";
};

let queued = 0;
const queue = () => {
  cancelAnimationFrame(queued);
  queued = requestAnimationFrame(run);
};

export const forceStates = () => {
  run();
  addEventListener("load", run);
  // The dev server swaps a <style> when a file is saved, and a page change brings new sheets.
  new MutationObserver(queue).observe(document.head, {
    characterData: true,
    childList: true,
    subtree: true,
  });
  document.addEventListener("astro:after-swap", queue);
};
