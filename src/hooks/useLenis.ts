import { useEffect } from "react";

/**
 * Lenis smooth scrolling for mouse-wheel users in Interactive mode. The library is
 * loaded on demand, only where it applies: never on touch-first devices (native touch
 * scrolling stays untouched, including on iOS Safari), never under reduced motion, and
 * never in Reading mode. It drives its own rAF; nothing else ticks every frame.
 */
export function useLenis(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    let lenis: { destroy: () => void } | null = null;
    let cancelled = false;
    import("lenis")
      .then(({ default: Lenis }) => {
        if (cancelled) return;
        lenis = new Lenis({
          duration: 1.1,
          easing: (t: number) => 1 - Math.pow(1 - t, 3),
          smoothWheel: true,
          autoRaf: true,
          // in-page links scroll smoothly and clear the fixed header
          anchors: { offset: -80 },
        });
      })
      .catch(() => {
        // smooth scrolling is optional; native scrolling keeps working
      });

    return () => {
      cancelled = true;
      lenis?.destroy();
    };
  }, [enabled]);
}
