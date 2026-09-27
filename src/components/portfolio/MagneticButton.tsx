import { useEffect, useRef, type AnchorHTMLAttributes, type ReactNode } from "react";

/**
 * Wraps a link/button so it drifts toward a mouse cursor within its own bounds and eases
 * back on leave. Mouse only (never touch or pen), only on devices that can hover, off
 * under reduced motion. The transform is written straight to the element — no React
 * state per pointer move — and eased by a CSS transition.
 */
export function MagneticButton({
  className = "",
  strength = 0.4,
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  strength?: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || strength === 0) return;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || reduced) return;

    // keep the button's own colour transitions alongside the drift
    el.style.transition =
      "transform 450ms cubic-bezier(0.22, 1, 0.36, 1), background-color 150ms, border-color 150ms, color 150ms";
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * strength;
      const y = (e.clientY - (r.top + r.height / 2)) * strength;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    };
    const onLeave = () => {
      el.style.transform = "";
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.style.transform = "";
      el.style.transition = "";
    };
  }, [strength]);

  return (
    <a ref={ref} className={className} {...rest}>
      {children}
    </a>
  );
}
