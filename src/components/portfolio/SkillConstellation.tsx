import { useEffect, useRef, type CSSProperties } from "react";
import { skills } from "@/content/resume";
import { skillTiers } from "@/content/site";

/**
 * Capability constellation: the seven resume skill groups as clusters around a hub —
 * security groups on the left arc, engineering on the right — one point per skill, all
 * the same size (no levels, ratings or weighting of any kind).
 *
 * Interaction: clicking or tapping a cluster selects that category (`onSelect`), and the
 * point for a skill hovered in the HTML list lights (`highlight`). The drawing itself is
 * aria-hidden and has no tab stops: the category tabs beside it are the keyboard and
 * screen-reader control, and the HTML list is the readable equivalent. The clusters
 * assemble as the section scrolls in (styles.css `.cst-group`); points twinkle slowly
 * only while it is on screen.
 */

const W = 840;
const H = 540;
const CX = W / 2;
const CY = H / 2;
const RX = 190;
const RY = 170;
const rad = (d: number) => (d * Math.PI) / 180;

type Cluster = {
  id: string;
  label: string[];
  x: number;
  y: number;
  lx: number;
  ly: number;
  anchor: "start" | "middle" | "end";
  dots: { x: number; y: number }[];
  scatter: { dx: number; dy: number; rot: number };
};

/** Label split into at most two balanced lines (e.g. "Frameworks and" / "Standards"). */
function lines(label: string): string[] {
  if (label.length <= 14) return [label];
  const words = label.split(" ");
  let best = [label];
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ");
    const b = words.slice(i).join(" ");
    const d = Math.abs(a.length - b.length);
    if (d < bestDiff) {
      bestDiff = d;
      best = [a, b];
    }
  }
  return best;
}

function layout(): Cluster[] {
  const arcs: [readonly string[], number, number][] = [
    [skillTiers[0].groups, 132, 228], // security: left arc
    [skillTiers[1].groups, -38, 38], // engineering: right arc
  ];
  const out: Cluster[] = [];
  for (const [ids, from, to] of arcs) {
    ids.forEach((gid, i) => {
      const g = skills.find((s) => s.id === gid)!;
      const deg = ids.length === 1 ? (from + to) / 2 : from + ((to - from) * i) / (ids.length - 1);
      const a = rad(deg);
      const x = CX + RX * Math.cos(a);
      const y = CY + RY * Math.sin(a);
      // satellites fan outward from the hub; long groups use two rings
      const n = g.items.length;
      const rings = n > 7 ? [Math.ceil(n / 2), n - Math.ceil(n / 2)] : [n];
      const dots: { x: number; y: number }[] = [];
      rings.forEach((count, ri) => {
        const r = ri === 0 ? 30 : 48;
        const step = rad(Math.min(24, 150 / Math.max(count, 1)));
        for (let k = 0; k < count; k++) {
          const off = (k - (count - 1) / 2) * step + (ri === 1 ? step / 2 : 0);
          dots.push({ x: x + r * Math.cos(a + off), y: y + r * Math.sin(a + off) });
        }
      });
      const reach = (rings.length > 1 ? 48 : 30) + 16;
      const c = Math.cos(a);
      out.push({
        id: gid,
        label: lines(g.label),
        x,
        y,
        lx: x + reach * c,
        ly: y + reach * Math.sin(a),
        anchor: c < -0.3 ? "end" : c > 0.3 ? "start" : "middle",
        dots,
        // where the cluster starts before it assembles: flung outward, turned
        scatter: {
          dx: Math.round(c * 150 + (i % 2 ? 40 : -40)),
          dy: Math.round(Math.sin(a) * 120 + (i % 2 ? -30 : 30)),
          rot: i % 2 ? 28 : -24,
        },
      });
    });
  }
  return out;
}

const CLUSTERS = layout();
const TOTAL = skills.reduce((n, g) => n + g.items.length, 0);
const HEX = Array.from({ length: 6 }, (_, i) => {
  const a = rad(60 * i - 90);
  return `${(CX + 22 * Math.cos(a)).toFixed(1)},${(CY + 22 * Math.sin(a)).toFixed(1)}`;
}).join(" ");

export function SkillConstellation({
  active,
  onSelect,
  highlight,
  className = "",
}: {
  /** Index into `skills` of the highlighted group, or −1 for none. */
  active: number;
  /** Pointer shortcut: a cluster was clicked/tapped (index into `skills`). */
  onSelect?: (index: number) => void;
  /** A skill name (exact resume text) whose point should light. */
  highlight?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // ambient twinkle only while on screen (attribute, no re-render)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) =>
      el.toggleAttribute("data-inview", e.isIntersecting),
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const activeId = active >= 0 ? skills[active]?.id : undefined;
  let dotIndex = 0;

  return (
    <div ref={ref} aria-hidden className={`cst ${className}`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full overflow-visible" focusable="false">
        {/* ring through the clusters, appears once they have assembled */}
        <g className="cst-links">
          <ellipse
            cx={CX}
            cy={CY}
            rx={RX}
            ry={RY}
            fill="none"
            stroke="var(--line)"
            strokeDasharray="2 6"
          />
          <text x={CX - RX} y={CY + RY + 44} textAnchor="middle" className="cst-tier">
            {skillTiers[0].label}
          </text>
          <text x={CX + RX} y={CY + RY + 44} textAnchor="middle" className="cst-tier">
            {skillTiers[1].label}
          </text>
        </g>

        {CLUSTERS.map((c) => {
          const on = c.id === activeId;
          const index = skills.findIndex((g) => g.id === c.id);
          const items = skills[index].items;
          return (
            <g
              key={c.id}
              className={`cst-group ${onSelect ? "cst-pick" : ""}`}
              data-active={on || undefined}
              onClick={onSelect ? () => onSelect(index) : undefined}
              style={
                {
                  "--dx": `${c.scatter.dx}px`,
                  "--dy": `${c.scatter.dy}px`,
                  "--rot": `${c.scatter.rot}deg`,
                } as CSSProperties
              }
            >
              <line
                data-part="spoke"
                x1={CX}
                y1={CY}
                x2={c.x}
                y2={c.y}
                stroke={on ? "var(--accent)" : "var(--line)"}
                strokeOpacity={on ? 0.7 : 1}
              />
              {c.dots.map((d, k) => (
                <line
                  key={`l${k}`}
                  data-part="link"
                  x1={c.x}
                  y1={c.y}
                  x2={d.x}
                  y2={d.y}
                  stroke={on ? "var(--accent)" : "var(--line)"}
                  strokeOpacity={on ? 0.45 : 0.8}
                />
              ))}
              {/* generous invisible hit area: the whole cluster is one touch target */}
              {onSelect && <circle cx={c.x} cy={c.y} r={62} fill="transparent" data-part="hit" />}
              {c.dots.map((d, k) => {
                const lit = on && highlight === items[k];
                return (
                  <circle
                    key={`d${k}`}
                    data-part="dot"
                    data-skill={items[k]}
                    data-lit={lit || undefined}
                    className="cst-dot"
                    style={{ "--i": dotIndex++ } as CSSProperties}
                    cx={d.x}
                    cy={d.y}
                    r={lit ? 6 : on ? 3.4 : 2.6}
                    fill={on ? "var(--accent)" : "var(--muted)"}
                    fillOpacity={on ? 1 : 0.55}
                  />
                );
              })}
              <circle
                data-part="node"
                cx={c.x}
                cy={c.y}
                r={on ? 9 : 7}
                fill={on ? "var(--accent)" : "var(--surface-2)"}
                stroke={on ? "var(--accent)" : "var(--control)"}
                strokeWidth={1.5}
              />
              <text
                data-part="label"
                x={c.lx}
                y={c.ly - (c.label.length - 1) * 8}
                textAnchor={c.anchor}
                dominantBaseline="middle"
                className="cst-label"
                fill={on ? "var(--text)" : "var(--muted)"}
              >
                {c.label.map((t, k) => (
                  <tspan key={t} x={c.lx} dy={k === 0 ? 0 : 16}>
                    {t}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}

        {highlight &&
          CLUSTERS.map((c) => {
            if (c.id !== activeId) return null;
            const k = skills.find((g) => g.id === c.id)!.items.indexOf(highlight);
            if (k < 0) return null;
            const d = c.dots[k];
            const right = d.x >= c.x;
            return (
              <text
                key="lit"
                x={d.x + (right ? 12 : -12)}
                y={d.y - 12}
                textAnchor={right ? "start" : "end"}
                className="cst-label cst-lit-label"
                fill="var(--text)"
              >
                {highlight}
              </text>
            );
          })}

        {/* hub: the total, as a count only (no levels or ratings) */}
        <polygon points={HEX} fill="var(--surface)" stroke="var(--accent)" strokeOpacity={0.6} />
        <text
          x={CX}
          y={CY}
          textAnchor="middle"
          dominantBaseline="central"
          className="cst-hub"
          fill="var(--text)"
        >
          {TOTAL}
        </text>
      </svg>
    </div>
  );
}
