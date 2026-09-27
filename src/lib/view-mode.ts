import { createContext, useContext } from "react";

/**
 * "Interactive" runs decorative motion (3D scene, reveals, smooth scroll, heading
 * scramble, magnetic buttons) and may tuck secondary detail into disclosures.
 * "Reading" turns all of that off and renders every detail in normal document flow.
 *
 * The <html data-view> attribute is the source of truth. VIEW_MODE_INIT_SCRIPT sets it
 * before first paint (saved choice, else Interactive) so CSS can
 * apply reading mode without a flash; React state mirrors it after hydration.
 */

export type ViewMode = "interactive" | "reading";

// v2: versioned so a "reading" choice stored under the previous design doesn't silently
// hide the new stage (see docs/visual-redesign-v2.md §1). Reading is now only ever an
// explicit choice; OS reduced motion keeps Interactive but renders a still 3D frame.
export const STORAGE_KEY = "view-mode-v2";

export const VIEW_MODE_INIT_SCRIPT = `(function(){var d=document.documentElement,m;try{m=localStorage.getItem("${STORAGE_KEY}")}catch(e){}if(m!=="interactive"&&m!=="reading"){m="interactive"}d.setAttribute("data-view",m)})();`;

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
  /** Convenience: ready && mode === "interactive". Gate client-only decoration on this. */
  motion: boolean;
};

export const ViewModeContext = createContext<ViewModeState>({
  mode: "interactive",
  setMode: () => {},
  ready: false,
  motion: false,
});

export function useViewMode() {
  return useContext(ViewModeContext);
}
