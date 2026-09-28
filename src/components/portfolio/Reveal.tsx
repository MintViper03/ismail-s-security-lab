import type { CSSProperties, ReactNode } from "react";

/**
 * Hero-only load-time entrance: a short CSS rise (see `.reveal` in styles.css), movement
 * only — never transparent, so the name and role line are readable at first paint.
 * Sections below have their own scroll-linked motifs (SectionShell `motif`). No animation
 * (Reading mode, motion off, print, unsupported CSS) simply leaves the content in place.
 * `delay` staggers the rise.
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
