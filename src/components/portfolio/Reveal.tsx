import { useEffect, useRef, type ReactNode } from "react";

export function Reveal({
  children,
  as: As = "div",
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  as?: any;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setTimeout(() => el.classList.add("reveal-in"), delay);
            io.disconnect();
          }
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return (
    <As ref={ref as any} className={`reveal ${className}`}>
      {children}
    </As>
  );
}
