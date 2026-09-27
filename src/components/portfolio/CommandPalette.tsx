import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CommandPaletteDialog as DialogComponent } from "./CommandPaletteDialog";

// Loaded into state rather than via React.lazy/Suspense: React 19 throttles revealing
// suspended content by ~300ms, which made the first open feel sluggish.
let dialogModule: Promise<typeof DialogComponent> | null = null;
const loadDialog = () =>
  (dialogModule ??= import("./CommandPaletteDialog").then((m) => m.CommandPaletteDialog));

/** True when the key event comes from somewhere the visitor is typing. */
function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.closest("input, textarea, select, [contenteditable=''], [contenteditable='true']") !==
        null)
  );
}

/**
 * Keeps the palette's shortcut (Ctrl/⌘+K or "/") and loads the dialog code (cmdk + Radix
 * dialog) on demand: preloaded on first interaction or when idle, rendered once loaded. The
 * shortcut never fires while the visitor is typing in a field.
 */
export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [Dialog, setDialog] = useState<typeof DialogComponent | null>(null);
  // Where focus was when the palette was requested. Captured here (always mounted), not in
  // the lazy dialog: on a slow connection keys pressed while its code loads would move it.
  const opener = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (open) opener.current = document.activeElement as HTMLElement | null;
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || isTyping(e.target)) return;
      const isK = e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey) && !e.altKey;
      const isSlash = e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey;
      if (!isK && !isSlash) return;
      e.preventDefault();
      onOpenChange(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onOpenChange]);

  // first open before the preload finished: load now; renders as soon as it resolves
  useEffect(() => {
    if (open && !Dialog) void loadDialog().then((C) => setDialog(() => C));
  }, [open, Dialog]);

  // Warm the chunk so the first open is instant: on the visitor's first interaction (the
  // running 3D scene can keep the page from ever being "idle"), or when idle, whichever
  // comes first.
  useEffect(() => {
    let done = false;
    const preload = () => {
      if (done) return;
      done = true;
      loadDialog()
        .then((C) => setDialog(() => C))
        .catch(() => {});
    };
    const events = ["pointerdown", "keydown", "focusin"] as const;
    events.forEach((e) => window.addEventListener(e, preload, { once: true, passive: true }));
    // Safari has no requestIdleCallback; fall back to a short timeout there
    const hasIdle = typeof window.requestIdleCallback === "function";
    const handle = hasIdle
      ? window.requestIdleCallback(preload, { timeout: 4000 })
      : window.setTimeout(preload, 2500);
    return () => {
      events.forEach((e) => window.removeEventListener(e, preload));
      // idle and timeout ids are separate namespaces: cancel only the one scheduled
      if (hasIdle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
    };
  }, []);

  if (!Dialog) return null;
  return <Dialog open={open} onOpenChange={onOpenChange} opener={opener} />;
}
