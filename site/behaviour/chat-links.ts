// "Open in chat" asks an assistant to read the page's Markdown at an absolute address. A build with
// no `site` set writes the build machine's origin into those links (site/chrome/PageTools.astro), so
// on every page load the address in each is put on the page's own origin: an assistant then reads the
// page from where the reader is. Without script the built address stays.
const fix = () => {
  for (const box of document.querySelectorAll<HTMLElement>(
    "[data-chat-origin]"
  )) {
    const built = box.dataset.chatOrigin ?? "";
    if (!built || built === location.origin) {
      continue;
    }
    for (const link of box.querySelectorAll<HTMLAnchorElement>("a[href]")) {
      link.href = link.href.replaceAll(
        encodeURIComponent(built),
        encodeURIComponent(location.origin)
      );
    }
    box.dataset.chatOrigin = location.origin;
  }
};
document.addEventListener("astro:page-load", fix);
fix();
