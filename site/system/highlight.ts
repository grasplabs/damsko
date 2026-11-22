// Code in Grasp's own colours. Every colour Shiki gives a token is a CSS variable (`--code-*`) that
// the site's stylesheet points at a Damsko token, so code follows light and dark, and a stage's
// Night ground, through light-dark() like everything else. The same theme serves the pages' fenced
// code (astro.config.ts, markdown.shikiConfig) and a stage's Code view (highlight below).
//
// Two "themes" that are one: Shiki then writes each colour into `--shiki-light` and
// `--shiki-dark` (defaultColor: false) instead of a fixed `color`, which the blocks' stylesheet
// reads (site/system/styles/blocks.css, `[data-code-source] span[style*="--shiki-light"]`).
import { codeToHtml } from "shiki";
import { createCssVariablesTheme } from "shiki/core";

export const codeTheme = createCssVariablesTheme({
  name: "grasp",
  variablePrefix: "--code-",
});

export const codeThemes = { light: codeTheme, dark: codeTheme };

/** Highlighted HTML (a whole <pre>) for a stage's source. An unknown language reads as plain text. */
export const highlight = async (
  code: string,
  lang: string
): Promise<string> => {
  try {
    return await codeToHtml(code, {
      lang,
      themes: codeThemes,
      defaultColor: false,
    });
  } catch {
    const escaped = code
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
    return `<pre><code>${escaped}</code></pre>`;
  }
};
