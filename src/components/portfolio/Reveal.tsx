import type { CSSProperties, ReactNode } from "react";

/**
 * Fade-up entrance, done entirely in CSS (see `.reveal` in styles.css): scroll-driven
 * where the browser supports `animation-timeline: view()`, a short time-based fade
 * otherwise. There is no hidden starting state outside the animation itself, so if the
 * animation cannot run — no JS, unsupported CSS, Reading mode, reduced motion, print —
 * the content is simply visible. `delay` staggers the time-based variant (hero).
 */
export function Reveal({
  children,
  as: As = "div",
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  as?: "div" | "li" | "article" | "section";
  delay?: number;
  className?: string;
}) {
  const style = delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined;
  return (
    <As className={`reveal ${className}`} style={style}>
      {children}
    </As>
  );
}
