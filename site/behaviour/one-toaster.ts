// One toaster on screen at a time. Every example on the Toast page has its own toaster, and each
// shows its toasts in the browser's top layer in the window's corner, where no stage can hold them:
// the toasts of two stages lay over each other, the one behind half cut. When a toast region opens,
// any other open one closes, so the page shows the stage the reader just pressed.
document.addEventListener(
  "toggle",
  (event) => {
    const opened = event.target;
    if (
      !(opened instanceof HTMLElement) ||
      !opened.matches('[data-slot="toast-region"]')
    ) {
      return;
    }
    if (event.newState !== "open") {
      return;
    }
    for (const region of document.querySelectorAll<HTMLElement>(
      '[data-slot="toast-region"]:popover-open'
    )) {
      if (region !== opened) {
        region.hidePopover();
      }
    }
  },
  true
);
