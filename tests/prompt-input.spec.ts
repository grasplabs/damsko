import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import {
  fixedTime,
  listenToLiveRegions,
  openExample,
  pickerFrom,
} from "./example.ts";

/** One prompt input of the Send example, by its name. */
const form = (page: Page, name: string) =>
  page.getByRole("form", { name: `Message, ${name}` });

/** Puts the caret at the end of the text and types. */
const typeAtEnd = async (page: Page, words: string) => {
  await page.keyboard.press("ControlOrMeta+End");
  await page.keyboard.type(words);
};

/** Pastes plain text into the text box where its caret or selection is. */
const paste = async (page: Page, text: string) => {
  await page
    .getByRole("textbox", { name: "Message" })
    .evaluate((element, words) => {
      const data = new DataTransfer();
      data.setData("text/plain", words);
      element.dispatchEvent(
        new ClipboardEvent("paste", {
          clipboardData: data,
          bubbles: true,
          cancelable: true,
        })
      );
    }, text);
};

/** Pastes, or drops, a file onto the text box. */
const giveFile = async (page: Page, how: "paste" | "drop", name: string) => {
  await page.getByRole("textbox", { name: "Message" }).evaluate(
    (element, given) => {
      const data = new DataTransfer();
      data.items.add(new File(["hello"], given.name, { type: "text/plain" }));
      element.dispatchEvent(
        given.how === "paste"
          ? new ClipboardEvent("paste", {
              clipboardData: data,
              bubbles: true,
              cancelable: true,
            })
          : new DragEvent("drop", {
              dataTransfer: data,
              bubbles: true,
              cancelable: true,
            })
      );
    },
    { how, name }
  );
};

/** Selects the text box's characters from `start` to `end`: a caret when they are the same. */
const select = async (page: Page, start: number, end: number) => {
  await page.getByRole("textbox", { name: "Message" }).evaluate(
    (element, range) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const node = walker.nextNode();
      if (node !== null) {
        document
          .getSelection()
          ?.setBaseAndExtent(node, range.start, node, range.end);
      }
    },
    { start, end }
  );
};

/** How tall the card round a text box stands. */
const heightOf = async (card: Locator) =>
  await card.evaluate((element) => element.getBoundingClientRect().height);

const limitText =
  "Summarise the supplier review for the board, in three short points, and say which risk needs a decision first.";
const cutSaid = "What was added was cut at the limit of 120 characters";

test("Send is off while there is nothing to send, and on once there is", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "send");
  await expect(
    form(page, "empty").getByRole("button", { name: "Send" })
  ).toBeDisabled();
  await expect(
    form(page, "typed").getByRole("button", { name: "Send" })
  ).toBeEnabled();
});

test("while the answer comes Send is Stop, and Stop brings Send back", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "send");
  const working = form(page, "working");
  await working.getByRole("button", { name: "Stop" }).click();
  await expect(working.getByRole("button", { name: "Send" })).toBeVisible();
  await expect(working.getByRole("button", { name: "Stop" })).toHaveCount(0);
});

test("once sent, Send is busy and waits; after a failure it sends again", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "send");
  const sent = form(page, "sent").getByRole("button", { name: "Send" });
  await expect(sent).toHaveAttribute("aria-busy", "true");
  await expect(sent).toHaveAttribute("aria-disabled", "true");
  await expect(
    form(page, "failed").getByRole("button", { name: "Send" })
  ).toBeEnabled();
});

test("Enter sends what was typed and clears it; Shift+Enter starts a new line", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "basic");
  const text = page.getByRole("textbox", { name: "Message" });
  await text.click();
  await page.keyboard.type("line one");
  await page.keyboard.press("Shift+Enter");
  await page.keyboard.type("line two");
  await expect(page.getByText(/^Sent:/u)).toHaveCount(0);
  await page.keyboard.press("Enter");
  await expect(page.getByText(/^Sent: line one\s+line two$/u)).toBeVisible();
  await expect(text).toHaveText("");
  await expect(text).toBeFocused();
});

test("Enter while an input method composes does not send", async ({ page }) => {
  await openExample(page, "prompt-input", "basic");
  const text = page.getByRole("textbox", { name: "Message" });
  await text.click();
  await page.keyboard.type("nihon");
  await text.evaluate((element) => {
    element.dispatchEvent(new CompositionEvent("compositionstart"));
    element.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        isComposing: true,
        bubbles: true,
        cancelable: true,
      })
    );
  });
  await expect(page.getByText("Nothing sent yet.")).toBeVisible();
  await text.evaluate((element) => {
    element.dispatchEvent(new CompositionEvent("compositionend"));
  });
  await page.keyboard.press("Enter");
  await expect(page.getByText("Sent: nihon")).toBeVisible();
});

test("the send button sends, and Stop ends the answer as it streams", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "basic");
  await page.getByRole("textbox", { name: "Message" }).click();
  await page.keyboard.type("What changed?");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText("Sent: What changed?")).toBeVisible();
  await page.getByRole("button", { name: "Stop" }).click();
  // onStop ran, and the status it set turned Stop back into Send.
  await expect(page.getByText("Stopped: What changed?")).toBeVisible();
  await expect(
    page.getByRole("form", { name: "Message the assistant" })
  ).toHaveAttribute("data-status", "ready");
  await expect(page.getByRole("button", { name: "Stop" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Send" })).toBeDisabled();
});

test("@ opens the menu at the caret, and a pick goes in as one token that Backspace takes out whole", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "mentions");
  const text = page.getByRole("textbox", { name: "Message" });
  await text.click();
  await page.keyboard.type("Ask @am");
  const menu = page.getByRole("listbox");
  await expect(
    menu.getByRole("group", { name: "People" }).getByRole("option", {
      name: "Amara Okafor",
    })
  ).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(menu).toBeHidden();
  await expect(text).toContainText("Ask Amara Okafor");
  // Said as it goes in, with its kind.
  await expect(
    page.getByRole("status").filter({ hasText: "Amara Okafor" }).first()
  ).toContainText("mention");
  await page.keyboard.press("Backspace");
  await page.keyboard.press("Backspace");
  await expect(text).not.toContainText("Amara");
  await expect(text).toContainText("Ask");
});

test("a picked token goes with the message, by what it stands for", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "mentions");
  await page.getByRole("textbox", { name: "Message" }).click();
  await page.keyboard.type("Read @brief");
  await page.getByRole("option", { name: /brief\.pdf/u }).click();
  await page.keyboard.type("now");
  await page.keyboard.press("Enter");
  await expect(
    page.getByText("Sent: Read [@brief.pdf](mention:brief) now (brief.pdf)")
  ).toBeVisible();
});

test("/ opens commands only at a line's start", async ({ page }) => {
  await openExample(page, "prompt-input", "mentions");
  await page.getByRole("textbox", { name: "Message" }).click();
  await page.keyboard.type("a /");
  await expect(page.getByRole("listbox")).toBeHidden();
  await page.keyboard.press("Shift+Enter");
  await page.keyboard.type("/su");
  await expect(page.getByRole("option", { name: /summary/u })).toBeVisible();
});

test("an answer that comes after a newer query never replaces its items", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "mentions", { time: fixedTime });
  await page.getByRole("textbox", { name: "Message" }).click();
  await page.keyboard.type("@a");
  // The menu asks for "a", which takes the pretend server long; then for "am", which does not.
  await page.clock.runFor(300);
  await page.keyboard.type("m");
  await page.clock.runFor(500);
  const options = page.getByRole("listbox").getByRole("option");
  await expect(options).toHaveText([/Amara Okafor/u]);
  // The answer for "a" comes now, late: it is set aside.
  await page.clock.runFor(1500);
  await expect(options).toHaveText([/Amara Okafor/u]);
});

test("a menu whose items fail to load says so, and Escape closes only the menu", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "mentions");
  await page.getByRole("textbox", { name: "Message" }).click();
  await page.keyboard.type("#gen");
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Could not load suggestions" })
      .first()
  ).toBeVisible();
  await page.evaluate(() => {
    Object.assign(window, { heard: 0 });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        Object.assign(window, {
          heard: Number(Reflect.get(window, "heard")) + 1,
        });
      }
    });
  });
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("status").filter({ hasText: "Could not load suggestions" })
  ).toBeHidden();
  expect(await page.evaluate(() => Number(Reflect.get(window, "heard")))).toBe(
    0
  );
});

test("the action menu opens from the plus, and Escape closes only the menu", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "basic");
  await page.getByRole("button", { name: "Add to message" }).click();
  const menu = page.getByRole("menu");
  await expect(
    menu.getByRole("menuitem", { name: /Add files/u })
  ).toBeVisible();
  await page.evaluate(() => {
    Object.assign(window, { heard: 0 });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        Object.assign(window, {
          heard: Number(Reflect.get(window, "heard")) + 1,
        });
      }
    });
  });
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Add to message" })
  ).toBeFocused();
  expect(await page.evaluate(() => Number(Reflect.get(window, "heard")))).toBe(
    0
  );
});

test("a tool's tooltip describes it", async ({ page }) => {
  await openExample(page, "prompt-input", "takeover");
  const tool = page.getByRole("button", { name: "Ask me first" });
  await tool.focus();
  await expect(tool).toHaveAccessibleDescription(
    "A question stands in the text's place"
  );
});

test("files pasted into the text, dropped on it, or picked with Add files, are attached", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "attachments");
  const files = page.getByRole("list", { name: "Files to send" });
  await expect(files).toHaveCount(0);
  await giveFile(page, "paste", "notes.txt");
  await expect(files.getByRole("listitem")).toHaveCount(1);
  await expect(files).toContainText("notes.txt");
  await expect(page.getByRole("textbox", { name: "Message" })).toHaveText("");

  await giveFile(page, "drop", "dropped.txt");
  await expect(files.getByRole("listitem")).toHaveCount(2);
  await expect(files).toContainText("dropped.txt");

  await page.getByRole("button", { name: "Add to message" }).click();
  const picker = await pickerFrom(page, async () => {
    await page.getByRole("menuitem", { name: "Add files" }).click();
  });
  await picker.setFiles({
    name: "plan.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF"),
  });
  await expect(files.getByRole("listitem")).toHaveCount(3);

  await page.getByRole("button", { name: "Remove dropped.txt" }).click();
  await expect(files.getByRole("listitem")).toHaveCount(2);
  await expect(files).not.toContainText("dropped.txt");
});

test("a paste of a file together with words keeps both", async ({ page }) => {
  await openExample(page, "prompt-input", "attachments");
  const text = page.getByRole("textbox", { name: "Message" });
  await text.click();
  await text.evaluate((element) => {
    const data = new DataTransfer();
    data.setData("text/plain", "Q1\t120");
    data.items.add(new File(["png"], "cells.png", { type: "image/png" }));
    element.dispatchEvent(
      new ClipboardEvent("paste", {
        clipboardData: data,
        bubbles: true,
        cancelable: true,
      })
    );
  });
  await expect(text).toContainText("Q1");
  await expect(page.getByRole("list", { name: "Files to send" })).toContainText(
    "cells.png"
  );
});

test("files alone are nothing to send: Send stays off until there are words", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "attachments");
  await giveFile(page, "paste", "notes.txt");
  const send = page.getByRole("button", { name: "Send" });
  await expect(send).toBeDisabled();
  await page.getByRole("textbox", { name: "Message" }).click();
  await page.keyboard.type("Read this");
  await expect(send).toBeEnabled();
});

test("a file dragged over the page tints the card and says what a drop does, before it is over the card", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "attachments");
  const card = page
    .getByRole("group")
    .filter({ has: page.getByRole("textbox", { name: "Message" }) });
  const atRest = await card.evaluate(
    (element) => getComputedStyle(element).backgroundColor
  );
  await expect(page.getByText("Drop to add")).toHaveCount(0);
  await page.evaluate(() => {
    const data = new DataTransfer();
    data.items.add(new File(["x"], "plan.pdf", { type: "application/pdf" }));
    document.body.dispatchEvent(
      new DragEvent("dragenter", { dataTransfer: data, bubbles: true })
    );
  });
  await expect(page.getByText("Drop to add")).toBeVisible();
  expect(
    await card.evaluate((element) => getComputedStyle(element).backgroundColor)
  ).not.toBe(atRest);
  await page.evaluate(() => {
    const data = new DataTransfer();
    data.items.add(new File(["x"], "plan.pdf", { type: "application/pdf" }));
    document.body.dispatchEvent(
      new DragEvent("dragleave", { dataTransfer: data, bubbles: true })
    );
  });
  await expect(page.getByText("Drop to add")).toHaveCount(0);
});

test("hidden and shown again, a file's picture still loads", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "hidden");
  await page
    .getByRole("textbox", { name: "Message" })
    .evaluate(async (element) => {
      const canvas = new OffscreenCanvas(8, 8);
      canvas.getContext("2d")?.fillRect(0, 0, 8, 8);
      const blob = await canvas.convertToBlob();
      const data = new DataTransfer();
      data.items.add(new File([blob], "photo.png", { type: "image/png" }));
      element.dispatchEvent(
        new ClipboardEvent("paste", {
          clipboardData: data,
          bubbles: true,
          cancelable: true,
        })
      );
    });
  const files = page.getByRole("list", { name: "Files to send" });
  const file = files.getByRole("listitem").filter({ hasText: "photo.png" });
  await expect(file).toHaveCount(1);
  await page.getByRole("button", { name: "Hide" }).click();
  await expect(files).toBeHidden();
  await page.getByRole("button", { name: "Show" }).click();
  await expect(files).toBeVisible();
  await expect(file).toHaveCount(1);
  // A picture drawn anew from the file's address loads: the address was not let go.
  await expect
    .poll(
      async () =>
        await file.evaluate(async (item) => {
          const shown = item.querySelector("img")?.src ?? "";
          const picture = new Image();
          picture.src = shown;
          return await picture.decode().then(
            () => true,
            () => false
          );
        })
    )
    .toBe(true);
});

test("the files go with the message, and are taken off once it is sent", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "attachments", { time: fixedTime });
  await giveFile(page, "paste", "notes.txt");
  await page.getByRole("textbox", { name: "Message" }).click();
  await page.keyboard.type("Read this");
  await page.keyboard.press("Enter");
  await page.clock.runFor(1000);
  await expect(page.getByText("Sent: Read this (notes.txt)")).toBeVisible();
  await expect(page.getByRole("list", { name: "Files to send" })).toHaveCount(
    0
  );
});

test("a second Enter while a send is out sends nothing more", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "attachments", { time: fixedTime });
  await page.getByRole("textbox", { name: "Message" }).click();
  await page.keyboard.type("hello");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await page.clock.runFor(2000);
  await expect(page.getByText("Sent: hello")).toHaveCount(1);
});

test("the words stay until the send succeeds, and words typed while it is out stay", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "attachments", { time: fixedTime });
  const text = page.getByRole("textbox", { name: "Message" });
  await text.click();
  await page.keyboard.type("first");
  await page.keyboard.press("Enter");
  // Still there while the send is out.
  await expect(text).toHaveText("first");
  await page.clock.runFor(1000);
  await expect(page.getByText("Sent: first")).toBeVisible();
  await expect(text).toHaveText("");

  await page.keyboard.type("second");
  await page.keyboard.press("Enter");
  await page.keyboard.type(" and more");
  await page.clock.runFor(1000);
  await expect(page.getByText("Sent: second")).toBeVisible();
  await expect(text).toHaveText("second and more");
});

test("the speech button says whether it listens", async ({ page }) => {
  await openExample(page, "prompt-input", "compact");
  const speech = page.getByRole("button", { name: "Dictate" });
  await expect(speech).toHaveAttribute("aria-pressed", "false");
  await speech.click();
  await expect(page.getByRole("group", { name: "Listening" })).toBeVisible();
  await page.getByRole("button", { name: "Done" }).click();
  await expect(speech).toHaveAttribute("aria-pressed", "false");
});

test("while it listens the footer is a bar: Cancel, the time, the microphone and Done", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "dictation", { time: fixedTime });
  const text = page.getByRole("textbox", { name: "Message" });
  await page.getByRole("button", { name: "Dictate" }).click();
  const bar = page.getByRole("group", { name: "Listening" });
  await expect(bar.getByRole("timer")).toHaveText("0:00");
  // The footer's own tools give way to the bar.
  await expect(page.getByRole("button", { name: "Send" })).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Add to message" })
  ).toBeHidden();
  await page.clock.runFor(2100);
  await expect(bar.getByRole("timer")).toHaveText("0:02");
  await expect(text).toContainText("Before Monday: send the");

  // Off for a moment: the time waits.
  const mute = bar.getByRole("button", { name: "Mute" });
  await mute.click();
  await expect(mute).toHaveAttribute("aria-pressed", "true");
  await page.clock.runFor(3000);
  await expect(bar.getByRole("timer")).toHaveText("0:02");

  // Done keeps what was heard: the bar waits while it is written down, its field draining and
  // its controls off, and then the footer is back.
  await bar.getByRole("button", { name: "Done" }).click();
  await expect(bar.getByRole("button", { name: "Done" })).toBeDisabled();
  await expect(bar.getByRole("button", { name: "Mute" })).toBeDisabled();
  await page.clock.runFor(700);
  await expect(bar).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
  await expect(text).toContainText("send the");

  // Cancel takes it out again.
  await page.getByRole("button", { name: "Dictate" }).click();
  await page.clock.runFor(1100);
  await page.getByRole("button", { name: "Cancel dictation" }).click();
  await expect(text).toHaveText("Before Monday:");
});

test("started from the keyboard, focus goes to Done, and back to Dictate as the bar goes", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "dictation");
  const speech = page.getByRole("button", { name: "Dictate" });
  await speech.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Done" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(speech).toBeFocused();
});

test("while it listens Enter in the text sends nothing, and Escape there cancels the dictation", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "dictation", { time: fixedTime });
  const text = page.getByRole("textbox", { name: "Message" });
  await page.getByRole("button", { name: "Dictate" }).click();
  const bar = page.getByRole("group", { name: "Listening" });
  await page.clock.runFor(1100);
  await expect(text).toContainText("Before Monday: send");
  await text.focus();
  await page.keyboard.press("Enter");
  // Nothing went: the words are still there, and so is the bar.
  await expect(text).toContainText("Before Monday: send");
  await expect(bar).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(bar).toHaveCount(0);
  await expect(text).toHaveText("Before Monday:");
  await expect(text).toBeFocused();
});

test("a word heard but not yet final shows lighter after the text, and is no part of it", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "dictation", { time: fixedTime });
  const text = page.getByRole("textbox", { name: "Message" });
  await page.getByRole("button", { name: "Dictate" }).click();
  await expect(page.getByRole("group", { name: "Listening" })).toBeVisible();
  // The word being heard stands after the text, drawn by the text box, lighter than its words,
  // and is not among them.
  const look = async () =>
    await text.evaluate((element) => {
      const after = getComputedStyle(element, "::after");
      const heard = element.dataset.interim ?? "";
      return {
        shown: heard !== "" && after.content === `" ${heard}"`,
        lighter: after.color !== getComputedStyle(element).color,
        written: (element.textContent ?? "").trimEnd().endsWith(heard),
      };
    });
  await expect
    .poll(look)
    .toEqual({ shown: true, lighter: true, written: false });
  await page.getByRole("button", { name: "Done" }).click();
  await page.clock.runFor(700);
  await expect(text).not.toHaveAttribute("data-interim");
});

test("out of use, nothing can be typed or pressed", async ({ page }) => {
  await openExample(page, "prompt-input", "disabled");
  const text = page.getByRole("textbox", { name: "Message" });
  await expect(text).toHaveAttribute("aria-disabled", "true");
  await expect(
    page.getByRole("button", { name: "Add to message" })
  ).toBeDisabled();
  await expect(page.getByRole("button", { name: "Dictate" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Send" })).toBeDisabled();
});

test("near the limit a count shows, and at it typing stops and that is said", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "limit");
  await expect(page.getByText("110/120")).toBeVisible();
  await page.getByRole("textbox", { name: "Message" }).click();
  await typeAtEnd(page, " More words than fit.");
  await expect(page.getByText("120/120").last()).toBeVisible();
  await expect(
    page.getByText("The limit of 120 characters is reached")
  ).toBeAttached();
});

test("a paste past the limit goes in where the caret is, cut to fit, and that is said", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "limit");
  const text = page.getByRole("textbox", { name: "Message" });
  await text.click();
  await select(page, "Summarise".length, "Summarise".length);
  await paste(page, "ABCDEFGHIJKLMNOP");
  await expect(text).toHaveText(
    limitText.replace("Summarise", "SummariseABCDEFGHIJ")
  );
  await expect(page.getByText(cutSaid)).toBeAttached();
});

test("a paste over a selection past the limit replaces the selection with what fits", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "limit");
  const text = page.getByRole("textbox", { name: "Message" });
  await text.click();
  await select(page, 0, "Summarise".length);
  await paste(page, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  await expect(text).toHaveText(
    limitText.replace("Summarise", "ABCDEFGHIJKLMNOPQRS")
  );
  await expect(page.getByText(cutSaid)).toBeAttached();
});

test("a phrase an input method puts in at the limit is cut to fit, and that is said", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "limit");
  const text = page.getByRole("textbox", { name: "Message" });
  await text.click();
  await select(page, limitText.length, limitText.length);
  await text.evaluate((element) => {
    element.dispatchEvent(new CompositionEvent("compositionstart"));
  });
  await page.keyboard.insertText(" in a table, please");
  await text.evaluate((element) => {
    element.dispatchEvent(new CompositionEvent("compositionend"));
  });
  await expect(text).toHaveText(`${limitText} in a tabl`);
  await expect(page.getByText(cutSaid)).toBeAttached();
});

test("a mention that does not fit at the limit is left out, and that is said", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "limit");
  const text = page.getByRole("textbox", { name: "Message" });
  await text.click();
  await typeAtEnd(page, " @lin");
  await page.getByRole("option", { name: /Lin Hayashi/u }).click();
  await expect(page.getByText(cutSaid)).toBeAttached();
  await expect(text).not.toContainText("Lin Hayashi");
});

for (const width of [1440, 390]) {
  test(`at ${width}, a send that fails keeps the words, and a band under the card says so until the person types`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await openExample(page, "prompt-input", "failed", { time: fixedTime });
    const text = page.getByRole("textbox", { name: "Message" });
    const words = "Which invoices are still unpaid this quarter?";
    // The line on the band, apart from the live region that says it.
    const note = page
      .getByRole("paragraph")
      .filter({ hasText: "Could not send. Your message is kept." });
    await text.click();
    await page.keyboard.press("Enter");
    // The words never leave the text.
    await expect(text).toHaveText(words);
    await expect(note).toHaveCount(0);
    await page.clock.runFor(1000);
    await expect(note).toBeVisible();
    await expect(text).toHaveText(words);
    await expect(text).toHaveAccessibleDescription(
      "Could not send. Your message is kept."
    );

    // Under the card, in the destructive colour, with Send still an arrow to send again.
    const card = page.getByRole("group").filter({ has: text });
    const [cardBox, noteBox] = await Promise.all([
      card.boundingBox(),
      note.boundingBox(),
    ]);
    expect(cardBox).not.toBeNull();
    expect(noteBox).not.toBeNull();
    if (cardBox !== null && noteBox !== null) {
      expect(noteBox.y).toBeGreaterThanOrEqual(cardBox.y + cardBox.height);
    }
    const [noteColour, textColour] = await Promise.all([
      note.evaluate((element) => getComputedStyle(element).color),
      text.evaluate((element) => getComputedStyle(element).color),
    ]);
    expect(noteColour).not.toBe(textColour);
    await expect(page.getByRole("button", { name: "Send" })).toBeEnabled();

    // Typing takes the band away.
    await typeAtEnd(page, " Please");
    await expect(note).toHaveCount(0);
  });
}

test("a failure the status says shows in the band, and is said once", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "send");
  await expect(
    form(page, "failed")
      .getByRole("paragraph")
      .filter({ hasText: "Could not send. Your message is kept." })
  ).toBeVisible();
  // Said once to a screen reader, in the page's live region.
  await expect(
    page.getByRole("status").filter({ hasText: "Could not send" })
  ).toHaveCount(1);
});

for (const width of [1440, 390]) {
  test(`at ${width}, the card is 102px at rest, grows from the second line by 22px a line, and stops at 256px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await openExample(page, "prompt-input", "basic");
    const text = page.getByRole("textbox", { name: "Message" });
    const card = page.getByRole("group").filter({ has: text });
    const height = async () => await heightOf(card);
    expect(await height()).toBe(102);
    await text.click();
    await page.keyboard.type("one");
    expect(await height()).toBe(102);
    await page.keyboard.press("Shift+Enter");
    await page.keyboard.type("two");
    expect(await height()).toBe(124);
    await paste(page, "\n3\n4\n5\n6\n7\n8\n9\n10");
    expect(await height()).toBe(256);
  });
}

for (const width of [1440, 390, 300]) {
  test(`at ${width}, one row is 56px, and words too long for their line take the card's width, the tools under them`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await openExample(page, "prompt-input", "compact");
    const text = page.getByRole("textbox", { name: "Message" });
    const card = page.getByRole("group").filter({ has: text });
    const plus = page.getByRole("button", { name: "Add to message" });
    expect(await heightOf(card)).toBe(56);
    await text.click();
    await page.keyboard.type(
      "Draft a short note to the team about moving the launch review to Thursday, and say what still needs an owner before then."
    );
    const [textBox, cardInner, plusBox] = await Promise.all([
      text.boundingBox(),
      card.evaluate((element) => element.clientWidth),
      plus.boundingBox(),
    ]);
    expect(textBox).not.toBeNull();
    expect(plusBox).not.toBeNull();
    if (textBox !== null && plusBox !== null) {
      // The text has the whole width inside the card's 12px, and the tools stand under it.
      expect(textBox.width).toBe(cardInner - 24);
      expect(plusBox.y).toBeGreaterThanOrEqual(textBox.y + textBox.height);
    }
    // Short again, it is one row again.
    await page.keyboard.press("ControlOrMeta+a");
    await page.keyboard.type("Hi");
    await expect
      .poll(async () => await heightOf(card))
      .toBe(width === 300 ? 90 : 56);
  });
}

test("while the answer comes a light shows over the card, and the band under it says what the assistant does", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "working");
  const doing = page.getByText("Searching the web");
  await expect(doing.first()).toBeVisible();
  const text = page.getByRole("textbox", { name: "Message" });
  const card = page.getByRole("group").filter({ has: text });
  const [cardBox, doingBox] = await Promise.all([
    card.boundingBox(),
    doing.first().boundingBox(),
  ]);
  expect(cardBox).not.toBeNull();
  expect(doingBox).not.toBeNull();
  if (cardBox !== null && doingBox !== null) {
    expect(doingBox.y).toBeGreaterThanOrEqual(cardBox.y + cardBox.height);
  }
  const lit = async () =>
    await page
      .getByRole("form", { name: "Message the assistant" })
      .evaluate((element) =>
        [...element.querySelectorAll<HTMLElement>("[aria-hidden=true]")].some(
          (layer) =>
            layer.querySelector("[aria-hidden=true]") === null &&
            getComputedStyle(layer).backgroundImage.includes("gradient") &&
            getComputedStyle(
              layer.parentElement?.parentElement?.parentElement ?? layer
            ).opacity !== "0"
        )
      );
  expect(await lit()).toBe(true);
  // Stop ends the work: the band and the light go.
  await page.getByRole("button", { name: "Stop" }).click();
  await expect(doing).toHaveCount(0);
  await expect.poll(lit).toBe(false);
});

test("an accent colours the working light", async ({ page }) => {
  await openExample(page, "prompt-input", "accents");
  const colourOf = async (name: string) =>
    await page
      .getByRole("form", { name: `Message, ${name}` })
      .evaluate((element) => {
        // A beam's strip: the one layer whose light repeats across twice its room.
        const strip = [
          ...element.querySelectorAll<HTMLElement>("[aria-hidden=true] *"),
        ].find(
          (layer) => getComputedStyle(layer).backgroundSize === "50% 100%"
        );
        return strip === undefined
          ? ""
          : getComputedStyle(strip).backgroundImage;
      });
  const colours = await Promise.all(
    ["mint", "lavender", "info", "warning", "destructive"].map(colourOf)
  );
  expect(new Set(colours).size).toBe(5);
});

test("success is said once each time it comes", async ({ page }) => {
  await openExample(page, "prompt-input", "success");
  const said = page.getByRole("status").filter({ hasText: "Done" });
  await expect(said).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Send" })).toBeEnabled();
});

test("on glass the card lets what is behind it through", async ({ page }) => {
  await openExample(page, "prompt-input", "glass");
  const card = page
    .getByRole("group")
    .filter({ has: page.getByRole("textbox", { name: "Message" }) });
  const look = await card.evaluate((element) => {
    const style = getComputedStyle(element);
    return { filter: style.backdropFilter, colour: style.backgroundColor };
  });
  expect(look.filter).toContain("blur");
  expect(look.colour).toMatch(/\/ 0\.86|color-mix|, 0\.86\)/u);
});

test("a banner stands above the card with its action, and its close button takes it away", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "banner");
  const first = page.getByRole("form", { name: "Message, nothing connected" });
  const notice = first.getByText("Connect a provider to start asking");
  await expect(notice).toBeVisible();
  await expect(first.getByRole("button", { name: "Connect" })).toBeVisible();
  const [noticeBox, cardBox] = await Promise.all([
    notice.boundingBox(),
    first.getByRole("group").boundingBox(),
  ]);
  expect(noticeBox).not.toBeNull();
  expect(cardBox).not.toBeNull();
  if (noticeBox !== null && cardBox !== null) {
    expect(noticeBox.y + noticeBox.height).toBeLessThanOrEqual(cardBox.y);
  }
  const second = page.getByRole("form", { name: "Message, no microphone" });
  await second.getByRole("button", { name: "Dismiss" }).click();
  await expect(
    second.getByText("The microphone is blocked for this site")
  ).toHaveCount(0);
});

test("a banner that stops work is an alert, and closed from the keyboard it hands focus to the text", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "banner");
  const second = page.getByRole("form", { name: "Message, no microphone" });
  await expect(
    second.getByRole("alert").filter({ hasText: "The microphone is blocked" })
  ).toBeVisible();
  await second.getByRole("button", { name: "Dismiss" }).focus();
  await page.keyboard.press("Enter");
  await expect(second.getByRole("alert")).toHaveCount(0);
  await expect(
    second.getByRole("textbox", { name: "Message, no microphone" })
  ).toBeFocused();
});

test("a queued message taken off from the keyboard hands focus to the next row, and the last to the text", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "queue");
  const first = "Also compare it with last year's numbers";
  const second = "And say which region moved most";
  await page.getByRole("button", { name: `Remove: ${first}` }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("1 queued")).toBeVisible();
  await expect(
    page.getByRole("button", { name: `Edit: ${second}` })
  ).toBeFocused();
  await page.getByRole("button", { name: `Remove: ${second}` }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText(/queued/u)).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "Message" })).toBeFocused();
});

test("queued messages wait above the card: one is put back to edit, one taken off", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "queue");
  const text = page.getByRole("textbox", { name: "Message" });
  const first = "Also compare it with last year's numbers";
  const second = "And say which region moved most";
  await expect(page.getByText("2 queued")).toBeVisible();
  const [rowBox, cardBox] = await Promise.all([
    page.getByText(first).boundingBox(),
    page.getByRole("group").filter({ has: text }).boundingBox(),
  ]);
  expect(rowBox).not.toBeNull();
  expect(cardBox).not.toBeNull();
  if (rowBox !== null && cardBox !== null) {
    expect(rowBox.y + rowBox.height).toBeLessThanOrEqual(cardBox.y);
  }
  await page.getByRole("button", { name: `Edit: ${first}` }).click();
  await expect(text).toHaveText(first);
  await expect(text).toBeFocused();
  await expect(page.getByText("1 queued")).toBeVisible();
  await page.getByRole("button", { name: `Remove: ${second}` }).click();
  await expect(page.getByText(/queued/u)).toHaveCount(0);
});

test("the queue's fold shuts and opens it, and says whether it is open", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "queue");
  const fold = page.getByRole("button", { name: "2 queued" });
  const first = page.getByText("Also compare it with last year's numbers");
  await expect(fold).toHaveAttribute("aria-expanded", "true");
  await expect(first).toBeVisible();
  await fold.click();
  await expect(fold).toHaveAttribute("aria-expanded", "false");
  await expect(first).toBeHidden();
  await fold.press("Enter");
  await expect(fold).toHaveAttribute("aria-expanded", "true");
  await expect(first).toBeVisible();
});

test("while the page loads the card stands still in the same box, and nothing in it can be reached", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "loading");
  const toggle = page.getByRole("button", { name: "Let the data arrive" });
  const boxes = async () =>
    await page.evaluate(() =>
      [...document.querySelectorAll("fieldset")].map(
        (card) => card.getBoundingClientRect().height
      )
    );
  const still = await boxes();
  expect(still).toEqual([56, 102]);
  await expect(page.getByRole("textbox")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Send" })).toHaveCount(0);
  await toggle.focus();
  await page.keyboard.press("Tab");
  await expect(toggle).not.toBeFocused();
  await expect(page.locator("form :focus")).toHaveCount(0);
  await toggle.click();
  await expect(page.getByRole("textbox")).toHaveCount(2);
  expect(await boxes()).toEqual(still);
});

test("a file the product uploads says how far it is; a refused one says why, is said, holds Send and can be taken off", async ({
  page,
}) => {
  const said = await listenToLiveRegions(page);
  await openExample(page, "prompt-input", "uploads", { time: fixedTime });
  const files = page.getByRole("list", { name: "Files to send" });
  const text = page.getByRole("textbox", { name: "Message" });
  const send = page.getByRole("button", { name: "Send" });
  await page.getByRole("button", { name: "Add to message" }).click();
  const picker = await pickerFrom(page, async () => {
    await page.getByRole("menuitem", { name: "Add files" }).click();
  });
  await picker.setFiles([
    {
      name: "brief.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.alloc(40),
    },
    {
      name: "archive.zip",
      mimeType: "application/zip",
      buffer: Buffer.alloc(400),
    },
  ]);
  await expect(files.getByText("Uploading 0%")).toBeVisible();
  await expect(files.getByText("Larger than 64 bytes")).toBeVisible();
  await expect.poll(said).toContain("archive.zip: Larger than 64 bytes");
  // Both can be taken off, whatever their state; with words written, nothing is sent yet.
  await expect(
    files.getByRole("button", { name: "Remove brief.pdf" })
  ).toBeAttached();
  await text.click();
  await page.keyboard.type("Read these");
  await expect(send).toBeDisabled();
  await page.clock.runFor(3000);
  await expect(files.getByText(/Uploading/u)).toHaveCount(0);
  await expect(files.getByText("brief.pdf")).toBeVisible();
  // The refused file still holds the message, until it is taken off.
  await expect(send).toBeDisabled();
  await page.keyboard.press("Enter");
  await expect(text).toHaveText("Read these");
  await files.getByRole("button", { name: "Remove archive.zip" }).focus();
  await page.keyboard.press("Enter");
  await expect(files.getByText("archive.zip")).toHaveCount(0);
  await expect(send).toBeEnabled();
});

test("Send is busy while the message goes, sent with Enter as with a press", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "failed");
  const text = page.getByRole("textbox", { name: "Message" });
  const send = page.getByRole("button", { name: "Send" });
  await text.click();
  await page.keyboard.press("Enter");
  await expect(send).toHaveAttribute("aria-busy", "true");
  await expect(send).not.toHaveAttribute("aria-busy");
});

test("@ opens on the kinds; a kind keeps the menu open on its things, and typing searches every kind", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "mentions");
  const text = page.getByRole("textbox", { name: "Message" });
  await text.click();
  await page.keyboard.type("@");
  await expect(page.getByRole("option")).toHaveText([/People/u, /Files/u]);
  await page.keyboard.press("Enter");
  // Inside People: its three, no file, and no mention in the text yet.
  await expect(page.getByRole("option")).toHaveText([
    /Amara Okafor/u,
    /Tomas Varga/u,
    /Lin Hayashi/u,
  ]);
  await page.keyboard.type("li");
  await expect(page.getByRole("option")).toHaveText([/Lin Hayashi/u]);
  await page.keyboard.press("Enter");
  await expect(text).toContainText("Lin Hayashi");
  await expect(page.getByRole("option")).toHaveCount(0);
  // Typed at the first level, the words search people and files at once.
  await page.keyboard.type("@b");
  await expect(page.getByRole("option", { name: /brief\.pdf/u })).toBeVisible();
  await expect(
    page.getByRole("option", { name: /budget-2027\.xlsx/u })
  ).toBeVisible();
});

test("at the limit the count is ink, not the destructive colour, and on a narrow card it stands above Send", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await openExample(page, "prompt-input", "limit");
  const text = page.getByRole("textbox", { name: "Message" });
  await text.click();
  await typeAtEnd(page, " Please be brief and clear.");
  const count = page.getByText("120/120");
  await expect(count).toBeVisible();
  const [countColour, textColour] = await Promise.all([
    count.evaluate((element) => getComputedStyle(element).color),
    text.evaluate((element) => getComputedStyle(element).color),
  ]);
  expect(countColour).toBe(textColour);
  const [countBox, sendBox] = await Promise.all([
    count.boundingBox(),
    page.getByRole("button", { name: "Send" }).boundingBox(),
  ]);
  expect(countBox).not.toBeNull();
  expect(sendBox).not.toBeNull();
  if (countBox !== null && sendBox !== null) {
    expect(countBox.y + countBox.height).toBeLessThanOrEqual(sendBox.y);
  }
});

test("the mention menu opens under the caret, a name over its quiet line", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "mentions");
  const text = page.getByRole("textbox", { name: "Message" });
  await text.click();
  await page.keyboard.type("Ask @am");
  const option = page.getByRole("option", { name: /Amara Okafor/u });
  await expect(option).toBeVisible();
  const [textBox, optionBox, lineBox] = await Promise.all([
    text.boundingBox(),
    option.boundingBox(),
    option.getByText("Design lead").boundingBox(),
  ]);
  expect(textBox).not.toBeNull();
  expect(optionBox).not.toBeNull();
  expect(lineBox).not.toBeNull();
  if (textBox !== null && optionBox !== null && lineBox !== null) {
    expect(optionBox.y).toBeGreaterThan(textBox.y);
    // The quiet line is the row's second line, under the name.
    expect(lineBox.y).toBeGreaterThanOrEqual(
      optionBox.y + optionBox.height / 2
    );
  }
});

test("a question in the text's place takes the focus, and the text takes it back", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "takeover");
  const text = page.getByRole("textbox", { name: "Message" });
  await text.click();
  await page.keyboard.type("Draft");
  await page.getByRole("button", { name: "Ask me first" }).click();
  const sales = page.getByRole("button", { name: "Sales" });
  await expect(sales).toBeFocused();
  await sales.click();
  await expect(text).toBeFocused();
  await expect(text).toHaveText("Draft");
});

test("a press on the card's empty room puts the caret in the text", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "basic");
  const text = page.getByRole("textbox", { name: "Message" });
  const box = await text.boundingBox();
  expect(box).not.toBeNull();
  if (box !== null) {
    await page.mouse.click(box.x - 4, box.y + box.height / 2);
  }
  await expect(text).toBeFocused();
});

test("on a phone, files with long names keep their Remove clear of the row's fade, and Remove takes focus without scrolling the name away", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await openExample(page, "prompt-input", "attachments");
  const names = [
    "annual-supplier-contract-renewal-2027-signed-final-version.pdf",
    "second-quarter-figures-for-the-board-meeting-in-november.pdf",
  ];
  for (const name of names) {
    // oxlint-disable-next-line no-await-in-loop -- one file after the other, as a person drops them
    await giveFile(page, "drop", name);
  }
  const files = page.getByRole("list", { name: "Files to send" });
  await expect(files.getByRole("listitem")).toHaveCount(2);
  const remove = page.getByRole("button", { name: `Remove ${names[0]}` });
  const fade = 40;
  const clear = async () => {
    const [row, button] = await Promise.all([
      files.boundingBox(),
      remove.boundingBox(),
    ]);
    expect(row).not.toBeNull();
    expect(button).not.toBeNull();
    if (row !== null && button !== null) {
      expect(button.x + button.width).toBeLessThanOrEqual(
        row.x + row.width - fade
      );
    }
  };
  await clear();
  await remove.focus();
  expect(await files.evaluate((element) => element.scrollLeft)).toBe(0);
  await clear();
});

test("a line started with Shift+Enter in a full text is brought into view at once", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "basic");
  const text = page.getByRole("textbox", { name: "Message" });
  await text.click();
  for (let line = 0; line < 12; line += 1) {
    // oxlint-disable-next-line no-await-in-loop -- one key after the other, as a person types
    await page.keyboard.type(`line ${line}`);
    // oxlint-disable-next-line no-await-in-loop -- one key after the other, as a person types
    await page.keyboard.press("Shift+Enter");
  }
  // The caret's empty line is the last: nothing of the text is left under the fold.
  await expect
    .poll(
      async () =>
        await text.evaluate(
          (element) =>
            element.scrollHeight - element.clientHeight - element.scrollTop
        )
    )
    .toBeLessThanOrEqual(1);
});

test("a spoken conversation stands in the card: its turns are said, and Close gives the text back with the focus", async ({
  page,
}) => {
  const said = await listenToLiveRegions(page);
  await openExample(page, "prompt-input", "voice", { time: fixedTime });
  const voice = page.getByRole("group", { name: "Voice conversation" });
  await expect(voice).toBeVisible();
  // No text to type in and nothing to send while it runs; the card keeps its height.
  await expect(page.getByRole("textbox")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Send" })).toHaveCount(0);
  expect(await heightOf(page.getByRole("group").first())).toBe(102);
  // The other voice's turn: its mark stands where the time will, and its words come.
  await expect(voice.getByRole("timer")).toHaveCount(0);
  await page.clock.runFor(3100);
  await expect(voice).toContainText("What slows the");
  // The person's turn: the time is back, and the turn is said.
  await page.clock.runFor(6000);
  await expect(voice.getByRole("timer")).toBeVisible();
  await expect(voice).toContainText("Waiting");
  await expect
    .poll(async () => {
      const heard = await said();
      return heard.slice(0, 2);
    })
    .toEqual(["Speaking", "Listening"]);

  // Off for a moment: the time waits.
  const mute = voice.getByRole("button", { name: "Mute" });
  await mute.click();
  await expect(mute).toHaveAttribute("aria-pressed", "true");
  const held = await voice.getByRole("timer").textContent();
  await page.clock.runFor(3000);
  await expect(voice.getByRole("timer")).toHaveText(held ?? "");

  // Close gives the text back, and the focus with it.
  await voice.getByRole("button", { name: "Close voice" }).focus();
  await page.keyboard.press("Enter");
  await expect(voice).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "Answer" })).toBeFocused();
});

test("in one row a spoken conversation is the row, its words on the line before the field, the latest in view", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await openExample(page, "prompt-input", "voice-compact", {
    time: fixedTime,
  });
  const voice = page.getByRole("group", { name: "Voice conversation" });
  const card = page.getByRole("group").first();
  await expect(voice).toBeVisible();
  expect(await heightOf(card)).toBe(56);
  // The other voice's words come, and the card stays one row.
  await page.clock.runFor(6100);
  const words = voice.locator("[data-slot=prompt-input-voice-words]");
  await expect(words).toContainText("What slows the team down most?");
  expect(await heightOf(card)).toBe(56);
  // On the row's one line, between the other voice's mark and Mute; past their room, the newest
  // stand at its end and the first are cut at its start.
  const line = await words.boundingBox();
  const room = await words.locator("..").boundingBox();
  const mute = await voice.getByRole("button", { name: "Mute" }).boundingBox();
  expect(line?.height).toBeLessThanOrEqual(24);
  expect((room?.x ?? 0) + (room?.width ?? 0)).toBeLessThanOrEqual(mute?.x ?? 0);
  expect(line?.x ?? 0).toBeLessThan(room?.x ?? 0);
  expect(
    Math.abs(
      (line?.x ?? 0) + (line?.width ?? 0) - (room?.x ?? 0) - (room?.width ?? 0)
    )
  ).toBeLessThanOrEqual(1);
});

test("a spoken conversation takes the focus as it starts from the keyboard, and Escape ends it", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "voice");
  const voice = page.getByRole("group", { name: "Voice conversation" });
  await voice.getByRole("button", { name: "Close voice" }).click();
  const talk = page.getByRole("button", { name: "Talk instead" });
  await talk.focus();
  await page.keyboard.press("Enter");
  await expect(voice.getByRole("button", { name: "Mute" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(voice).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "Answer" })).toBeFocused();
});

for (const [problem, words, retry] of [
  ["Blocked", "Allow the microphone in the browser's settings.", true],
  ["Missing", "No microphone was found.", true],
  ["Connection", "The connection was lost.", true],
  ["Unsupported", "This browser can't dictate.", false],
  ["Timed out", "That's as long as one dictation can be.", false],
] as const) {
  test(`a voice stopped (${problem}) leaves the text at rest under a banner that says why${retry ? ", with another go" : ""}`, async ({
    page,
  }) => {
    const said = await listenToLiveRegions(page);
    await openExample(page, "prompt-input", "voice-problems");
    await page.getByRole("button", { name: problem, exact: true }).click();
    const alert = page.getByRole("alert");
    await expect(alert).toHaveText(new RegExp(words, "u"));
    // What was typed is kept, and can be written on.
    const text = page.getByRole("textbox", { name: "Message" });
    await expect(text).toHaveText("Before Monday:");
    const again = page.getByRole("button", { name: "Try again" });
    await expect(again).toHaveCount(retry ? 1 : 0);
    if (retry) {
      await again.focus();
      await page.keyboard.press("Enter");
      await expect(alert).toContainText("Tried 1 more.");
    }
    await page.getByRole("button", { name: "Dismiss" }).focus();
    await page.keyboard.press("Enter");
    await expect(alert).toHaveCount(0);
    await expect(text).toBeFocused();
    // The banner is its own announcement: nothing more is said of it.
    expect(await said()).toEqual([]);
  });
}

/** How many of the field's pixels are lit, and the colours it is lit in. */
const fieldDrawn = async (page: Page) =>
  await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    const pixels =
      canvas?.getContext("2d")?.getImageData(0, 0, canvas.width, canvas.height)
        .data ?? [];
    const colours = new Set<string>();
    let lit = 0;
    for (let at = 0; at < pixels.length; at += 4) {
      if ((pixels[at + 3] ?? 0) > 200) {
        lit += 1;
        colours.add(`${pixels[at]},${pixels[at + 1]},${pixels[at + 2]}`);
      }
    }
    return { lit, colours: [...colours] };
  });

/** How many of the field's pixels are lit. */
const fieldLit = async (page: Page) => {
  const drawn = await fieldDrawn(page);
  return drawn.lit;
};

test("the voice's field is drawn from the sound the product reads, a frame at a time", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openExample(page, "prompt-input", "voice");
  await expect(
    page.getByRole("group", { name: "Voice conversation" })
  ).toBeVisible();
  // Its pixels are there, and they change as the sound does.
  await expect.poll(async () => await fieldLit(page)).toBeGreaterThan(0);
  const first = await fieldLit(page);
  await expect.poll(async () => await fieldLit(page)).not.toBe(first);
});

test("in forced colours the voice's field is drawn in the system's text colour alone", async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: "active" });
  await openExample(page, "prompt-input", "voice");
  await expect.poll(async () => await fieldLit(page)).toBeGreaterThan(0);
  const ink = await page.evaluate(() => {
    const probe = document.createElement("canvas").getContext("2d");
    if (probe === null) {
      return "";
    }
    probe.fillStyle = "CanvasText";
    probe.fillRect(0, 0, 1, 1);
    const [red, green, blue] = probe.getImageData(0, 0, 1, 1).data;
    return `${red},${green},${blue}`;
  });
  const drawn = await fieldDrawn(page);
  expect(drawn.colours).toEqual([ink]);
});

test("right to left, a conversation's row runs the other way: the time at the right, Close at the left", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "voice");
  await page.evaluate(() => {
    document.documentElement.dir = "rtl";
  });
  const voice = page.getByRole("group", { name: "Voice conversation" });
  const [close, mute, field] = await Promise.all([
    voice.getByRole("button", { name: "Close voice" }).boundingBox(),
    voice.getByRole("button", { name: "Mute" }).boundingBox(),
    page.locator("canvas").boundingBox(),
  ]);
  expect(close).not.toBeNull();
  expect(mute).not.toBeNull();
  expect(field).not.toBeNull();
  if (close !== null && mute !== null && field !== null) {
    expect(close.x).toBeLessThan(mute.x);
    expect(mute.x).toBeLessThan(field.x);
  }
});

test("while it listens the words typed before step back, and what the dictation settles is ink", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "dictation", { time: fixedTime });
  const text = page.getByRole("textbox", { name: "Message" });
  // The words marked as typed before the dictation, as the page draws them quiet.
  const quiet = async () =>
    await page.evaluate(() =>
      [...(CSS.highlights.get("prompt-input-typed") ?? [])]
        .map((range) => (range instanceof Range ? range.toString() : ""))
        .join("|")
    );
  expect(await quiet()).toBe("");
  await page.getByRole("button", { name: "Dictate" }).click();
  await page.clock.runFor(2100);
  await expect(text).toContainText("Before Monday: send the");
  await expect.poll(quiet).toBe("Before Monday: ");
  // Words typed before them push the marked ones on: they are not marked themselves.
  await text.focus();
  await page.keyboard.press("Control+Home");
  await page.keyboard.type("NEW ");
  await expect(text).toContainText("NEW Before Monday: send the");
  await expect.poll(quiet).toBe("Before Monday: ");
  await page.getByRole("button", { name: "Done" }).click();
  await page.clock.runFor(700);
  await expect.poll(quiet).toBe("");
});

test("a conversation that is already running as the page comes takes no focus", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "voice");
  const voice = page.getByRole("group", { name: "Voice conversation" });
  await expect(voice.getByRole("button", { name: "Mute" })).toBeVisible();
  // Its field is drawn, so the page is awake; the focus is still the page's own.
  await expect.poll(async () => await fieldLit(page)).toBeGreaterThan(0);
  expect(
    await page.evaluate(() => document.activeElement === document.body)
  ).toBe(true);
});

test("the voice's field holds while it is out of view or not shown, and goes on as it comes back", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openExample(page, "prompt-input", "voice");
  await expect.poll(async () => await fieldLit(page)).toBeGreaterThan(0);
  // How many frames the page asks for in a moment: none while nothing draws.
  const frames = async () =>
    await page.evaluate(async () => {
      const done = Promise.withResolvers<number>();
      let asked = 0;
      const ask = globalThis.requestAnimationFrame;
      globalThis.requestAnimationFrame = (frame) => {
        asked += 1;
        return ask(frame);
      };
      setTimeout(() => {
        globalThis.requestAnimationFrame = ask;
        done.resolve(asked);
      }, 300);
      return await done.promise;
    });
  expect(await frames()).toBeGreaterThan(3);
  // The form, moved and hidden as a page would: by its element, as nothing names it while hidden.
  const place = async (margin: string, display: string) => {
    await page.evaluate(
      ([marginNow, displayNow]) => {
        const answer = document.querySelector("form");
        if (answer !== null) {
          answer.style.marginBlockStart = marginNow ?? "";
          answer.style.display = displayNow ?? "";
        }
      },
      [margin, display]
    );
  };
  await place("300vh", "");
  await expect.poll(frames).toBe(0);
  await place("", "none");
  await expect.poll(frames).toBe(0);
  await place("", "");
  await expect.poll(frames).toBeGreaterThan(3);
});

test("a note while the voice goes on is said once, and the card keeps its height", async ({
  page,
}) => {
  const said = await listenToLiveRegions(page);
  await openExample(page, "prompt-input", "voice", { time: fixedTime });
  const card = page.getByRole("group").first();
  expect(await heightOf(card)).toBe(102);
  // The person's turn, two words in: a part was not made out.
  await page.clock.runFor(9100);
  const note = page
    .getByRole("group", { name: "Voice conversation" })
    .getByText("A part couldn't be made out.");
  await expect(note).toBeVisible();
  expect(await heightOf(card)).toBe(102);
  await page.clock.runFor(2000);
  await expect(note).toHaveCount(0);
  const heard = await said();
  expect(
    heard.filter((words) => words === "A part couldn't be made out.")
  ).toHaveLength(1);
});

test("while a voice is heard a dithered light stands over the card, and goes with it", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "dictation");
  // The light is decoration, so it is read as it is drawn: how see-through its layer is.
  const light = async () =>
    await page.evaluate(() => {
      const layer = document.querySelector("form span[aria-hidden]");
      return layer === null ? "" : getComputedStyle(layer).opacity;
    });
  expect(await light()).toBe("0");
  await page.getByRole("button", { name: "Dictate" }).click();
  await expect.poll(async () => Number(await light())).toBeGreaterThan(0.1);
  await page.getByRole("button", { name: "Cancel dictation" }).click();
  await expect.poll(light).toBe("0");
});
