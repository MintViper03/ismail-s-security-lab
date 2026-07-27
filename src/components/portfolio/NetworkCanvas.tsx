import { useEffect, useRef } from "react";

type Props = { mode: "attack" | "defend" };

type Layer = "far" | "mid" | "near";

type Node = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  tvx: number;
  tvy: number;
  phase: number;
  // per-node timing offset so nothing feels synchronized
  jitter: number;
  layer: Layer;
  // cached per-layer characteristics
  speedMul: number;
  radiusMul: number;
  glowMul: number;
  alphaMul: number;
};

export function NetworkCanvas({ mode }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    const mouse = { x: 0, y: 0, tx: 0, ty: 0, active: false };
    // camera-style parallax offset (damped toward target)
    const cam = { x: 0, y: 0, tx: 0, ty: 0 };
    const MAX_PARALLAX_X = 8;
    const MAX_PARALLAX_Y = 6;
    let scanY = -0.2;
    const start = performance.now();

    const isSmall = () => window.innerWidth < 720;

    const layerFor = (z: number): Layer =>
      z < 0.34 ? "far" : z < 0.68 ? "mid" : "near";

    const layerProps = (layer: Layer) => {
      // Distinct feel per depth layer without changing overall identity
      switch (layer) {
        case "far":
          return { speedMul: 0.55, radiusMul: 0.75, glowMul: 0.25, alphaMul: 0.55 };
        case "mid":
          return { speedMul: 0.85, radiusMul: 1.0, glowMul: 0.7, alphaMul: 0.9 };
        case "near":
          return { speedMul: 1.15, radiusMul: 1.35, glowMul: 1.25, alphaMul: 1.15 };
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = isSmall() ? 34 : 70;
      nodes = new Array(count).fill(0).map(() => {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const z = Math.random();
        const vx = (Math.random() - 0.5) * 0.12;
        const vy = (Math.random() - 0.5) * 0.12;
        const layer = layerFor(z);
        const props = layerProps(layer);
        return {
          x,
          y,
          z,
          vx,
          vy,
          vz: (Math.random() - 0.5) * 0.0015,
          tvx: vx,
          tvy: vy,
          phase: Math.random() * Math.PI * 2,
          jitter: Math.random() * Math.PI * 2,
          layer,
          ...props,
        };
      });
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.tx = e.clientX - rect.left;
      mouse.ty = e.clientY - rect.top;
      if (!mouse.active) {
        mouse.x = mouse.tx;
        mouse.y = mouse.ty;
      }
      mouse.active = true;
    };
    const onLeave = () => (mouse.active = false);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    const render = (t: number) => {
      const elapsed = (t - start) / 1000;
      const accent =
        modeRef.current === "attack"
          ? { r: 255, g: 95, b: 60 }
          : { r: 0, g: 212, b: 200 };
      const speedMul = modeRef.current === "attack" ? 1.35 : 1;

      ctx.clearRect(0, 0, width, height);

      // ---- camera-style parallax target ------------------------------------
      // Cursor position maps to a tiny scene shift (few pixels only).
      if (mouse.active) {
        const nx = (mouse.tx / width - 0.5) * 2; // -1..1
        const ny = (mouse.ty / height - 0.5) * 2;
        // Invert so scene shifts opposite of cursor for a "look around" feel.
        cam.tx = -nx * MAX_PARALLAX_X;
        cam.ty = -ny * MAX_PARALLAX_Y;
      } else {
        cam.tx = 0;
        cam.ty = 0;
      }
      // heavy damping — should be subliminal
      cam.x += (cam.tx - cam.x) * 0.045;
      cam.y += (cam.ty - cam.y) * 0.045;

      ctx.save();
      ctx.translate(cam.x, cam.y);

      // ambient depth wash — soft radial vignette biased to the accent
      const ambient = ctx.createRadialGradient(
        width * 0.5,
        height * 0.42,
        0,
        width * 0.5,
        height * 0.42,
        Math.max(width, height) * 0.7,
      );
      ambient.addColorStop(0, `rgba(${accent.r},${accent.g},${accent.b},0.045)`);
      ambient.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = ambient;
      ctx.fillRect(-MAX_PARALLAX_X, -MAX_PARALLAX_Y, width + MAX_PARALLAX_X * 2, height + MAX_PARALLAX_Y * 2);

      // ---- grid: preserved, only extremely subtle opacity breathing --------
      // very low frequency sine, tiny amplitude around the original 0.035
      const gridBreath = 0.035 + Math.sin(elapsed * 0.18) * 0.006;
      ctx.strokeStyle = `rgba(232,234,237,${gridBreath.toFixed(4)})`;
      ctx.lineWidth = 1;
      const g = 60;
      for (let x = 0; x < width; x += g) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += g) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // damped mouse follow — softens local attraction
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;

      // update nodes: damp velocity toward target, per-layer speed, per-node jitter
      for (const n of nodes) {
        if (!reduced) {
          n.vx += (n.tvx - n.vx) * 0.04;
          n.vy += (n.tvy - n.vy) * 0.04;

          // per-node phase offset breaks synchronized feel without adding speed
          const wobble = Math.sin(elapsed * 0.35 + n.jitter) * 0.015;
          const wobble2 = Math.cos(elapsed * 0.29 + n.jitter * 1.3) * 0.015;

          n.x += (n.vx + wobble) * speedMul * n.speedMul;
          n.y += (n.vy + wobble2) * speedMul * n.speedMul;
          n.z += n.vz;

          if (Math.random() < 0.004) {
            n.tvx = (Math.random() - 0.5) * 0.14;
            n.tvy = (Math.random() - 0.5) * 0.14;
          }
        }
        if (n.x < 0 || n.x > width) {
          n.vx *= -1;
          n.tvx *= -1;
        }
        if (n.y < 0 || n.y > height) {
          n.vy *= -1;
          n.tvy *= -1;
        }
        if (n.z < 0.02 || n.z > 0.98) n.vz *= -1;

        if (mouse.active) {
          const dx = mouse.x - n.x;
          const dy = mouse.y - n.y;
          const d = Math.hypot(dx, dy);
          if (d < 220) {
            const f = (1 - d / 220) * 6 * (0.4 + n.z);
            n.x += (dx / (d || 1)) * f * -0.045;
            n.y += (dy / (d || 1)) * f * -0.045;
          }
        }
      }

      // links — two passes: soft wide halo, then crisp core. Depth now
      // controls opacity much more aggressively.
      const linkDist = isSmall() ? 110 : 150;
      // halo pass
      ctx.lineWidth = 2.2;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < linkDist) {
            const depth = (a.z + b.z) * 0.5;
            // depth^2 emphasis: far links nearly vanish, near links glow more
            const depthCurve = depth * depth;
            const t2 = 1 - d / linkDist;
            const alpha = t2 * t2 * 0.11 * (0.15 + depthCurve * 1.4);
            ctx.strokeStyle = `rgba(${accent.r},${accent.g},${accent.b},${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      // core pass
      ctx.lineWidth = 0.6;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < linkDist) {
            const depth = (a.z + b.z) * 0.5;
            const depthCurve = depth * depth;
            const t2 = 1 - d / linkDist;
            const alpha = t2 * 0.36 * (0.12 + depthCurve * 1.25);
            ctx.strokeStyle = `rgba(${accent.r},${accent.g},${accent.b},${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // nodes — softer glow, per-layer weighting
      for (const n of nodes) {
        const breathe = reduced ? 0 : Math.sin(elapsed * 0.6 + n.phase) * 0.06;
        const zz = Math.max(0, Math.min(1, n.z + breathe));
        const r = (1 + zz * 2.4) * n.radiusMul;

        // Softer, wider, dimmer glow — physical falloff, no neon.
        if (zz > 0.3) {
          const glowR = r * 7;
          const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
          const peak = 0.14 * zz * n.glowMul;
          glow.addColorStop(0, `rgba(${accent.r},${accent.g},${accent.b},${peak})`);
          // mid stop keeps the falloff soft rather than hard-edged
          glow.addColorStop(
            0.45,
            `rgba(${accent.r},${accent.g},${accent.b},${peak * 0.35})`,
          );
          glow.addColorStop(1, `rgba(${accent.r},${accent.g},${accent.b},0)`);
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
          ctx.fill();
        }

        const coreAlpha = (0.28 + zz * 0.55) * n.alphaMul;
        ctx.fillStyle = `rgba(${accent.r},${accent.g},${accent.b},${Math.min(1, coreAlpha)})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // ---- volumetric horizontal light sweep -------------------------------
      // Wider, slower, subliminal. No hard scan line.
      const period = modeRef.current === "attack" ? 9.5 : 14.0;
      scanY = ((elapsed % period) / period) * (height + 400) - 200;
      const sweepHalf = Math.max(220, height * 0.42);
      const grad = ctx.createLinearGradient(0, scanY - sweepHalf, 0, scanY + sweepHalf);
      grad.addColorStop(0, `rgba(${accent.r},${accent.g},${accent.b},0)`);
      grad.addColorStop(
        0.5,
        `rgba(${accent.r},${accent.g},${accent.b},0.035)`,
      );
      grad.addColorStop(1, `rgba(${accent.r},${accent.g},${accent.b},0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, scanY - sweepHalf, width, sweepHalf * 2);

      ctx.restore();

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
