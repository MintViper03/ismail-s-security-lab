/**
 * Storage for non-sensitive UI preferences only (display mode, exploration progress,
 * panel visibility). Uses localStorage when the browser allows it and silently falls
 * back to memory for this page view when storage is blocked (private mode, disabled
 * cookies, sandboxed iframes). Nothing here is ever sent anywhere.
 */

const memory = new Map<string, string>();

function local(): Storage | null {
  try {
    const s = window.localStorage;
    const probe = "__ui_probe__";
    s.setItem(probe, probe);
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

export const uiStorage = {
  get(key: string): string | null {
    if (typeof window === "undefined") return null;
    const s = local();
    if (s) {
      try {
        return s.getItem(key);
      } catch {
        // fall through to memory
      }
    }
    return memory.get(key) ?? null;
  },
  set(key: string, value: string) {
    if (typeof window === "undefined") return;
    memory.set(key, value);
    try {
      local()?.setItem(key, value);
    } catch {
      // memory copy already holds it
    }
  },
  remove(key: string) {
    if (typeof window === "undefined") return;
    memory.delete(key);
    try {
      local()?.removeItem(key);
    } catch {
      // nothing else to clear
    }
  },
};
