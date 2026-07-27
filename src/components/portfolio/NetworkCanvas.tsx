import { useEffect, useRef } from "react";

type Props = { mode: "attack" | "defend" };

type Node = {
  x: number;
  y: number;
  z: number;
  // target velocities (damped toward)
  vx: number;
  vy: number;
  vz: number;
  tvx: number;
  tvy: number;
  // phase for subtle depth breathing
  phase: number;
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
    let scanY = -0.2;
    const start = performance.now();

    const isSmall = () => window.innerWidth < 720;

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
      ctx.fillRect(0, 0, width, height);

      // subtle grid
      ctx.strokeStyle = "rgba(232,234,237,0.035)";
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

      // damped mouse follow — softens parallax
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;

      // update nodes: damp velocity toward target, gentle breathing on z
      for (const n of nodes) {
        if (!reduced) {
          // ease actual velocity toward target for buttery motion
          n.vx += (n.tvx - n.vx) * 0.04;
          n.vy += (n.tvy - n.vy) * 0.04;

          n.x += n.vx * speedMul;
          n.y += n.vy * speedMul;
          n.z += n.vz;

          // occasional gentle course change so motion never feels linear
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

      // links — two passes: soft wide halo, then crisp core
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
            const t2 = 1 - d / linkDist;
            const alpha = t2 * t2 * 0.09 * (0.5 + depth);
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
            const t2 = 1 - d / linkDist;
            const alpha = t2 * 0.32 * (0.35 + depth * 0.9);
            ctx.strokeStyle = `rgba(${accent.r},${accent.g},${accent.b},${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // nodes — soft glow (near) + core dot, with subtle z breathing
      for (const n of nodes) {
        const breathe = reduced ? 0 : Math.sin(elapsed * 0.6 + n.phase) * 0.06;
        const zz = Math.max(0, Math.min(1, n.z + breathe));
        const r = 1 + zz * 2.4;

        // glow (only for nearer / larger nodes so far ones stay crisp)
        if (zz > 0.35) {
          const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 6);
          glow.addColorStop(
            0,
            `rgba(${accent.r},${accent.g},${accent.b},${0.18 * zz})`,
          );
          glow.addColorStop(1, `rgba(${accent.r},${accent.g},${accent.b},0)`);
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(n.x, n.y, r * 6, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = `rgba(${accent.r},${accent.g},${accent.b},${0.3 + zz * 0.55})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // scanning sweep — gentler, longer period
      const period = modeRef.current === "attack" ? 3.2 : 5.4;
      scanY = ((elapsed % period) / period) * height;
      const grad = ctx.createLinearGradient(0, scanY - 90, 0, scanY + 90);
      grad.addColorStop(0, `rgba(${accent.r},${accent.g},${accent.b},0)`);
      grad.addColorStop(
        0.5,
        `rgba(${accent.r},${accent.g},${accent.b},0.09)`,
      );
      grad.addColorStop(1, `rgba(${accent.r},${accent.g},${accent.b},0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, scanY - 90, width, 180);

      ctx.strokeStyle = `rgba(${accent.r},${accent.g},${accent.b},0.32)`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(width, scanY);
      ctx.stroke();

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
