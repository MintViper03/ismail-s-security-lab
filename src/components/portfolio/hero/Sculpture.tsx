import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { useViewMode } from "@/lib/view-mode";
import type { SculptureHandle } from "./sculpture-scene";
import { canvasRect, findSculptureBox, scanStage, type Box, type Rect } from "./sculpture-layout";

/**
 * Static posters of the same sculpture, one per arrangement, rendered from the real scene
 * (renderSculpturePoster) at the canvas's aspect. Shown while the 3D loads, if it fails,
 * under reduced motion and in Reading mode.
 */
export const SCULPTURE_POSTERS = [
  "/hero-sculpture-offensive.webp",
  "/hero-sculpture-response.webp",
  "/hero-sculpture-development.webp",
] as const;
// canvas aspect: SLOT.padX / (SLOT.padY × SLOT.aspect) = 1.45 / 2.08
export const POSTER_SIZE = { width: 816, height: 1171 } as const;

type CanvasProps = {
  focus: number;
  paused: boolean;
  inView: boolean;
  onReady: () => void;
  onContextLost: () => void;
  onHandle: (handle: SculptureHandle | null) => void;
};

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}

/** A failed WebGL context (or any scene error) leaves the poster in place. */
class SceneBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * The hero's 3D "security architecture" sculpture, placed in the largest free slot beside
 * the portrait (sculpture-layout.ts) — never over the face, the name or the actions. The
 * poster is in place from hydration; when `enabled` (Interactive mode) and motion is
 * allowed, the single WebGL canvas loads with a dynamic import() and cross-fades in.
 */
export function Sculpture({
  focus,
  paused,
  enabled,
  onLiveChange,
}: {
  /** 0–2, or −1 in Reading mode (shows the default arrangement). */
  focus: number;
  paused: boolean;
  enabled: boolean;
  onLiveChange: (live: boolean) => void;
}) {
  const layerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<SculptureHandle | null>(null);
  const [box, setBox] = useState<Box | null>(null);
  const boxRef = useRef<Box | null>(null);
  boxRef.current = box;
  const [Scene, setScene] = useState<ComponentType<CanvasProps> | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [inView, setInView] = useState(true);
  const { reducedMotion } = useViewMode();
  const wantLive = enabled && !reducedMotion && !failed;
  const shownFocus = Math.max(focus, 0);

  // --- slot: measured after fonts load, and again whenever the stage or viewport resizes or
  // the photo decodes. Masks are refreshed on every measure: the face box can appear (photo
  // decoded) or move without the slot itself changing.
  const pushRef = useRef<() => void>(() => {});
  useEffect(() => {
    const stage = layerRef.current?.closest<HTMLElement>("[data-stage]");
    if (!stage) return;
    let raf = 0;
    const measure = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const b = findSculptureBox(stage);
        setBox((prev) =>
          !b
            ? null
            : prev &&
                Math.abs(prev.cx - b.cx) < 2 &&
                Math.abs(prev.cy - b.cy) < 2 &&
                Math.abs(prev.ry - b.ry) < 2
              ? prev
              : b,
        );
        pushRef.current();
      });
    };
    measure();
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    const img = stage.querySelector("img[data-face]");
    img?.addEventListener("load", measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      img?.removeEventListener("load", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  // --- occlusion: face, name and actions are masked; rings pass behind the photo's face side
  const pushOcclusion = useCallback(() => {
    const h = handleRef.current;
    const b = boxRef.current;
    const stage = layerRef.current?.closest<HTMLElement>("[data-stage]");
    if (!h || !b || !stage) return;
    const c = canvasRect(b);
    const { obstacles, face, photo } = scanStage(stage, 0.6);
    const local = (r: Rect): Rect => ({ x: r.x - c.x, y: r.y - c.y, w: r.w, h: r.h });
    const masks = obstacles
      .map(local)
      .filter((r) => r.x < c.w && r.y < c.h && r.x + r.w > 0 && r.y + r.h > 0);
    let behind: Rect | null = null;
    if (photo && face) {
      const faceRight = face.x + face.w / 2 > b.cx;
      const x0 = faceRight ? Math.max(photo.x, b.cx) : photo.x;
      const x1 = faceRight ? photo.x + photo.w : Math.min(photo.x + photo.w, b.cx);
      if (x1 > x0) behind = local({ x: x0, y: photo.y, w: x1 - x0, h: photo.h });
    }
    h.setOcclusion(masks, behind);
  }, []);
  pushRef.current = pushOcclusion;
  useEffect(pushOcclusion, [box, ready, pushOcclusion]);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        pushOcclusion();
        handleRef.current?.nudge();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pushOcclusion]);

  // --- the 3D chunk: only once there is a slot, motion is allowed and WebGL exists
  useEffect(() => {
    if (!wantLive || !box || Scene) return;
    if (!supportsWebGL()) {
      setFailed(true);
      return;
    }
    let cancelled = false;
    import("./SculptureCanvas")
      .then((m) => {
        if (!cancelled) setScene(() => m.SculptureCanvas);
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [wantLive, box, Scene]);
  useEffect(() => {
    if (!wantLive) setReady(false);
  }, [wantLive]);

  // stop rendering frames while the sculpture is scrolled away. Observed only once the layer
  // is displayed (it is display:none until its slot is measured): an observation that starts
  // on a box-less element was not reliably followed by the change to visible.
  const placed = !!box;
  useEffect(() => {
    const el = layerRef.current;
    if (!el || !placed) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [placed]);

  const live = wantLive && !!Scene && ready;
  useEffect(() => onLiveChange(live), [live, onLiveChange]);

  // poster follows the focus; the next one is decoded before it is swapped in
  const [posterIdx, setPosterIdx] = useState(shownFocus);
  useEffect(() => {
    if (posterIdx === shownFocus) return;
    let off = false;
    const im = new Image();
    im.src = SCULPTURE_POSTERS[shownFocus];
    im.decode()
      .catch(() => {})
      .then(() => {
        if (!off) setPosterIdx(shownFocus);
      });
    return () => {
      off = true;
    };
  }, [shownFocus, posterIdx]);

  const onHandle = useCallback(
    (h: SculptureHandle | null) => {
      handleRef.current = h;
      pushOcclusion();
    },
    [pushOcclusion],
  );

  const c = box ? canvasRect(box) : null;
  return (
    <div
      ref={layerRef}
      aria-hidden
      data-sculpture
      className="pointer-events-none absolute z-10 [mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent,#000_7%,#000_93%,transparent),linear-gradient(to_bottom,transparent,#000_6%,#000_94%,transparent)]"
      style={c ? { left: c.x, top: c.y, width: c.w, height: c.h } : { display: "none" }}
    >
      <img
        src={SCULPTURE_POSTERS[posterIdx]}
        alt=""
        width={POSTER_SIZE.width}
        height={POSTER_SIZE.height}
        decoding="async"
        data-sculpture-poster
        className={`absolute inset-0 h-full w-full transition-opacity duration-300 ${live ? "opacity-0" : "opacity-100"}`}
      />
      {wantLive && Scene && (
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}
        >
          <SceneBoundary
            onError={() => {
              setFailed(true);
              setReady(false);
            }}
          >
            <Scene
              focus={shownFocus}
              paused={paused}
              inView={inView}
              onReady={() => setReady(true)}
              onContextLost={() => {
                // GPU reset or context limit: keep the poster from here on
                setFailed(true);
                setReady(false);
              }}
              onHandle={onHandle}
            />
          </SceneBoundary>
        </div>
      )}
    </div>
  );
}
