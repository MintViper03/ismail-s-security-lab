import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  MOTION_KEY,
  STORAGE_KEY,
  ViewModeContext,
  readReducedMotion,
  readViewMode,
  type ViewMode,
} from "./view-mode";
import { uiStorage } from "./ui-storage";

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ViewMode>("interactive");
  const [reducedMotion, setReducedState] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setModeState(readViewMode());
    setReducedState(readReducedMotion());
    setReady(true);
    // follow the OS setting live until the visitor makes a choice of their own
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      if (uiStorage.get(MOTION_KEY)) return;
      document.documentElement.setAttribute("data-motion", mq.matches ? "reduced" : "full");
      setReducedState(mq.matches);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setMode = useCallback((next: ViewMode) => {
    document.documentElement.setAttribute("data-view", next);
    // falls back to memory when storage is blocked: the choice lasts for this page view
    uiStorage.set(STORAGE_KEY, next);
    setModeState(next);
  }, []);

  const setReducedMotion = useCallback((reduced: boolean) => {
    const value = reduced ? "reduced" : "full";
    document.documentElement.setAttribute("data-motion", value);
    uiStorage.set(MOTION_KEY, value);
    setReducedState(reduced);
  }, []);

  return (
    <ViewModeContext.Provider
      value={{
        mode,
        setMode,
        ready,
        reducedMotion,
        setReducedMotion,
        motion: ready && mode === "interactive" && !reducedMotion,
      }}
    >
      {children}
    </ViewModeContext.Provider>
  );
}
