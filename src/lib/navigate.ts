import { readReducedMotion, readViewMode } from "./view-mode";

/**
 * Moves to a page section the same way an in-page link would, then puts keyboard focus
 * on its heading so the next Tab continues from there. Instant in Reading mode or with
 * motion off; native smooth scrolling otherwise. Updates the hash without a second jump.
 */
export function goToSection(id: string) {
  const section = document.getElementById(id);
  if (!section) return;
  const smooth = readViewMode() === "interactive" && !readReducedMotion();
  section.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
  history.replaceState(null, "", `#${id}`);

  const heading = document.getElementById(`${id}-title`) ?? section;
  if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
  heading.focus({ preventScroll: true });
}

/** Follows a link (mailto:, tel:, PDF) through a real anchor so the browser handles it. */
export function openHref(href: string, opts: { newTab?: boolean; download?: string } = {}) {
  const a = document.createElement("a");
  a.href = href;
  if (opts.newTab) {
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  }
  if (opts.download) a.download = opts.download;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
