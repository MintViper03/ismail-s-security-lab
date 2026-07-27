/**
 * Lenis smooth-scroll bootstrap helper.
 *
 * Not mounted anywhere yet. Call `initSmoothScroll()` from a top-level
 * client effect when we're ready to enable premium scroll. Respects
 * `prefers-reduced-motion` and is a no-op on the server.
 */
import Lenis from "lenis";

import { prefersReducedMotion } from "./prefers-reduced-motion";

export type SmoothScrollHandle = {
  lenis: Lenis;
  destroy: () => void;
};

export function initSmoothScroll(
  options?: ConstructorParameters<typeof Lenis>[0],
): SmoothScrollHandle | null {
  if (typeof window === "undefined") return null;
  if (prefersReducedMotion()) return null;

  const lenis = new Lenis({
    duration: 1.15,
    easing: (t: number) => 1 - Math.pow(1 - t, 3),
    smoothWheel: true,
    ...options,
  });

  let rafId = 0;
  const raf = (time: number) => {
    lenis.raf(time);
    rafId = requestAnimationFrame(raf);
  };
  rafId = requestAnimationFrame(raf);

  return {
    lenis,
    destroy: () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    },
  };
}
