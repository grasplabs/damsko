import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { fixedTime, openExample } from "./example.ts";

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
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("menuitem", { name: "Add files" }).click();
  const picker = await chooser;
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

  // Done keeps what was heard, and the footer is back.
  await bar.getByRole("button", { name: "Done" }).click();
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

test("a file the product uploads says how far it is, and a refused one says why", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "uploads", { time: fixedTime });
  const files = page.getByRole("list", { name: "Files to send" });
  await page.getByRole("button", { name: "Add to message" }).click();
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("menuitem", { name: "Add files" }).click();
  const picker = await chooser;
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
  await page.clock.runFor(3000);
  await expect(files.getByText(/Uploading/u)).toHaveCount(0);
  await expect(files.getByText("brief.pdf")).toBeVisible();
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
