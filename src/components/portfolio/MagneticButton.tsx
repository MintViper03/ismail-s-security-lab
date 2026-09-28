import { useEffect, useRef, type AnchorHTMLAttributes, type ReactNode } from "react";
import { readReducedMotion } from "@/lib/view-mode";

/**
 * A link-button with two pointer responses, neither of which moves its clickable area:
 *
 * - Magnetic drift (`strength` > 0): the *label inside* eases a few pixels toward a mouse
 *   cursor (capped at `maxShift`, default 4px). The anchor box never moves, so what you aim
 *   at is what you hit. Mouse on hover-capable devices only; off with motion off.
 * - Directional light: `--mx`/`--my` follow the pointer (mouse, pen or the point of a tap)
 *   for the `.btn-light` highlight; keyboard focus shows it centred instead.
 *
 * Styles are written straight to the elements — no React state per pointer move.
 */
export function MagneticButton({
  className = "",
  contentClassName = "inline-flex items-center justify-center gap-2",
  strength = 0,
  maxShift = 4,
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  contentClassName?: string;
  strength?: number;
  maxShift?: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const inner = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const content = inner.current;
    if (!el || !content) return;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const magnetic = strength > 0 && canHover && !readReducedMotion();
    const clamp = (v: number) => Math.max(-maxShift, Math.min(maxShift, v));

    const light = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${Math.round(e.clientX - r.left)}px`);
      el.style.setProperty("--my", `${Math.round(e.clientY - r.top)}px`);
    };
    const onMove = (e: PointerEvent) => {
      light(e);
      if (!magnetic || e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      const x = clamp((e.clientX - (r.left + r.width / 2)) * strength);
      const y = clamp((e.clientY - (r.top + r.height / 2)) * strength);
      content.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    };
    const onLeave = () => {
      content.style.transform = "";
      el.style.removeProperty("--mx");
      el.style.removeProperty("--my");
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerdown", light);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", light);
      el.removeEventListener("pointerleave", onLeave);
      onLeave();
    };
  }, [strength, maxShift]);

  return (
    <a ref={ref} className={className} {...rest}>
      <span ref={inner} className={`magnet-content ${contentClassName}`}>
        {children}
      </span>
    </a>
  );
}
