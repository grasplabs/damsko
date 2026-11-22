// The entrance's door, after the glass door of the website's sign-in, drawn with the entrance's own
// glass instead of a second shader. Enter pressed:
//
//   0      the words, the download and the two controls fade (300ms, ease); the side glass closes
//          over the screen as two doors meeting on the centre line, where Enter stands (360ms, the
//          system's ease)
//   360    the website's way out, 1050ms, on its own clock: the light gathers at Enter and brightens
//          (to 0.3 of it), the seam runs up and down the glass from Enter (0.1 to 0.34), the doors
//          slide apart from the seam (0.3 to 1, smootherstep: slowly, then fast, then home), the
//          light beyond settles to night, the ground room 01 opens on (the website floods to the
//          paper its next page opens on; from 0.35 of the slide), and Enter goes into the light a
//          beat later (fades 350ms and grows to 1.06 over 500ms, from 0.3)
//   1410   the doors are open: room 01 (fetched while Enter was pointed at) is opened
//
// A second press of Enter, or Escape, opens room 01 at once. Nothing takes focus; the door never
// takes a pointer. Under reduced motion the entrance never calls this: Enter is a plain link.

/** The system's strong ease-out (--damsko-ease): the doors closing. */
const ease = "cubic-bezier(0.22, 1, 0.36, 1)";
/** Smootherstep (the website's slide, s³(s(6s − 15) + 10)) as a CSS easing. */
const smootherstep = `linear(${Array.from({ length: 21 }, (_, i) => {
  const t = i / 20;
  return (t * t * t * (t * (6 * t - 15) + 10)).toFixed(4);
}).join(", ")})`;
/** Smoothstep, for the seam. */
const smoothstep = `linear(${Array.from({ length: 11 }, (_, i) => {
  const t = i / 10;
  return (t * t * (3 - 2 * t)).toFixed(4);
}).join(", ")})`;

const closeMs = 360;
/** The website's way out (OPEN_MS). */
const openMs = 1050;

interface Door {
  /** The page: the parts that fade are its words, its download and its controls. */
  page: HTMLElement;
  /** The door's layer (entrance.tsx), with its parts marked data-door. */
  door: HTMLElement;
  /** Enter. */
  way: HTMLElement;
  /** Goes in: called once, when the doors are open or the door is skipped. */
  go: () => void;
}

/** Plays the door; returns a function that skips it and goes in at once. */
export const playDoor = ({ page, door, way, go }: Door): (() => void) => {
  let gone = false;
  const timers: number[] = [];
  const goIn = () => {
    if (gone) {
      return;
    }
    gone = true;
    for (const timer of timers) {
      window.clearTimeout(timer);
    }
    removeEventListener("keydown", onKey, true);
    go();
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      goIn();
    }
  };
  addEventListener("keydown", onKey, true);

  const part = (name: string) => [
    ...door.querySelectorAll<HTMLElement>(`[data-door="${name}"]`),
  ];
  const box = door.getBoundingClientRect();
  const at = way.getBoundingClientRect();
  door.style.setProperty("--door-y", `${at.top + at.height / 2 - box.top}px`);
  door.style.visibility = "visible";

  const fill = "forwards" as const;
  // The words, the download and the controls fade at once; Enter stays.
  const fading = [
    ...page.querySelectorAll<HTMLElement>("h1, p, [data-brand-download]"),
    ...[...page.children].filter((child) => !child.contains(door)),
  ];
  for (const element of fading) {
    element.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 300,
      easing: "ease",
      fill,
    });
  }

  // The doors close over the screen, meeting on the centre line.
  const [start] = part("start");
  const [end] = part("end");
  start?.animate(
    [{ transform: "translateX(-101%)" }, { transform: "translateX(0)" }],
    { duration: closeMs, easing: ease, fill }
  );
  end?.animate(
    [{ transform: "translateX(101%)" }, { transform: "translateX(0)" }],
    { duration: closeMs, easing: ease, fill }
  );

  // The way out, on the website's clock from here.
  const o = closeMs;
  const of = (share: number) => o + share * openMs;
  // Beyond the doors: there once they meet, never seen through a gap while they close.
  for (const beyond of [...part("beyond"), ...part("warm")]) {
    beyond.animate([{ opacity: 1 }, { opacity: 1 }], {
      delay: o,
      duration: 1,
      fill,
    });
  }
  for (const gather of part("gather")) {
    gather.animate(
      [
        { opacity: 0, transform: "scale(0.6)" },
        { opacity: 1, transform: "scale(1)" },
      ],
      { delay: o, duration: 0.3 * openMs, easing: ease, fill }
    );
  }
  for (const seam of part("seam")) {
    seam.animate(
      [
        { opacity: 1, transform: "scaleY(0)" },
        { opacity: 1, transform: "scaleY(1.15)" },
      ],
      { delay: of(0.1), duration: 0.24 * openMs, easing: smoothstep, fill }
    );
    seam.animate([{ opacity: 1 }, { opacity: 0 }], {
      delay: of(0.3),
      duration: 0.35 * openMs,
      easing: "ease",
      fill,
      composite: "replace",
    });
  }
  // The doors slide apart from the seam, carrying their glass.
  const slide = {
    delay: of(0.3),
    duration: 0.7 * openMs,
    easing: smootherstep,
    fill,
  };
  start?.animate(
    [{ transform: "translateX(0)" }, { transform: "translateX(-104%)" }],
    slide
  );
  end?.animate(
    [{ transform: "translateX(0)" }, { transform: "translateX(104%)" }],
    slide
  );
  for (const edge of part("edge")) {
    edge.animate(
      [{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 0.6 }],
      slide
    );
  }
  // Beyond: the light at the opening, settling to night.
  for (const warm of part("warm")) {
    warm.animate(
      [{ opacity: 1 }, { opacity: 1, offset: 0.35 }, { opacity: 0 }],
      { ...slide, composite: "replace" }
    );
  }
  for (const gather of part("gather")) {
    gather.animate([{ opacity: 1 }, { opacity: 0 }], {
      delay: of(0.45),
      duration: 0.55 * openMs,
      easing: "ease",
      fill,
    });
  }
  // Enter goes into the light a beat later.
  way.animate([{ opacity: 1 }, { opacity: 0 }], {
    delay: of(0.3),
    duration: 350,
    easing: "ease",
    fill,
  });
  way.animate([{ scale: "1" }, { scale: "1.06" }], {
    delay: of(0.3),
    duration: 500,
    easing: ease,
    fill,
  });

  timers.push(window.setTimeout(goIn, o + openMs));
  return goIn;
};
