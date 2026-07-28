import { useEffect, useState, type ComponentType } from "react";
import { NetworkCanvas } from "./NetworkCanvas";

type Mode = "attack" | "defend";

function supportsWebGL() {
    try {
        const canvas = document.createElement("canvas");
        return !!(
            window.WebGLRenderingContext &&
            (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
        );
    } catch {
        return false;
    }
}

/**
 * Public hero entry point. Deliberately contains NO static import of
 * three.js / @react-three/fiber — those only get pulled in via the
 * dynamic import() below, and only in the browser, after mount. This
 * keeps ~400kb+ of WebGL-only code out of the server/SSR bundle, since
 * it can never run there anyway.
 *
 * Falls back to the lightweight 2D canvas network if WebGL isn't
 * available (old devices, disabled GPU, etc.).
 */
export function Hero3D({ mode }: { mode: Mode }) {
    const [Canvas3D, setCanvas3D] = useState<ComponentType<{ mode: Mode }> | null>(
        null
    );
    const [status, setStatus] = useState<"loading" | "webgl" | "fallback">(
        "loading"
    );

    useEffect(() => {
        if (!supportsWebGL()) {
            setStatus("fallback");
            return;
        }
        let cancelled = false;
        import("./Hero3DCanvas").then((mod) => {
            if (cancelled) return;
            setCanvas3D(() => mod.Hero3DCanvasImpl);
            setStatus("webgl");
        });
        return () => {
            cancelled = true;
        };
    }, []);

    if (status === "loading") return null;
    if (status === "fallback" || !Canvas3D) return <NetworkCanvas mode={mode} />;

    return <Canvas3D mode={mode} />;
}
