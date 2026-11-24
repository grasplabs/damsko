// Answers that hold an address in every form a link can take, each with a backslash, an entity, a
// control character or a space at every place of its address and of its title. A form the stream
// has not finished may read as another (a backslash before the `>` that would close it, a space that
// ends an address): the tests stream each a character at a time and hold that no part is handed an
// address the finished answer does not have (scripts/markdown.test.tsx drawn on the server, as the
// words arrive; scripts/markdown-paced.test.tsx in the browser, at the pace and with the fade).

const forms: ((address: string, title: string) => string)[] = [
  (address) => `See [t](${address}) now.`,
  (address, title) => `See [t](${address} "${title}") now.`,
  (address) => `See [t](<${address}>) now.`,
  (address, title) => `See [t](<${address}> '${title}') now.`,
  (address, title) => `See ![p](${address} (${title})) now.`,
  (address) => `See ![p](<${address}>) now.`,
  (address) => `See <${address}> now.`,
  (address) => `See ${address} now.`,
  (address, title) => `[r]: ${address} "${title}"\n\nSee [t][r] now.`,
  (address, title) => `[r]: <${address}> '${title}'\n\nSee ![p][r] now.`,
];

/** Every answer, once. */
export const addressAnswers = (): Set<string> => {
  const address = "https://e.io/ab";
  const title = "Ti";
  // And a backslash before the `>` that would close an address with a space in it.
  const answers = new Set([
    String.raw`See [t](<https://exa mple.com/a\>b>) now.`,
  ]);
  for (const char of ["\\", "&amp;", "\u0001", " "]) {
    for (const form of forms) {
      for (let at = 0; at <= address.length; at += 1) {
        answers.add(
          form(address.slice(0, at) + char + address.slice(at), title)
        );
      }
      for (let at = 0; at <= title.length; at += 1) {
        answers.add(form(address, title.slice(0, at) + char + title.slice(at)));
      }
    }
  }
  return answers;
};

/** Whether every character of `shown` stands in `later`, in order: nothing shown was taken away. */
export const isWithin = (shown: string, later: string) => {
  let at = 0;
  for (const char of later) {
    at += Number(char === shown[at]);
  }
  return at >= shown.length;
};
