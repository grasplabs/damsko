// The brand book's own way to the clipboard. It has no side effects, so a room can import it and
// still be drawn on the server (site/behaviour/copy.ts listens on the document as it loads).
//
// The browser's clipboard can refuse: an in-app browser, a framed page, a page without focus. Then
// the old command is tried before the button says "Could not copy".

const legacyCopy = (text: string) => {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.cssText = "position:fixed;opacity:0;pointer-events:none";
  document.body.append(area);
  area.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  area.remove();
  return copied;
};

/** Puts text on the clipboard, or throws so the button can say it could not. */
export const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    if (!legacyCopy(text)) {
      throw error;
    }
  }
};

/**
 * Puts text that is still on its way (a fetched file) on the clipboard. It is handed over as a
 * promise, so Safari keeps the press's permission while the file loads.
 */
export const copyLater = async (text: Promise<string>) => {
  try {
    const blob = text.then(
      (value) => new Blob([value], { type: "text/plain" })
    );
    await navigator.clipboard.write([
      new ClipboardItem({ "text/plain": blob }),
    ]);
  } catch {
    await copyText(await text);
  }
};
