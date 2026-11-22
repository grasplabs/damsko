import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

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

test("a model and an effort picked from the menus beside Send go with the message", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "model");
  await page.getByRole("button", { name: "Model: Claude Opus 5.5" }).click();
  await page.getByRole("menuitemradio", { name: "Gemini 3 Pro" }).click();
  await expect(
    page.getByRole("button", { name: "Model: Gemini 3 Pro" })
  ).toBeFocused();
  await page.getByRole("button", { name: "Effort: Medium" }).click();
  await page.getByRole("menuitemradio", { name: "High" }).click();
  await page.getByRole("textbox", { name: "Message" }).click();
  await page.keyboard.type("Rename the helper");
  await page.keyboard.press("Enter");
  await expect(
    page.getByText("Sent with Gemini 3 Pro, High effort: Rename the helper")
  ).toBeVisible();
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

test("a paste of words that come with a picture of them (spreadsheet cells) is the words", async ({
  page,
}) => {
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
  await expect(page.getByRole("list", { name: "Files to send" })).toHaveCount(
    0
  );
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

test("the text clears the moment it is sent, and words typed while it is out stay", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "attachments", { time: fixedTime });
  const text = page.getByRole("textbox", { name: "Message" });
  await text.click();
  await page.keyboard.type("first");
  await page.keyboard.press("Enter");
  // Cleared the moment it is sent, before the send settles.
  await expect(text).toHaveText("");
  await page.keyboard.type("more");
  await page.clock.runFor(1000);
  await expect(page.getByText("Sent: first")).toBeVisible();
  await expect(text).toHaveText("more");
});

test("the speech button says whether it listens", async ({ page }) => {
  await openExample(page, "prompt-input", "basic");
  const speech = page.getByRole("button", { name: "Dictate" });
  await expect(speech).toHaveAttribute("aria-pressed", "false");
  await speech.click();
  await expect(speech).toHaveAttribute("aria-pressed", "true");
  await speech.click();
  await expect(speech).toHaveAttribute("aria-pressed", "false");
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
  await page.keyboard.press("ControlOrMeta+End");
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

test("a send that fails puts the words back and says so", async ({ page }) => {
  await openExample(page, "prompt-input", "failed", { time: fixedTime });
  const text = page.getByRole("textbox", { name: "Message" });
  await text.click();
  await page.keyboard.press("Enter");
  await expect(text).toHaveText("");
  await page.clock.runFor(1000);
  await expect(
    page.getByText("Could not send. Your message is kept.")
  ).toBeVisible();
  await expect(text).toContainText(
    "Which invoices are still unpaid this quarter?"
  );
});

for (const width of [1440, 390]) {
  test(`at ${width}, a note in one row takes a line of its own and the words keep the width`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await openExample(page, "prompt-input", "failed", { time: fixedTime });
    const text = page.getByRole("textbox", { name: "Message" });
    await text.click();
    await page.keyboard.press("Enter");
    await page.clock.runFor(1000);
    const note = page.getByText("Could not send. Your message is kept.");
    await expect(note).toBeVisible();
    const card = page.getByRole("group").filter({ has: text });
    const [textBox, cardInner, noteBox] = await Promise.all([
      text.boundingBox(),
      card.evaluate((element) => element.clientWidth),
      note.boundingBox(),
    ]);
    expect(textBox).not.toBeNull();
    expect(noteBox).not.toBeNull();
    if (textBox !== null && noteBox !== null) {
      expect(textBox.width).toBeGreaterThanOrEqual(cardInner * 0.8);
      expect(noteBox.y).toBeGreaterThanOrEqual(textBox.y + textBox.height - 1);
    }
    // The note's line stands level with Submit, centre to centre.
    const submit = await page
      .getByRole("button", { name: "Send", exact: true })
      .boundingBox();
    expect(submit).not.toBeNull();
    if (noteBox !== null && submit !== null) {
      expect(
        Math.abs(
          noteBox.y + noteBox.height / 2 - (submit.y + submit.height / 2)
        )
      ).toBeLessThanOrEqual(1);
    }
  });
}

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
