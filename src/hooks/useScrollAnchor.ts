import { useEffect } from "react";

const CANDIDATES = "main section, main article, main h2, main h3";

/**
 * Keeps the reader's place when the page width changes (phone rotation, window resize).
 * The browser's own scroll anchoring is suppressed whenever an anchor's ancestor changes
 * transform, which the scroll-linked motion does constantly, so after a rotation the page
 * could land thousands of pixels away. This remembers which heading/article sits at the
 * reading line and restores its offset once the new layout is in. Height-only changes
 * (mobile browser toolbars showing or hiding) are left alone, so it never fights a scroll.
 */
export function useScrollAnchor() {
  useEffect(() => {
    let anchor: { el: Element; top: number } | null = null;
    let width = window.innerWidth;
    let raf = 0;
    let restoring = false;

    const record = () => {
      raf = 0;
      if (restoring) return;
      const line = window.innerHeight * 0.3;
      let best: { el: Element; top: number } | null = null;
      for (const el of document.querySelectorAll(CANDIDATES)) {
        const top = el.getBoundingClientRect().top;
        // the last candidate starting above the reading line (document order ≈ top order)
        if (top <= line && (!best || top >= best.top)) best = { el, top };
      }
      anchor = best;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(record);
    };
    const onResize = () => {
      const w = window.innerWidth;
      if (w === width) return; // toolbar/height-only change
      width = w;
      const a = anchor;
      if (!a || !document.contains(a.el)) return;
      restoring = true;
      // wait for the new layout (two frames), then put the anchor back where it was
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const delta = a.el.getBoundingClientRect().top - a.top;
          if (Math.abs(delta) > 2) window.scrollBy({ top: delta, behavior: "instant" });
          restoring = false;
          record();
        }),
      );
    };

    record();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);
}
