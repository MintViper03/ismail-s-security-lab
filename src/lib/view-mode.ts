import { createContext, useContext } from "react";

/**
 * "Interactive" runs decorative motion (3D scene, reveals, smooth scroll, heading
 * scramble, magnetic buttons) and may tuck secondary detail into disclosures.
 * "Reading" turns all of that off and renders every detail in normal document flow.
 *
 * The <html data-view> attribute is the source of truth. VIEW_MODE_INIT_SCRIPT sets it
 * before first paint (saved choice, else Interactive) so CSS can
 * apply reading mode without a flash; React state mirrors it after hydration.
 *
 * Motion is a separate, independent switch: <html data-motion="full" | "reduced">, set
 * before first paint from the visitor's choice (the header "Motion" control) or, until
 * they choose, the OS reduced-motion setting. "reduced" stops every animation and
 * transition, the pointer depth and the 3D loop (the sculpture shows its static poster).
 */

export type ViewMode = "interactive" | "reading";

// v2: versioned so a "reading" choice stored under the previous design doesn't silently
// hide the new stage (see docs/visual-redesign-v2.md §1). Reading is now only ever an
// explicit choice; OS reduced motion keeps Interactive but renders a still 3D frame.
export const STORAGE_KEY = "view-mode-v2";

export const MOTION_KEY = "motion-pref";
export type MotionPref = "full" | "reduced";

export const VIEW_MODE_INIT_SCRIPT = `(function(){var d=document.documentElement,m,p;try{m=localStorage.getItem("${STORAGE_KEY}");p=localStorage.getItem("${MOTION_KEY}")}catch(e){}if(m!=="interactive"&&m!=="reading"){m="interactive"}d.setAttribute("data-view",m);if(p!=="full"&&p!=="reduced"){p=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches?"reduced":"full"}d.setAttribute("data-motion",p)})();`;

/** True when motion is off (visitor's choice or OS setting), read from <html data-motion>. */
export function readReducedMotion(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.getAttribute("data-motion") === "reduced";
}

export function readViewMode(): ViewMode {
  if (typeof document === "undefined") return "interactive";
  return document.documentElement.getAttribute("data-view") === "reading"
    ? "reading"
    : "interactive";
}

type ViewModeState = {
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
  /** False during SSR and the first client render; true once the real mode is known. */
  ready: boolean;
  /** Motion switched off (visitor's choice, else the OS setting). */
  reducedMotion: boolean;
  setReducedMotion: (reduced: boolean) => void;
  /** Convenience: ready, Interactive and motion on. Gate client-only decoration on this. */
  motion: boolean;
};

export const ViewModeContext = createContext<ViewModeState>({
  mode: "interactive",
  setMode: () => {},
  ready: false,
  reducedMotion: false,
  setReducedMotion: () => {},
  motion: false,
});

export function useViewMode() {
  return useContext(ViewModeContext);
}
