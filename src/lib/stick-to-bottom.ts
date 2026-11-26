// Stick to bottom: a scroller that follows its end as what it holds grows, as a chat follows an
// answer being written, until the person scrolls up. MessageScroller and Terminal follow with it.
//
//   const stick = createStickToBottom({ threshold: 8 });
//   const disconnect = stick.connect(scroller);
//   stick.scrollToBottom({ behavior: "smooth" });   back to the end, following again
//   stick.release();                                stop following, as for a jump to a message
//
// What the references do, and what is kept here:
// - Only the person lets go. A wheel or a finger moving up, a key up, or a press on the scroller's
//   own bar releases it; a scroll event never does, because the browser scrolls on its own too: it
//   clamps the scroll when what it holds is shorter for a moment (a row drawn again, content-
//   visibility measuring a row), and Safari's own corrections land there. Reading such a scroll
//   as the person's let go of the end in Safari (T3 Code's timeline does the same:
//   timelineViewport.ts releases on input, never on an upward scroll). While the log is changing
//   size such a scroll is undone; once it has settled (SETTLE), a scroll from elsewhere (find in
//   page, a link to a row) is left where it went, as T3 Code's list follows only on a change.
// - It glides toward the moving end, one write a frame from requestAnimationFrame, as
//   use-stick-to-bottom animates toward it, instead of jumping a line each time the words wrap.
//   Its step is the gap's share for the frame plus the speed the end has been moving at, so a
//   steady stream is followed at its own speed with nothing left behind, and a burst (a code
//   block, a table) is caught up over a few frames; never past the end. use-stick-to-bottom's
//   spring trails a fast stream by about eleven frames of growth, a line or more.
// - With reduced motion it stands at the end at once, as T3 Code follows without animation then.
// - Away from the end, what the reader looks at stays put while rows above it change size: the
//   first row in view is held where it was, before the frame is drawn.
//
// Every scroll, resize and command only asks for the next frame; that frame reads the scroller
// once and writes it at most once.

/** Where a log stands. */
export interface StickToBottomState {
  /** New content scrolls into view. */
  following: boolean;
  /** The end is in view now, within the threshold. */
  atBottom: boolean;
}

/** How it follows. */
export interface StickToBottomOptions {
  /**
   * How close to the end, in pixels, still counts as at the end.
   * @default 24
   */
  threshold?: number;
  /**
   * Whether it follows from the start.
   * @default true
   */
  initial?: boolean;
}

/** What createStickToBottom returns. */
export interface StickToBottom {
  /** Where the log stands now: the same object until something changes. */
  get: () => StickToBottomState;
  /** Calls `listener` whenever `get()` changes, until the returned function runs. */
  subscribe: (listener: () => void) => () => void;
  /** Follows `scroller`'s end, watching it and what it holds, until the returned function runs. */
  connect: (scroller: HTMLElement) => () => void;
  /** Goes to the end and follows again: gliding with `smooth`, unless the reader asked for less motion. */
  scrollToBottom: (options?: { behavior?: ScrollBehavior }) => void;
  /** Stops following, as if the reader scrolled up. */
  release: () => void;
}

/** A frame at 60 frames a second, in milliseconds: the unit the easing is set in. */
const FRAME = 1000 / 60;
/** The share of what is left that a frame at 60 a second closes: a line glides in over a few frames. */
const SHARE = 0.2;
/** How much of its last speed the end's speed keeps each frame at 60 a second. */
const KEEP = 0.85;
/** The longest frame the easing counts, in milliseconds: after a stall it does not leap. */
const LONGEST = 100;
/**
 * How long after its last change of size the log counts as still changing, in milliseconds. While
 * it is, a scroll not the person's is the browser's own correction and is undone; once it has
 * settled, someone moved it on purpose (find in page, a link to a row) and it stays there.
 */
const SETTLE = 1000;

/** What the follower carries from one frame to the next. */
export interface Glide {
  /** Where the end stood when last seen, in pixels from the top, or null when unknown. */
  end: number | null;
  /** When it was last seen, in milliseconds (the frame's time). */
  at: number;
  /** How fast the end has been moving, in pixels a millisecond. */
  speed: number;
}

/** Nothing seen yet. */
export const still: Glide = { end: null, at: 0, speed: 0 };

/**
 * One frame of following, at `now`, `ms` after the frame before: from where the scroller stands
 * (`top`) toward the end (`end`), the next place and what to carry on. The end's speed is how far
 * it moved since it was last seen over how long that was, so a stream that grows a line now and
 * then is followed at its own pace. Never past the end, at least a pixel while a pixel or more is
 * left (a browser that rounds the scroll would otherwise stall), and the end itself once less than
 * a pixel is.
 */
export const glide = (
  top: number,
  end: number,
  now: number,
  ms: number,
  was: Glide
): { top: number; glide: Glide } => {
  const dt = Math.min(Math.max(ms, 1), LONGEST);
  let speed = 0;
  if (was.end !== null) {
    const since = Math.max(now - was.at, 1);
    const keep = KEEP ** (since / FRAME);
    speed =
      was.speed * keep + (Math.max(0, end - was.end) / since) * (1 - keep);
  }
  const next = { end, at: now, speed };
  const gap = end - top;
  if (gap < 1) {
    return { top: end, glide: next };
  }
  const step = gap * (1 - (1 - SHARE) ** (dt / FRAME)) + speed * dt;
  return { top: top + Math.min(gap, Math.max(1, step)), glide: next };
};

const UP_KEYS = new Set(["ArrowUp", "PageUp", "Home"]);

/** Where the scroll stands at the end. */
const endOf = (element: HTMLElement) =>
  Math.max(0, element.scrollHeight - element.clientHeight);

/** Where `row` starts, in the scroller's own scroll. */
const offsetOf = (element: HTMLElement, row: Element) =>
  row.getBoundingClientRect().top -
  element.getBoundingClientRect().top +
  element.scrollTop;

/** The row the reader is on, and where it starts. */
interface Pinned {
  row: Element;
  top: number;
}

/**
 * The first row in view, and where it starts. Found by halving: a few rows read whatever the
 * length; rows not drawn (hidden) are stepped over.
 */
const firstInView = (element: HTMLElement): Pinned | undefined => {
  let rows = element.children;
  while (rows.length === 1 && (rows[0]?.children.length ?? 0) > 0) {
    rows = rows[0]?.children ?? rows;
  }
  const box = element.getBoundingClientRect();
  let low = 0;
  let high = rows.length - 1;
  let found: { row: Element; rect: DOMRect } | undefined;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    let probe = middle;
    while (probe <= high && rows[probe]?.getClientRects().length === 0) {
      probe += 1;
    }
    const row = rows[probe];
    if (probe > high || row === undefined) {
      high = middle - 1;
      continue;
    }
    const rect = row.getBoundingClientRect();
    if (rect.bottom <= box.top) {
      low = probe + 1;
    } else {
      found = { row, rect };
      high = middle - 1;
    }
  }
  return found !== undefined && found.rect.top < box.bottom
    ? { row: found.row, top: found.rect.top - box.top + element.scrollTop }
    : undefined;
};

/** Follows a scroller's end as what it holds grows, until the person scrolls up. */
export const createStickToBottom = ({
  threshold = 24,
  initial = true,
}: StickToBottomOptions = {}): StickToBottom => {
  let state: StickToBottomState = { following: initial, atBottom: true };
  const listeners = new Set<() => void>();
  let scroller: HTMLElement | undefined;
  let frame = 0;
  // When the last frame ran; 0 when none runs, so the first of a run counts as one frame.
  let last = 0;
  let motion: Glide = still;
  // While reading back: the first row in view and where it stood, kept there as rows above change.
  let pinned: Pinned | undefined;
  // Released, whether the reader has left the end since: only coming back to it follows again, so
  // a key up pressed at the end does not follow again on its first step.
  let left = false;
  // When the log or what it holds last changed size.
  let changed = Number.NEGATIVE_INFINITY;
  let reduced: MediaQueryList | undefined;

  const set = (next: Partial<StickToBottomState>) => {
    const merged = { ...state, ...next };
    if (
      merged.following === state.following &&
      merged.atBottom === state.atBottom
    ) {
      return;
    }
    state = merged;
    for (const listener of listeners) {
      listener();
    }
  };

  const pin = (element: HTMLElement) => {
    pinned = firstInView(element);
  };

  /** Away from the end: the pinned row back where it stood, before this frame is drawn. */
  const hold = (element: HTMLElement) => {
    const row = pinned?.row;
    if (pinned === undefined || row === undefined || !element.contains(row)) {
      pin(element);
      return;
    }
    const top = offsetOf(element, row);
    const moved = top - pinned.top;
    if (Math.abs(moved) >= 1) {
      element.scrollTop += moved;
    }
    pinned = { row, top };
  };

  /** One frame: read the scroller once, write it at most once. */
  const tick = (now: number) => {
    frame = 0;
    const element = scroller;
    if (element === undefined) {
      return;
    }
    const top = element.scrollTop;
    const end = endOf(element);
    let next = top;
    if (state.following) {
      if (reduced?.matches === true) {
        next = end;
        motion = { end, at: now, speed: 0 };
      } else {
        const step = glide(
          top,
          end,
          now,
          last === 0 ? FRAME : now - last,
          motion
        );
        next = step.top;
        motion = step.glide;
      }
      if (Math.abs(next - top) >= 0.5) {
        element.scrollTop = next;
      }
      if (end - next >= 0.5) {
        frame = requestAnimationFrame(tick);
      }
    } else {
      motion = still;
      // The reader scrolled back to the end: it follows again.
      if (left && end - top <= threshold) {
        set({ following: true });
      } else {
        left ||= end - top > threshold;
        // A row above that changed size since it was noted is undone first (its resize may not
        // have been reported yet), then the row now first in view is noted.
        hold(element);
        pin(element);
      }
    }
    last = frame === 0 ? 0 : now;
    set({ atBottom: end - next <= threshold });
  };

  const soon = () => {
    if (frame === 0 && scroller !== undefined) {
      frame = requestAnimationFrame(tick);
    }
  };

  /** Lets go of the end, on the person's own way up. */
  const letGo = (element: HTMLElement) => {
    if (element.scrollHeight > element.clientHeight && state.following) {
      cancelAnimationFrame(frame);
      frame = 0;
      left = false;
      set({ following: false });
      pin(element);
    }
  };

  /** Stands at the end now. */
  const atEnd = (element: HTMLElement) => {
    const end = endOf(element);
    element.scrollTop = end;
    motion = { end, at: performance.now(), speed: 0 };
    set({ atBottom: true });
  };

  return {
    get: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    connect: (element) => {
      scroller = element;
      // The browser's own anchoring would move it as well: the two together moved it twice as far.
      element.style.setProperty("overflow-anchor", "none");
      const view = element.ownerDocument.defaultView ?? window;
      reduced = view.matchMedia("(prefers-reduced-motion: reduce)");
      // Grown or shrunk: following, the next frame glides to the new end (at once with reduced
      // motion, before this frame is drawn); away from the end, the row in view stays put.
      const sizes = new view.ResizeObserver(() => {
        changed = performance.now();
        if (!state.following) {
          hold(element);
        } else if (reduced?.matches === true) {
          atEnd(element);
        } else {
          soon();
        }
      });
      const watch = () => {
        sizes.disconnect();
        sizes.observe(element);
        for (const child of element.children) {
          sizes.observe(child);
        }
      };
      watch();
      const children = new view.MutationObserver(watch);
      children.observe(element, { childList: true });
      // A scroll: away from the end, the reader's place is noted; following, the next frame goes
      // back to the end, unless the log has settled and someone else moved it on purpose.
      const scrolled = () => {
        if (
          state.following &&
          frame === 0 &&
          performance.now() - changed > SETTLE
        ) {
          set({ atBottom: endOf(element) - element.scrollTop <= threshold });
          return;
        }
        soon();
      };
      let touchY: number | undefined;
      const wheel = (event: WheelEvent) => {
        if (event.deltaY < 0) {
          letGo(element);
        }
      };
      const touchStart = (event: TouchEvent) => {
        touchY = event.touches[0]?.clientY;
      };
      const touchMove = (event: TouchEvent) => {
        const y = event.touches[0]?.clientY;
        // A finger moving down the screen scrolls back up.
        if (y !== undefined && touchY !== undefined && y > touchY) {
          letGo(element);
        }
        touchY = y;
      };
      const key = (event: KeyboardEvent) => {
        if (UP_KEYS.has(event.key) || (event.key === " " && event.shiftKey)) {
          letGo(element);
        }
      };
      // A press on the scroller itself, not on a row: its own bar, which drags with no wheel.
      const press = (event: PointerEvent) => {
        if (event.target === element) {
          letGo(element);
        }
      };
      element.addEventListener("scroll", scrolled, { passive: true });
      element.addEventListener("wheel", wheel, { passive: true });
      element.addEventListener("touchstart", touchStart, { passive: true });
      element.addEventListener("touchmove", touchMove, { passive: true });
      element.addEventListener("keydown", key);
      element.addEventListener("pointerdown", press, { passive: true });
      if (state.following) {
        atEnd(element);
      } else {
        pin(element);
      }
      return () => {
        sizes.disconnect();
        children.disconnect();
        element.removeEventListener("scroll", scrolled);
        element.removeEventListener("wheel", wheel);
        element.removeEventListener("touchstart", touchStart);
        element.removeEventListener("touchmove", touchMove);
        element.removeEventListener("keydown", key);
        element.removeEventListener("pointerdown", press);
        if (scroller === element) {
          cancelAnimationFrame(frame);
          frame = 0;
          scroller = undefined;
          pinned = undefined;
        }
      };
    },
    scrollToBottom: ({ behavior = "auto" } = {}) => {
      set({ following: true });
      const element = scroller;
      if (element === undefined) {
        return;
      }
      if (behavior === "smooth" && reduced?.matches !== true) {
        soon();
      } else {
        cancelAnimationFrame(frame);
        frame = 0;
        atEnd(element);
      }
    },
    release: () => {
      cancelAnimationFrame(frame);
      frame = 0;
      left = false;
      set({ following: false });
      if (scroller !== undefined) {
        pin(scroller);
      }
    },
  };
};
