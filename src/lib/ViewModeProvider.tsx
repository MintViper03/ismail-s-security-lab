import { useCallback, useEffect, useState, type ReactNode } from "react";
import { STORAGE_KEY, ViewModeContext, readViewMode, type ViewMode } from "./view-mode";
import { uiStorage } from "./ui-storage";

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ViewMode>("interactive");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setModeState(readViewMode());
    setReady(true);
  }, []);

  const setMode = useCallback((next: ViewMode) => {
    document.documentElement.setAttribute("data-view", next);
    // falls back to memory when storage is blocked: the choice lasts for this page view
    uiStorage.set(STORAGE_KEY, next);
    setModeState(next);
  }, []);

  return (
    <ViewModeContext.Provider
      value={{ mode, setMode, ready, motion: ready && mode === "interactive" }}
    >
      {children}
    </ViewModeContext.Provider>
  );
}
