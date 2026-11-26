# Third-party notices

Damsko is Grasp's own code (see [LICENSE](LICENSE)). The third-party work below is in this repository, or closely followed by a file in it, and stays under its own licence. A source file that follows one says so in a header line, which travels with the file when the registry installs it. npm packages Damsko depends on (Hugeicons, UI SDK, StyleX, React and the rest) are not in this repository and keep their own licences.

## Geist, Geist Mono and Geist Serif

The fonts in `src/styles/fonts/` (subsets of Geist, Geist Mono and Geist Serif, from https://github.com/vercel/geist-font), which the registry's `fonts` item installs, the docs site serves and the brand book's one-file download embeds, are under the SIL Open Font License 1.1, not Damsko's licence. The licence travels with them: `src/styles/fonts/OFL.txt`, installed beside the files, and in full at the end of the brand book's download.

```text
Geist, Geist Mono:
Copyright 2024 The Geist Project Authors (https://github.com/vercel/geist-font.git)

Geist Serif:
Copyright 2026 The Geist Project Authors (https://github.com/vercel/geist-font)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://openfontlicense.org


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.
```

## Simple Icons

Most of the brand marks the docs' examples show (`examples/brand-icon/logos.ts`, each with its source on the line above it) are drawn from Simple Icons (https://simpleicons.org), whose icon data is released under CC0 1.0 Universal (https://creativecommons.org/publicdomain/zero/1.0/): no notice is required, and this one is a courtesy. The marks themselves are trademarks of their owners, shown to name their products; Damsko ships none of them.

## CommonMark Spec and GitHub Flavored Markdown Spec

The Markdown tests' fixtures `scripts/fixtures/commonmark-spec.json` and `scripts/fixtures/gfm-spec.json` hold examples copied from these, each example's Markdown and the HTML its spec gives, with its number and section. They are tests, not shipped, and stay under their licence, Creative Commons Attribution-ShareAlike 4.0 International (https://creativecommons.org/licenses/by-sa/4.0/):

- the CommonMark Spec 0.31.2, by John MacFarlane (https://spec.commonmark.org/0.31.2/, from its `spec.json`);
- the GitHub Flavored Markdown Spec 0.29, by GitHub, Inc., based on the CommonMark Spec (https://github.github.com/gfm/), its extension examples, from cmark-gfm's `test/spec.txt` at 7fe8904ee31fa24b772ae565c4908b1394850de6 (https://github.com/github/cmark-gfm);
- cmark-gfm's extensions test, by Yuki Izumi, from its `test/extensions.txt` at the same commit.

## The idle screen's scenes

The docs site's idle screen (`site/behaviour/idle-screen.ts`) draws six pictures, kept as grey light maps in `public/scenes/`. They are the site's own and not part of the registry. Five are in the public domain. The Webb picture is credited as its publishers ask.

- `cliffs.jpg`: the Cosmic Cliffs of the Carina Nebula, James Webb Space Telescope, 2022. Credit: NASA, ESA, CSA, STScI. NASA's release is in the public domain; ESA's copy is under Creative Commons Attribution 4.0 International (https://creativecommons.org/licenses/by/4.0/). Changed: made grey and resized.
- `wave.jpg`: The Great Wave off Kanagawa, Katsushika Hokusai, about 1831. Public domain.
- `aurora.jpg`: a northern light from orbit, over the Manicouagan crater. NASA. Public domain.
- `starry.jpg`: The Starry Night, Vincent van Gogh, 1889. Public domain.
- `fuji.jpg`: Fine Wind, Clear Morning, Katsushika Hokusai, about 1831. Public domain.
- `wanderer.jpg`: Wanderer above the Sea of Fog, Caspar David Friedrich, about 1818. Public domain.
