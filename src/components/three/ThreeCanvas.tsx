/**
 * Thin wrapper around @react-three/fiber's <Canvas> with sensible
 * performance defaults for this project.
 *
 * Not mounted anywhere yet — this is scaffolding for future 3D scenes.
 * It stays client-only (dynamic import from consumers behind
 * <ClientOnly> or React.lazy) because R3F touches WebGL during render.
 */
import { Canvas, type CanvasProps } from "@react-three/fiber";
import { type ReactNode } from "react";

import { recommendedDpr } from "@/lib/motion/prefers-reduced-motion";

type Props = Omit<CanvasProps, "children"> & {
  children: ReactNode;
  className?: string;
};

export function ThreeCanvas({ children, className, ...rest }: Props) {
  return (
    <Canvas
      className={className}
      dpr={recommendedDpr()}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
      camera={{ position: [0, 0, 6], fov: 50 }}
      {...rest}
    >
      {children}
    </Canvas>
  );
}
