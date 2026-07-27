/**
 * Small GSAP context helper for React effects.
 *
 * Usage (future):
 *   useEffect(() => {
 *     const ctx = createGsapContext(scopeRef.current, (gsap) => {
 *       gsap.from(".fade", { opacity: 0, y: 20, stagger: 0.08 });
 *     });
 *     return () => ctx?.revert();
 *   }, []);
 *
 * Nothing currently uses this — it just standardises scope + cleanup and
 * silently no-ops when the user prefers reduced motion.
 */
import gsap from "gsap";

import { prefersReducedMotion } from "./prefers-reduced-motion";

export type GsapContext = ReturnType<typeof gsap.context>;

export function createGsapContext(
  scope: Element | null,
  setup: (g: typeof gsap) => void,
): GsapContext | null {
  if (typeof window === "undefined" || !scope) return null;
  if (prefersReducedMotion()) return null;
  return gsap.context(() => setup(gsap), scope);
}

export { gsap };
