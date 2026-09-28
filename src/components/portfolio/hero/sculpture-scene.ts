import {
  ACESFilmicToneMapping,
  AmbientLight,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  DynamicDrawUsage,
  EdgesGeometry,
  Euler,
  ExtrudeGeometry,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  Object3D,
  OctahedronGeometry,
  PerspectiveCamera,
  PMREMGenerator,
  PointLight,
  Quaternion,
  Scene,
  Shape,
  SphereGeometry,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { SLOT } from "./sculpture-layout";

/**
 * The hero "security architecture" sculpture (docs/visual-redesign-v2.md §10).
 *
 * One bounded object: a faceted metallic core, three segmented orbital structures, five
 * suspended glass/emissive components and fine connecting paths with travelling pulses.
 * Graphite and silver metal lit by a procedural room environment (no downloads), a key
 * light, a restrained ultraviolet rim and a light at the core.
 *
 * The canvas is sized to the sculpture's slot beside the portrait (see sculpture-layout.ts).
 * Normalised units: the sculpture fits |y| ≤ 1, |x| ≤ 0.625; the canvas shows ±SLOT.padY in y.
 * Depth-only geometry keeps it honest with the page: near-plane masks over the face, name
 * and actions (nothing can ever draw there), and a plane at the photograph so rings pass
 * behind the portrait on its face side.
 *
 * Focus 0/1/2 (Offensive Security / Incident Response / Development) changes the
 * arrangement, the lighting and the view (rig orientation and zoom), eased over ~1 s.
 */

export type Rect = { x: number; y: number; w: number; h: number };

export const FRAME = { fov: 28, halfHeight: SLOT.padY } as const;
const CAM_Z = FRAME.halfHeight / Math.tan(((FRAME.fov / 2) * Math.PI) / 180);
const TAN = Math.tan(((FRAME.fov / 2) * Math.PI) / 180);

const CYAN = new Color("#22e1ff");
const UV = new Color("#a78bfa");
const SILVER = new Color("#c3ccd6");
const WHITE = new Color("#ffffff");

type V3 = readonly [number, number, number];
type Pose = { p: V3; r: V3; s: number };
type Arrangement = {
  rings: readonly [Pose, Pose, Pose];
  parts: readonly [V3, V3, V3, V3, V3];
  view: { yaw: number; pitch: number; zoom: number };
  light: { key: Color; keyI: number; rimI: number; core: Color; coreI: number };
};

const ARRANGEMENTS: readonly [Arrangement, Arrangement, Arrangement] = [
  // Offensive Security: offset orbits probing outward, parts spread wide, cyan key
  {
    rings: [
      { p: [0.05, 0.14, -0.05], r: [0.35, 1.1, 0.5], s: 1 },
      { p: [-0.06, -0.12, 0.04], r: [-0.5, -1.0, -0.25], s: 1 },
      { p: [0.02, 0.04, 0.12], r: [1.25, 0.35, 0.9], s: 1 },
    ],
    parts: [
      [0.42, 0.66, 0.3],
      [-0.44, -0.6, 0.22],
      [0.48, -0.3, 0.4],
      [-0.4, 0.44, 0.46],
      [0.14, -0.88, 0.3],
    ],
    view: { yaw: -0.3, pitch: 0.06, zoom: 0.88 },
    light: { key: CYAN, keyI: 2.6, rimI: 0.9, core: CYAN, coreI: 5 },
  },
  // Incident Response: a closed containment gimbal, parts drawn in, ultraviolet rises
  {
    rings: [
      { p: [0, 0, 0], r: [0, 1.25, 0], s: 0.92 },
      { p: [0, 0, 0], r: [0, -1.25, 0], s: 0.98 },
      { p: [0, 0, 0], r: [1.35, 0, 0], s: 1.05 },
    ],
    parts: [
      [0.26, 0.42, 0.42],
      [-0.28, -0.38, 0.38],
      [0.3, -0.16, 0.46],
      [-0.26, 0.2, 0.48],
      [0.02, -0.58, 0.42],
    ],
    view: { yaw: 0.14, pitch: 0.24, zoom: 0.94 },
    light: { key: CYAN, keyI: 1.3, rimI: 3.4, core: UV, coreI: 5 },
  },
  // Development: orbits settle into stacked layers, parts line up beside them, neutral key
  {
    rings: [
      { p: [0, 0.64, 0], r: [1.3, 0, 0.08], s: 0.6 },
      { p: [0, 0.02, 0], r: [1.32, 0, -0.06], s: 0.78 },
      { p: [0, -0.62, 0], r: [1.28, 0, 0.1], s: 1.0 },
    ],
    parts: [
      [0.5, 0.8, 0.18],
      [0.5, 0.4, 0.2],
      [0.52, 0.0, 0.22],
      [0.5, -0.4, 0.2],
      [0.5, -0.8, 0.18],
    ],
    view: { yaw: 0.42, pitch: -0.1, zoom: 0.9 },
    light: { key: WHITE, keyI: 2.3, rimI: 0.7, core: CYAN, coreI: 3 },
  },
];

type RingSpec = {
  radius: number;
  width: number;
  depth: number;
  segments: number;
  gap: number;
  lit: readonly number[];
  litColor: Color;
  spin: number;
};
const RINGS: readonly RingSpec[] = [
  {
    radius: 0.92,
    width: 0.085,
    depth: 0.05,
    segments: 9,
    gap: 0.11,
    lit: [0, 5],
    litColor: CYAN,
    spin: 0.07,
  },
  {
    radius: 0.74,
    width: 0.12,
    depth: 0.075,
    segments: 6,
    gap: 0.17,
    lit: [2],
    litColor: UV,
    spin: -0.05,
  },
  {
    radius: 0.56,
    width: 0.065,
    depth: 0.11,
    segments: 12,
    gap: 0.09,
    lit: [1, 7],
    litColor: CYAN,
    spin: 0.09,
  },
];

/** One machined arc: an annular sector, extruded with a small bevel, centred on z. */
function sector(r: number, w: number, depth: number, a0: number, a1: number, detail = 16) {
  const ro = r + w / 2;
  const ri = r - w / 2;
  const s = new Shape();
  s.moveTo(Math.cos(a0) * ro, Math.sin(a0) * ro);
  s.absarc(0, 0, ro, a0, a1, false);
  s.lineTo(Math.cos(a1) * ri, Math.sin(a1) * ri);
  s.absarc(0, 0, ri, a1, a0, true);
  s.closePath();
  const g = new ExtrudeGeometry(s, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.006,
    bevelSegments: 1,
    curveSegments: Math.max(3, Math.round((a1 - a0) * detail)),
  });
  g.translate(0, 0, -depth / 2);
  return g;
}

const ease = (x: number) => 1 - Math.pow(1 - Math.min(Math.max(x, 0), 1), 3);
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

export interface SculptureHandle {
  setFocus(focus: number): void;
  setPaused(paused: boolean): void;
  setOnScreen(onScreen: boolean): void;
  /** Canvas-pixel rects: `masks` are never drawn over; `photo` hides what passes behind it. */
  setOcclusion(masks: readonly Rect[], photo: Rect | null): void;
  /** Redraw one frame if the loop is idle (scroll while paused). */
  nudge(): void;
  dispose(): void;
}

export function createSculptureScene(
  canvas: HTMLCanvasElement,
  opts: {
    focus: number;
    paused: boolean;
    /** 0 at the top of the stage, 1 once it has scrolled out. */
    getProgress?: () => number;
    /** Poster mode: fixed size, assembled, one frame, readable pixels, no listeners. */
    poster?: { width: number; height: number };
    onReady?: () => void;
    onContextLost?: () => void;
    /** Rendering stats for verification (written to data-* on the canvas). */
    debug?: boolean;
  },
): SculptureHandle {
  const poster = opts.poster;
  const coarse = !poster && window.matchMedia("(pointer: coarse)").matches;
  // constrained devices (touch-first, or ≤ 4 cores / ≤ 4 GB reported): the same object with
  // lighter geometry (about half the arc segments, lower-poly band and pulses) and no
  // clearcoat pass; the pixel ratio is already capped lower on touch devices
  const hw = navigator as Navigator & { deviceMemory?: number };
  const lite =
    !poster && (coarse || (hw.hardwareConcurrency ?? 8) <= 4 || (hw.deviceMemory ?? 8) <= 4);
  const fine = !poster && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: !!poster,
    powerPreference: coarse ? "low-power" : "high-performance",
  });
  renderer.setPixelRatio(poster ? 1 : Math.min(window.devicePixelRatio || 1, coarse ? 1.25 : 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envRT = pmrem.fromScene(room, 0.04);
  room.dispose();
  scene.environment = envRT.texture;
  scene.environmentIntensity = 0.55;

  const camera = new PerspectiveCamera(FRAME.fov, 1, 0.05, 40);
  camera.position.set(0, 0, CAM_Z);
  camera.lookAt(0, 0, 0);

  // ---- light
  scene.add(new AmbientLight(0xffffff, 0.08));
  const key = new DirectionalLight(CYAN, 2.6);
  key.position.set(4, 2.5, 5);
  const rim = new DirectionalLight(UV, 0.9);
  rim.position.set(-5, 1.5, -4);
  const fill = new DirectionalLight(0xffffff, 0.3);
  fill.position.set(-3, 4, 5);
  scene.add(key, rim, fill);

  // ---- resources, tracked for disposal
  const geos: BufferGeometry[] = [];
  const mats: Material[] = [];
  const g = <T extends BufferGeometry>(x: T) => (geos.push(x), x);
  const m = <T extends Material>(x: T) => (mats.push(x), x);

  const rig = new Group(); // view: mode yaw/pitch/zoom + idle + pointer + scroll
  scene.add(rig);

  // ---- core: faceted metal, cyan seams, an illuminated band, a light in front of it
  const coreGeo = g(new IcosahedronGeometry(0.3, 1));
  const coreMat = m(
    new MeshPhysicalMaterial({
      color: SILVER,
      metalness: 1,
      roughness: 0.24,
      clearcoat: lite ? 0 : 0.6,
      clearcoatRoughness: 0.2,
      flatShading: true,
    }),
  );
  const coreEntrance = new Group();
  const core = new Mesh(coreGeo, coreMat);
  core.scale.set(1, 1.18, 1);
  const seamMat = m(new LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.32 }));
  const seams = new LineSegments(g(new EdgesGeometry(coreGeo, 1)), seamMat);
  seams.scale.setScalar(1.004);
  core.add(seams);
  const bandMat = m(new MeshBasicMaterial({ color: CYAN }));
  const band = new Mesh(g(new TorusGeometry(0.335, 0.008, lite ? 5 : 8, lite ? 48 : 96)), bandMat);
  band.rotation.set(1.2, 0.25, 0);
  coreEntrance.add(core, band);
  rig.add(coreEntrance);
  const coreLight = new PointLight(CYAN, 5, 3, 2);
  coreLight.position.set(0.1, 0.15, 0.7);
  rig.add(coreLight);

  // ---- three segmented orbital structures
  const ringMetal = m(
    new MeshPhysicalMaterial({
      color: new Color("#6d7885"),
      metalness: 0.92,
      roughness: 0.3,
      clearcoat: lite ? 0 : 0.4,
      clearcoatRoughness: 0.3,
    }),
  );
  type Ring = {
    entrance: Group;
    pose: Group;
    spin: Group;
    spec: RingSpec;
    litMat: MeshBasicMaterial;
  };
  const rings: Ring[] = RINGS.map((spec) => {
    const step = (Math.PI * 2) / spec.segments;
    const plain: BufferGeometry[] = [];
    const lit: BufferGeometry[] = [];
    for (let i = 0; i < spec.segments; i++) {
      const sg = sector(
        spec.radius,
        spec.width,
        spec.depth,
        i * step + spec.gap / 2,
        (i + 1) * step - spec.gap / 2,
        lite ? 8 : 16,
      );
      (spec.lit.includes(i) ? lit : plain).push(sg);
    }
    const entrance = new Group();
    const pose = new Group();
    const spin = new Group();
    const plainGeo = g(mergeGeometries(plain, false)!);
    plain.forEach((x) => x.dispose());
    spin.add(new Mesh(plainGeo, ringMetal));
    const litMat = m(new MeshBasicMaterial({ color: spec.litColor }));
    if (lit.length) {
      const litGeo = g(mergeGeometries(lit, false)!);
      lit.forEach((x) => x.dispose());
      spin.add(new Mesh(litGeo, litMat));
    }
    pose.add(spin);
    entrance.add(pose);
    rig.add(entrance);
    return { entrance, pose, spin, spec, litMat };
  });

  // ---- suspended components: two glass pieces, two emissive nodes, one ultraviolet shard
  const glass = () =>
    m(
      new MeshPhysicalMaterial({
        color: new Color("#d8f6ff"),
        metalness: 0,
        roughness: 0.04,
        clearcoat: 1,
        transparent: true,
        opacity: 0.36,
        depthWrite: false,
        side: DoubleSide,
        envMapIntensity: 1.6,
      }),
    );
  const edgeMat = m(new LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.95 }));
  const partGeos: BufferGeometry[] = [
    g(new CylinderGeometry(0.075, 0.075, 0.28, 3)),
    g(new BoxGeometry(0.17, 0.24, 0.022)),
    g(new BoxGeometry(0.055, 0.055, 0.055)),
    g(new BoxGeometry(0.042, 0.042, 0.042)),
    g(new OctahedronGeometry(0.055, 0)),
  ];
  const partMats: Material[] = [
    glass(),
    glass(),
    m(new MeshBasicMaterial({ color: CYAN })),
    m(new MeshBasicMaterial({ color: CYAN })),
    m(new MeshBasicMaterial({ color: UV })),
  ];
  const parts = partGeos.map((geo, i) => {
    const node = new Group();
    const mesh = new Mesh(geo, partMats[i]);
    if (i < 2) {
      mesh.renderOrder = 1;
      node.add(new LineSegments(g(new EdgesGeometry(geo, 20)), edgeMat));
    }
    if (i === 4) mesh.scale.set(1, 2.3, 1);
    node.add(mesh);
    rig.add(node);
    return node;
  });

  // ---- connecting paths (core → parts as elbows, core → a gap on each ring) + pulses
  const PATHS = parts.length * 2 + rings.length;
  const pathPos = new BufferAttribute(new Float32Array(PATHS * 2 * 3), 3);
  pathPos.setUsage(DynamicDrawUsage);
  const pathGeo = g(new BufferGeometry());
  pathGeo.setAttribute("position", pathPos);
  const pathMat = m(new LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.38 }));
  rig.add(new LineSegments(pathGeo, pathMat));
  const pulseGeo = g(new SphereGeometry(0.018, lite ? 5 : 8, lite ? 5 : 8));
  const pulseMat = m(new MeshBasicMaterial({ color: CYAN }));
  const pulses = parts.map(() => {
    const p = new Mesh(pulseGeo, pulseMat);
    rig.add(p);
    return p;
  });

  // ---- occlusion: depth-only geometry (never visible, only blocks what lies behind it)
  const occluderMat = m(new MeshBasicMaterial({ colorWrite: false, side: DoubleSide }));
  const MAX_MASKS = 64;
  const maskPos = new BufferAttribute(new Float32Array(MAX_MASKS * 6 * 3), 3);
  maskPos.setUsage(DynamicDrawUsage);
  const maskGeo = g(new BufferGeometry());
  maskGeo.setAttribute("position", maskPos);
  maskGeo.setDrawRange(0, 0);
  const masks = new Mesh(maskGeo, occluderMat);
  masks.renderOrder = -2;
  masks.frustumCulled = false;
  scene.add(masks);
  const photoPos = new BufferAttribute(new Float32Array(6 * 3), 3);
  photoPos.setUsage(DynamicDrawUsage);
  const photoGeo = g(new BufferGeometry());
  photoGeo.setAttribute("position", photoPos);
  photoGeo.setDrawRange(0, 0);
  const photoPlane = new Mesh(photoGeo, occluderMat);
  photoPlane.renderOrder = -1;
  photoPlane.frustumCulled = false;
  scene.add(photoPlane);
  let maskRects: readonly Rect[] = [];
  let photoRect: Rect | null = null;

  /** Writes a canvas-pixel rect as a quad at `dist` in front of the camera. */
  const writeQuad = (arr: Float32Array, o: number, r: Rect, dist: number) => {
    const w = canvasW || 1;
    const h = canvasH || 1;
    const hh = dist * TAN;
    const hw = hh * (w / h);
    const x0 = (r.x / w) * 2 * hw - hw;
    const x1 = ((r.x + r.w) / w) * 2 * hw - hw;
    const y0 = hh - (r.y / h) * 2 * hh;
    const y1 = hh - ((r.y + r.h) / h) * 2 * hh;
    const z = CAM_Z - dist;
    arr.set([x0, y0, z, x1, y0, z, x1, y1, z, x0, y0, z, x1, y1, z, x0, y1, z], o);
  };
  const applyOcclusion = () => {
    const list = maskRects.slice(0, MAX_MASKS);
    list.forEach((r, i) => writeQuad(maskPos.array as Float32Array, i * 18, r, 0.3));
    maskPos.needsUpdate = true;
    maskGeo.setDrawRange(0, list.length * 6);
    if (photoRect) {
      writeQuad(photoPos.array as Float32Array, 0, photoRect, CAM_Z + 0.08);
      photoPos.needsUpdate = true;
      photoGeo.setDrawRange(0, 6);
    } else photoGeo.setDrawRange(0, 0);
  };

  // ---- state
  let focus = Math.min(Math.max(opts.focus, 0), 2);
  let paused = opts.paused;
  let onScreen = true;
  let pageVisible = document.visibilityState === "visible";
  let disposed = false;
  let ready = false;
  let raf = 0;
  let last = 0;
  let t = 0; // idle clock
  let entranceT = poster ? 99 : 0; // seconds since the entrance began
  let frames = 0;
  let canvasW = poster?.width ?? 0;
  let canvasH = poster?.height ?? 0;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

  // eased per-mode values
  const cur = {
    yaw: ARRANGEMENTS[focus].view.yaw,
    pitch: ARRANGEMENTS[focus].view.pitch,
    zoom: ARRANGEMENTS[focus].view.zoom,
    keyI: ARRANGEMENTS[focus].light.keyI,
    rimI: ARRANGEMENTS[focus].light.rimI,
    coreI: ARRANGEMENTS[focus].light.coreI,
  };
  const keyColor = ARRANGEMENTS[focus].light.key.clone();
  const coreColor = ARRANGEMENTS[focus].light.core.clone();
  const tmpQ = new Quaternion();
  const tmpE = new Euler();
  const tmpV = new Vector3();
  const tmpW = new Vector3();

  const setPose = (o: Object3D, pose: Pose, k: number) => {
    tmpV.set(...pose.p);
    o.position.lerp(tmpV, k);
    tmpQ.setFromEuler(tmpE.set(...pose.r));
    o.quaternion.slerp(tmpQ, k);
    const s = o.scale.x + (pose.s - o.scale.x) * k;
    o.scale.setScalar(s);
  };
  // start in the target arrangement (the entrance separates from there)
  const arr0 = ARRANGEMENTS[focus];
  rings.forEach((r, i) => setPose(r.pose, arr0.rings[i], 1));
  parts.forEach((p, i) => p.position.set(...arr0.parts[i]));

  // entrance: where each component starts, relative to its assembled place
  const ringFrom = [
    { p: [0.22, 0.16, -0.35], r: [0.45, -0.6, 0.3] },
    { p: [-0.2, -0.16, -0.3], r: [-0.5, 0.55, -0.25] },
    { p: [0.05, -0.22, 0.25], r: [0.6, 0.35, 0.45] },
  ] as const;

  const updatePaths = () => {
    const a = pathPos.array as Float32Array;
    let o = 0;
    const put = (x: Vector3) => {
      a[o++] = x.x;
      a[o++] = x.y;
      a[o++] = x.z;
    };
    parts.forEach((p, i) => {
      const end = p.position;
      const start = tmpV.copy(end).normalize().multiplyScalar(0.33);
      const elbow = tmpW.set(end.x, start.y, end.z);
      put(start);
      put(elbow);
      put(elbow);
      put(end);
      // pulse travels start → elbow → end
      const ph = (t * 0.22 + i * 0.21) % 1;
      const pulse = pulses[i].position;
      if (ph < 0.5) pulse.lerpVectors(start, elbow, ph * 2);
      else pulse.lerpVectors(elbow, end, (ph - 0.5) * 2);
    });
    rig.updateMatrixWorld(true);
    rings.forEach((r) => {
      // a spoke from the core to the gap after segment 0 of each ring
      const ang = (Math.PI * 2) / r.spec.segments;
      tmpW.set(Math.cos(ang) * r.spec.radius, Math.sin(ang) * r.spec.radius, 0);
      r.spin.localToWorld(tmpW);
      rig.worldToLocal(tmpW);
      tmpV.copy(tmpW).normalize().multiplyScalar(0.34);
      put(tmpV);
      put(tmpW);
    });
    pathPos.needsUpdate = true;
  };

  const update = (dt: number, snap: boolean) => {
    t += dt;
    entranceT += dt;
    const arr = ARRANGEMENTS[focus];
    const k = snap ? 1 : 1 - Math.exp(-dt * 3.2);
    // scroll: 0 at the top of the stage, 1 once it has scrolled out. As the hero leaves,
    // the sculpture comes apart again (reverses when scrolling back up).
    const p = poster ? 0 : Math.min(Math.max(opts.getProgress?.() ?? 0, 0), 1);
    const sep = smooth(0.04, 0.55, p);

    // arrangement
    rings.forEach((r, i) => {
      setPose(r.pose, arr.rings[i], k);
      r.spin.rotation.z = t * r.spec.spin;
    });
    parts.forEach((p, i) => {
      tmpV.set(...arr.parts[i]).multiplyScalar(1 + 0.5 * sep);
      tmpV.y += Math.sin(t * 0.6 + i * 1.7) * 0.022;
      p.position.lerp(tmpV, k);
      p.rotation.set(t * 0.25 + i, t * 0.35 + i * 2, 0);
    });
    core.rotation.y = t * 0.12;
    core.rotation.x = Math.sin(t * 0.2) * 0.1;

    // entrance: separated → assembled (staggered)
    const e = (delay: number) => ease((entranceT - delay) / 1.5);
    const ec = e(0);
    coreEntrance.scale.setScalar(0.7 + 0.3 * ec);
    coreEntrance.rotation.y = (1 - ec) * -1.2;
    rings.forEach((r, i) => {
      const ei = e(0.12 + i * 0.12);
      const f = ringFrom[i];
      // apart during the entrance, together at rest, apart again as the hero scrolls out
      const a = Math.max(1 - ei, sep * 1.4);
      r.entrance.position.set(f.p[0] * a, f.p[1] * a, f.p[2] * a);
      r.entrance.rotation.set(f.r[0] * a, f.r[1] * a, f.r[2] * a);
      r.entrance.scale.setScalar(0.86 + 0.14 * ei);
    });
    parts.forEach((p, i) => p.scale.setScalar(0.3 + 0.7 * e(0.5 + i * 0.08)));

    // view: mode emphasis + slow idle + pointer + scroll
    pointer.x += (pointer.tx - pointer.x) * k;
    pointer.y += (pointer.ty - pointer.y) * k;
    cur.yaw += (arr.view.yaw - cur.yaw) * k;
    cur.pitch += (arr.view.pitch - cur.pitch) * k;
    cur.zoom += (arr.view.zoom - cur.zoom) * k;
    rig.rotation.set(
      cur.pitch + Math.sin(t * 0.09) * 0.03 + pointer.y * 0.12,
      cur.yaw + Math.sin(t * 0.12) * 0.06 + pointer.x * 0.22 + p * 0.5,
      0,
    );
    rig.scale.setScalar(cur.zoom);

    // lighting
    keyColor.lerp(arr.light.key, k);
    coreColor.lerp(arr.light.core, k);
    key.color.copy(keyColor);
    cur.keyI += (arr.light.keyI - cur.keyI) * k;
    cur.rimI += (arr.light.rimI - cur.rimI) * k;
    cur.coreI += (arr.light.coreI - cur.coreI) * k;
    key.intensity = cur.keyI;
    rim.intensity = cur.rimI;
    coreLight.color.copy(coreColor);
    coreLight.intensity = cur.coreI * (0.92 + Math.sin(t * 1.1) * 0.08);
    bandMat.color.copy(coreColor);
    seamMat.color.copy(coreColor);
    rings.forEach((r, i) => {
      // the ring that matches the focus burns brighter
      const on = i === focus ? 1 : 0.45;
      r.litMat.color.copy(r.spec.litColor).multiplyScalar(on);
    });

    updatePaths();
  };

  const draw = () => {
    if (disposed) return;
    renderer.render(scene, camera);
    frames++;
    // verification stats: each attribute is written only when its value changes (the frame
    // counter every 20 frames), so a running scene causes ~1 DOM write per 20 frames
    if (opts.debug && (frames < 3 || frames % 20 === 0 || canvas.dataset.focus !== String(focus))) {
      const stats: Record<string, string> = {
        triangles: String(renderer.info.render.triangles),
        calls: String(renderer.info.render.calls),
        entrance: entranceT >= 2.1 ? "assembled" : "assembling",
        focus: String(focus),
        lite: String(lite),
        frames: String(frames),
        loop: `paused=${paused} onScreen=${onScreen} visible=${pageVisible}`,
      };
      for (const [k, v] of Object.entries(stats))
        if (canvas.dataset[k] !== v) canvas.dataset[k] = v;
    }
    if (!ready) {
      ready = true;
      opts.onReady?.();
    }
  };

  const running = () => !poster && !paused && onScreen && pageVisible && !disposed;
  const loop = (now: number) => {
    const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 0;
    last = now;
    update(dt, false);
    draw();
    raf = running() ? requestAnimationFrame(loop) : 0;
  };
  const schedule = () => {
    if (disposed) return;
    if (running()) {
      if (!raf) {
        last = 0;
        raf = requestAnimationFrame(loop);
      }
    } else {
      cancelAnimationFrame(raf);
      raf = 0;
      update(0, true);
      draw();
    }
  };

  const resize = () => {
    if (poster) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    canvasW = w;
    canvasH = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    applyOcclusion();
    if (!raf) {
      update(0, true);
      draw();
    }
  };

  const cleanups: (() => void)[] = [];
  if (poster) {
    renderer.setSize(poster.width, poster.height, false);
    camera.aspect = poster.width / poster.height;
    camera.updateProjectionMatrix();
  } else {
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    cleanups.push(() => ro.disconnect());
    if (fine) {
      const onPointer = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
      };
      window.addEventListener("pointermove", onPointer, { passive: true });
      cleanups.push(() => window.removeEventListener("pointermove", onPointer));
    }
    const onVisibility = () => {
      pageVisible = document.visibilityState === "visible";
      schedule();
    };
    document.addEventListener("visibilitychange", onVisibility);
    cleanups.push(() => document.removeEventListener("visibilitychange", onVisibility));
    const onLost = (e: Event) => {
      e.preventDefault();
      if (disposed) return;
      cancelAnimationFrame(raf);
      raf = 0;
      opts.onContextLost?.();
    };
    canvas.addEventListener("webglcontextlost", onLost);
    cleanups.push(() => canvas.removeEventListener("webglcontextlost", onLost));
    resize();
  }

  update(0, true);
  if (poster) draw();
  else schedule();

  return {
    setFocus(next) {
      const f = Math.min(Math.max(next, 0), 2);
      if (f === focus) return;
      focus = f;
      schedule();
    },
    setPaused(next) {
      paused = next;
      schedule();
    },
    setOnScreen(next) {
      onScreen = next;
      schedule();
    },
    setOcclusion(nextMasks, nextPhoto) {
      maskRects = nextMasks;
      photoRect = nextPhoto;
      applyOcclusion();
      if (!raf && !disposed) draw();
    },
    nudge() {
      if (!raf && !disposed) {
        update(0, true);
        draw();
      }
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      cleanups.forEach((f) => f());
      geos.forEach((x) => x.dispose());
      mats.forEach((x) => x.dispose());
      envRT.dispose();
      pmrem.dispose();
      renderer.dispose();
      // release the GPU context now, unless it is already gone (context-loss path)
      if (!renderer.getContext().isContextLost()) renderer.forceContextLoss();
    },
  };
}

/**
 * Renders the assembled sculpture in one arrangement to a transparent WebP data URL.
 * Used to produce the static posters in public/ (loading, failure, reduced motion,
 * Reading mode), so the fallback is the same object from the same camera.
 */
export function renderSculpturePoster(focus: number, width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const h = createSculptureScene(canvas, { focus, paused: true, poster: { width, height } });
  const url = canvas.toDataURL("image/webp", 0.9);
  h.dispose();
  return url;
}
