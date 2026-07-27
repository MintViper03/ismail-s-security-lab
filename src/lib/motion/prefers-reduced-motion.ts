/**
 * Motion / device capability helpers.
 *
 * These are SSR-safe: they always return sensible defaults on the server
 * and only touch `window` / `navigator` in the browser. Nothing here is
 * wired into the UI yet — they exist so future Three.js / GSAP work can
 * gate expensive effects consistently.
 */

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isCoarsePointer(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

export function isSmallViewport(breakpoint = 720): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < breakpoint;
}

/**
 * Rough GPU/CPU capability heuristic. Conservative on mobile / low-core
 * devices so future 3D scenes can degrade gracefully.
 */
export type PerformanceTier = "low" | "mid" | "high";

export function detectPerformanceTier(): PerformanceTier {
  if (typeof window === "undefined") return "mid";
  if (prefersReducedMotion()) return "low";

  const cores =
    (typeof navigator !== "undefined" && navigator.hardwareConcurrency) || 4;
  const mem =
    (typeof navigator !== "undefined" &&
      (navigator as Navigator & { deviceMemory?: number }).deviceMemory) ||
    4;

  if (isCoarsePointer() && (cores <= 4 || mem <= 2)) return "low";
  if (cores <= 4 || mem <= 4) return "mid";
  return "high";
}

/** Suggested devicePixelRatio clamp for WebGL canvases. */
export function recommendedDpr(): [number, number] {
  const tier = detectPerformanceTier();
  if (tier === "low") return [1, 1];
  if (tier === "mid") return [1, 1.5];
  return [1, 2];
}
