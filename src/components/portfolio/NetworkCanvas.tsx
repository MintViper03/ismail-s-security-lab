import { useEffect, useRef } from "react";

type Props = { mode: "attack" | "defend" };

type Node = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  bx: number;
  by: number;
  bz: number;
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
    const mouse = { x: 0, y: 0, active: false };
    let scanY = -0.2;
    let start = performance.now();

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
        return {
          x,
          y,
          z,
          bx: x,
          by: y,
          bz: z,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          vz: (Math.random() - 0.5) * 0.002,
        };
      });
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
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
      const speedMul = modeRef.current === "attack" ? 1.6 : 1;

      ctx.clearRect(0, 0, width, height);

      // subtle grid
      ctx.strokeStyle = "rgba(232,234,237,0.04)";
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

      // update
      for (const n of nodes) {
        if (!reduced) {
          n.x += n.vx * speedMul;
          n.y += n.vy * speedMul;
          n.z += n.vz;
        }
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
        if (n.z < 0 || n.z > 1) n.vz *= -1;

        // mouse parallax
        if (mouse.active) {
          const dx = mouse.x - n.x;
          const dy = mouse.y - n.y;
          const d = Math.hypot(dx, dy);
          if (d < 220) {
            const f = (1 - d / 220) * 6 * (0.4 + n.z);
            n.x += (dx / (d || 1)) * f * -0.05;
            n.y += (dy / (d || 1)) * f * -0.05;
          }
        }
      }

      // links
      const linkDist = isSmall() ? 110 : 150;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < linkDist) {
            const alpha = (1 - d / linkDist) * 0.35;
            ctx.strokeStyle = `rgba(${accent.r},${accent.g},${accent.b},${alpha * 0.55})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // nodes
      for (const n of nodes) {
        const r = 1 + n.z * 2.2;
        ctx.fillStyle = `rgba(${accent.r},${accent.g},${accent.b},${0.35 + n.z * 0.5})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // scanning sweep line
      const period = modeRef.current === "attack" ? 2.4 : 4.2;
      scanY = ((elapsed % period) / period) * height;
      const grad = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 60);
      grad.addColorStop(0, `rgba(${accent.r},${accent.g},${accent.b},0)`);
      grad.addColorStop(0.5, `rgba(${accent.r},${accent.g},${accent.b},0.18)`);
      grad.addColorStop(1, `rgba(${accent.r},${accent.g},${accent.b},0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, scanY - 60, width, 120);

      // horizontal scan line
      ctx.strokeStyle = `rgba(${accent.r},${accent.g},${accent.b},0.6)`;
      ctx.lineWidth = 0.6;
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
