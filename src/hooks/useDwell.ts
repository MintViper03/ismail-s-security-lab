import { useEffect } from "react";

/**
 * Calls `onDwell` once an element has spent `ms` (cumulative) crossing the middle band of
 * the viewport — i.e. it was actually on screen, not just scrolled past. `enabled` lets
 * callers limit it (e.g. to Reading mode, where there is nothing to click).
 */
export function useDwell(
  target: string | (() => HTMLElement | null),
  ms: number,
  onDwell: () => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;
    const el = typeof target === "string" ? document.getElementById(target) : target();
    if (!el) return;

    let total = 0;
    let since: number | null = null;
    let timer: number | undefined;
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      io.disconnect();
      onDwell();
    };
    const start = () => {
      since = performance.now();
      timer = window.setTimeout(finish, Math.max(0, ms - total));
    };
    const stop = () => {
      if (since !== null) total += performance.now() - since;
      since = null;
      window.clearTimeout(timer);
    };

    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), {
      rootMargin: "-35% 0px -35% 0px",
    });
    io.observe(el);
    return () => {
      stop();
      io.disconnect();
    };
    // target/onDwell are stable per call site; re-run only when enabled/ms change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ms]);
}
