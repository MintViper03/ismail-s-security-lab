import { useEffect, useRef } from "react";
import { createSculptureScene, type SculptureHandle } from "./sculpture-scene";

/**
 * The page's one WebGL canvas. Heavy module (three.js): only ever loaded through the
 * dynamic import() in Sculpture.tsx — never under reduced motion or in Reading mode.
 */
export function SculptureCanvas({
  focus,
  paused,
  inView,
  onReady,
  onContextLost,
  onHandle,
}: {
  focus: number;
  paused: boolean;
  inView: boolean;
  onReady: () => void;
  onContextLost: () => void;
  onHandle: (handle: SculptureHandle | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handle = useRef<SculptureHandle | null>(null);
  // latest callbacks without re-creating the scene
  const cb = useRef({ onReady, onContextLost, onHandle });
  cb.current = { onReady, onContextLost, onHandle };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const stage = canvas.closest<HTMLElement>("[data-stage]");
    // 0 at the top of the stage, 1 once it has fully scrolled away
    const getProgress = () => {
      if (!stage) return 0;
      const r = stage.getBoundingClientRect();
      return r.height ? -r.top / r.height : 0;
    };
    try {
      handle.current = createSculptureScene(canvas, {
        focus,
        paused,
        getProgress,
        debug: true,
        onReady: () => cb.current.onReady(),
        onContextLost: () => cb.current.onContextLost(),
      });
      cb.current.onHandle(handle.current);
    } catch {
      // WebGLRenderer throws when no context can be created
      cb.current.onContextLost();
    }
    return () => {
      cb.current.onHandle(null);
      handle.current?.dispose();
      handle.current = null;
    };
    // created once; later changes go through the handle below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => handle.current?.setFocus(focus), [focus]);
  useEffect(() => handle.current?.setPaused(paused), [paused]);
  useEffect(() => handle.current?.setOnScreen(inView), [inView]);

  return <canvas ref={canvasRef} data-sculpture-canvas className="block h-full w-full" />;
}
