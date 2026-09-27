import { createContext, useContext, useId, type ReactNode } from "react";
import { projectDiagrams } from "@/content/site";

/**
 * Conceptual project illustrations: static SVG, no data, no behaviour. Each diagram has
 * a wide layout (≥ sm) and a tall one (mobile) so its labels stay ~13–14px on screen
 * instead of scaling down with the drawing. Both SVGs are decorative (`aria-hidden`);
 * the wrapper carries the text description.
 */

type Box = { x: number; y: number; w: number; h: number };

/** Each SVG owns its arrow marker; ids must be unique and must not point into a hidden SVG. */
const ArrowId = createContext("");

/** Machined depth: two offset plates behind the face. */
function Plates({ x, y, w, h, depth = 8 }: Box & { depth?: number }) {
  return (
    <>
      <rect
        x={x + depth * 2}
        y={y + depth * 2}
        width={w}
        height={h}
        rx={5}
        className="fill-bg stroke-line"
      />
      <rect
        x={x + depth}
        y={y + depth}
        width={w}
        height={h}
        rx={5}
        className="fill-surface stroke-control/60"
      />
    </>
  );
}

function Face({ x, y, w, h, dashed = false }: Box & { dashed?: boolean }) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={5}
      className={dashed ? "fill-none stroke-control" : "fill-surface-2 stroke-control"}
      strokeDasharray={dashed ? "5 4" : undefined}
    />
  );
}

/** Centred multi-line label. */
function Label({
  x,
  y,
  lines,
  size = 14,
  weight = 500,
  muted = false,
  mono = false,
  anchor = "middle",
}: {
  x: number;
  y: number;
  lines: readonly string[] | string;
  size?: number;
  weight?: number;
  muted?: boolean;
  mono?: boolean;
  anchor?: "start" | "middle" | "end";
}) {
  const ls = typeof lines === "string" ? [lines] : lines;
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={size}
      fontWeight={weight}
      className={`${muted ? "fill-muted" : "fill-text"} ${mono ? "font-mono" : ""}`}
    >
      {ls.map((l, i) => (
        <tspan key={l} x={x} dy={i === 0 ? 0 : size * 1.3}>
          {l}
        </tspan>
      ))}
    </text>
  );
}

function Flow({ d, blocked = false }: { d: string; blocked?: boolean }) {
  const arrow = useContext(ArrowId);
  return (
    <path
      d={d}
      fill="none"
      strokeWidth={1.5}
      className={blocked ? "stroke-muted" : "dg-flow stroke-accent"}
      strokeDasharray={blocked ? "4 4" : undefined}
      markerEnd={blocked ? undefined : `url(#${arrow})`}
    />
  );
}

/** Crossed circle: "not relied on". */
function Cross({ x, y }: { x: number; y: number }) {
  return (
    <g className="stroke-muted" strokeWidth={1.5}>
      <circle cx={x} cy={y} r={9} className="fill-surface" />
      <path d={`M${x - 4} ${y - 4} L${x + 4} ${y + 4} M${x + 4} ${y - 4} L${x - 4} ${y + 4}`} />
    </g>
  );
}

function Defs({ arrow }: { arrow: string }) {
  return (
    <defs>
      <marker
        id={arrow}
        viewBox="0 0 8 8"
        refX="7"
        refY="4"
        markerWidth="8"
        markerHeight="8"
        orient="auto"
      >
        <path d="M0 0 L8 4 L0 8 z" className="fill-accent" />
      </marker>
    </defs>
  );
}

function Svg({
  viewBox,
  className,
  children,
}: {
  viewBox: string;
  className: string;
  children: ReactNode;
}) {
  const arrow = `dg-arrow-${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox={viewBox} className={`h-auto w-full ${className}`} aria-hidden focusable="false">
      <Defs arrow={arrow} />
      <ArrowId.Provider value={arrow}>{children}</ArrowId.Provider>
    </svg>
  );
}

/* ---------- AigisAI: signals → local engine → flagged indicators -------- */

export function AigisDiagram() {
  const t = projectDiagrams["proj.aigisai"];
  const signalYs = [44, 92, 140, 188];
  const targetYs = [112, 130, 148, 166];

  return (
    <div role="img" aria-label={t.description}>
      {/* wide */}
      <Svg viewBox="0 0 600 240" className="hidden sm:block">
        <Label x={20} y={28} lines={t.signals} size={13} mono muted anchor="start" />
        {signalYs.map((y, i) => (
          <g key={y}>
            <Face x={20} y={y} w={132} h={34} />
            <rect x={32} y={y + 13} width={8} height={8} rx={1} className="fill-accent/70" />
            <Label x={94} y={y + 22} lines={t.signal} size={14} />
            <Flow d={`M152 ${y + 17} C196 ${y + 17} 192 ${targetYs[i]} 232 ${targetYs[i]}`} />
          </g>
        ))}

        <Plates x={236} y={78} w={150} h={120} />
        <Face x={236} y={78} w={150} h={120} />
        <Label x={311} y={122} lines={t.engine} size={15} weight={600} />
        <rect x={266} y={158} width={90} height={24} rx={12} className="fill-none stroke-accent" />
        <Label x={311} y={175} lines={t.zeroTrust} size={13} />

        <Flow d="M402 150 L446 150" />
        <Face x={452} y={124} w={132} h={52} />
        <Label x={518} y={145} lines={t.output} size={14} />

        <Flow d="M386 96 C420 96 420 50 452 50" blocked />
        <Cross x={421} y={73} />
        <Face x={452} y={24} w={132} h={52} dashed />
        <Label x={518} y={45} lines={t.cloud} size={13} muted />
        <Label x={518} y={96} lines={t.notUsed} size={13} mono muted />
      </Svg>

      {/* tall */}
      <Svg viewBox="0 0 340 460" className="sm:hidden">
        <Label x={16} y={22} lines={t.signals} size={13} mono muted anchor="start" />
        {[16, 96, 176, 256].map((x, i) => (
          <g key={x}>
            <Face x={x} y={34} w={70} h={34} />
            <Label x={x + 35} y={56} lines={t.signal} size={14} />
            <Flow d={`M${x + 35} 68 C${x + 35} 96 ${130 + i * 27} 92 ${130 + i * 27} 116`} />
          </g>
        ))}

        <Plates x={95} y={120} w={150} h={110} />
        <Face x={95} y={120} w={150} h={110} />
        <Label x={170} y={160} lines={t.engine} size={15} weight={600} />
        <rect x={125} y={194} width={90} height={24} rx={12} className="fill-none stroke-accent" />
        <Label x={170} y={211} lines={t.zeroTrust} size={13} />

        <Flow d="M170 248 L170 284" />
        <Face x={95} y={290} w={150} h={52} />
        <Label x={170} y={311} lines={t.output} size={14} />

        <Flow d="M95 175 L40 175 L40 392 L95 392" blocked />
        <Cross x={40} y={290} />
        <Face x={95} y={366} w={150} h={52} dashed />
        <Label x={170} y={387} lines={t.cloud} size={13} muted />
        <Label x={170} y={440} lines={t.notUsed} size={13} mono muted />
      </Svg>
    </div>
  );
}

/* ---------- SentinelTrace: lab endpoint → encrypted log + simulated C2 -- */

function Cylinder({ x, y, w, h }: Box) {
  const rx = w / 2;
  const ry = 9;
  const cx = x + rx;
  return (
    <g className="stroke-control">
      <path
        d={`M${x} ${y + ry} L${x} ${y + h - ry} A${rx} ${ry} 0 0 0 ${x + w} ${y + h - ry} L${x + w} ${y + ry}`}
        className="fill-surface-2"
      />
      <ellipse cx={cx} cy={y + ry} rx={rx} ry={ry} className="fill-surface" />
    </g>
  );
}

function LockPill({ x, y, w, label }: { x: number; y: number; w: number; label: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={24} rx={12} className="fill-none stroke-accent" />
      <rect x={x + 12} y={y + 11} width={9} height={7} rx={1} className="fill-accent" />
      <path
        d={`M${x + 13.5} ${y + 11} v-2.5 a3 3 0 0 1 6 0 v2.5`}
        fill="none"
        strokeWidth={1.4}
        className="stroke-accent"
      />
      <Label x={x + 28} y={y + 17} lines={label} size={13} anchor="start" />
    </g>
  );
}

export function SentinelDiagram() {
  const t = projectDiagrams["proj.sentineltrace"];

  return (
    <div role="img" aria-label={t.description}>
      {/* wide */}
      <Svg viewBox="0 0 600 272" className="hidden sm:block">
        <Label x={20} y={20} lines={t.lab} size={13} mono muted anchor="start" />
        <Label x={580} y={20} lines={t.authorised} size={13} mono muted anchor="end" />
        <rect
          x={10}
          y={30}
          width={580}
          height={236}
          rx={8}
          strokeDasharray="6 5"
          className="fill-none stroke-control"
        />

        <Plates x={36} y={60} w={210} h={156} />
        <Face x={36} y={60} w={210} h={156} />
        <Label x={141} y={86} lines={t.endpoint} size={14} weight={600} />
        <rect
          x={60}
          y={104}
          width={162}
          height={40}
          rx={4}
          className="fill-surface stroke-accent/70"
        />
        <Label x={141} y={129} lines={t.agent} size={14} />
        <LockPill x={70} y={164} w={142} label={t.encryption} />

        <Flow d="M222 124 C318 124 318 90 396 90" />
        <Face x={402} y={60} w={172} h={60} />
        <Label x={488} y={84} lines={t.c2[0]} size={14} weight={600} />
        <Label x={488} y={104} lines={t.c2[1]} size={13} muted />

        <Flow d="M262 206 L396 206" />
        <Cylinder x={402} y={166} w={172} h={78} />
        <Label x={488} y={206} lines={t.log} size={14} />
      </Svg>

      {/* tall */}
      <Svg viewBox="0 0 340 470" className="sm:hidden">
        <Label x={14} y={20} lines={t.lab} size={13} mono muted anchor="start" />
        <rect
          x={6}
          y={30}
          width={328}
          height={432}
          rx={8}
          strokeDasharray="6 5"
          className="fill-none stroke-control"
        />

        <Plates x={30} y={52} w={240} h={156} />
        <Face x={30} y={52} w={240} h={156} />
        <Label x={150} y={78} lines={t.endpoint} size={14} weight={600} />
        <rect
          x={54}
          y={94}
          width={192}
          height={40}
          rx={4}
          className="fill-surface stroke-accent/70"
        />
        <Label x={150} y={119} lines={t.agent} size={14} />
        <LockPill x={79} y={156} w={142} label={t.encryption} />

        <Flow d="M100 226 L94 290" />
        <Face x={20} y={296} w={148} h={62} />
        <Label x={94} y={322} lines={t.c2[0]} size={14} weight={600} />
        <Label x={94} y={342} lines={t.c2[1]} size={13} muted />

        <Flow d="M226 226 L250 290" />
        <Cylinder x={180} y={296} w={140} h={74} />
        <Label x={250} y={334} lines={t.log} size={14} />

        <Label x={170} y={444} lines={t.authorised} size={13} mono muted />
      </Svg>
    </div>
  );
}
