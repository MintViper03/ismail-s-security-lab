import { useEffect, useRef } from "react";
import { readReducedMotion } from "@/lib/view-mode";

const SCRAMBLE_CHARS = "!<>-_\\/[]{}=+*^?#01";
const DURATION = 900;

/**
 * Section-header "decode" reveal: characters resolve left-to-right from random glyphs
 * into the real text the first time the heading scrolls into view. Plain rAF — no
 * animation library. The heading's box is pinned while it runs (scrambled glyphs can
 * re-wrap it, which would shift the page) and its accessible name never changes.
 */
export function ScrambleHeading({
  text,
  as: As = "h2",
  className = "",
  animate = true,
  id,
}: {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  /** false renders the plain heading (Reading mode). */
  animate?: boolean;
  id?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.textContent = text;
    if (!animate || readReducedMotion()) return;

    let raf = 0;
    const unlock = () => {
      cancelAnimationFrame(raf);
      el.style.height = "";
      el.style.overflow = "";
      el.textContent = text;
    };
    const run = () => {
      el.style.height = `${el.offsetHeight}px`;
      el.style.overflow = "hidden";
      const start = performance.now();
      const frame = (now: number) => {
        const t = Math.min((now - start) / DURATION, 1);
        const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
        const shown = Math.floor(eased * text.length);
        let out = "";
        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          out +=
            ch === " " || i < shown
              ? ch
              : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
        el.textContent = out;
        if (t < 1) raf = requestAnimationFrame(frame);
        else unlock();
      };
      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        run();
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      unlock();
    };
  }, [text, animate]);

  const Tag = As;
  return (
    // aria-label keeps the accessible name stable while the glyphs are scrambled
    <Tag ref={ref} id={id} aria-label={text} className={className}>
      {text}
    </Tag>
  );
}
