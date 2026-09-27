/**
 * Where the hero sculpture goes, measured from the real page rather than guessed.
 *
 * Obstacles are marked in the DOM: `data-sculpture-avoid="text"` (the text's own line
 * boxes), `"children"` (each child element's box) or `"box"` (the element's box), plus the
 * face and the torso inside the portrait (`img[data-face]`, `data-subject`: fractions of the
 * image). The sculpture box is
 * the largest upright elliptical footprint (height = 1.6 × width) inside the first viewport
 * of the stage that touches none of them, placed as close as possible to the portrait's
 * free edge at face height. Everything here is in stage-local CSS pixels.
 */

export type Rect = { x: number; y: number; w: number; h: number };
export type Box = { cx: number; cy: number; rx: number; ry: number };

/** Sculpture proportions and the canvas margin around it (as multiples of rx / ry). */
// the canvas margin leaves room for the entrance, pointer tilt and perspective; the layer's
// edges fade out, and depth masks keep anything in the margin off the face, name and actions
export const SLOT = { aspect: 1.6, padX: 1.45, padY: 1.3 } as const;

const PAD = { text: 14, children: 12, box: 12, face: 18 } as const;
const ELLIPSE_INFLATE = 1.05;

export function canvasRect(b: Box): Rect {
  return {
    x: b.cx - b.rx * SLOT.padX,
    y: b.cy - b.ry * SLOT.padY,
    w: b.rx * SLOT.padX * 2,
    h: b.ry * SLOT.padY * 2,
  };
}

const inflate = (r: Rect, p: number): Rect => ({
  x: r.x - p,
  y: r.y - p,
  w: r.w + p * 2,
  h: r.h + p * 2,
});

function toLocal(r: DOMRect | DOMRectReadOnly, o: DOMRect): Rect {
  return { x: r.left - o.left, y: r.top - o.top, w: r.width, h: r.height };
}

/**
 * Line boxes of the text inside `el` (not the full width of its block children), merged so
 * each visual line is one rect however many text nodes it is made of.
 */
function textRects(el: Element, o: DOMRect): Rect[] {
  const lines: Rect[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent?.trim()) continue;
    range.selectNodeContents(n);
    for (const b of range.getClientRects()) {
      if (!b.width || !b.height) continue;
      const r = toLocal(b, o);
      const line = lines.find(
        (l) => Math.abs(l.y + l.h / 2 - (r.y + r.h / 2)) < Math.min(l.h, r.h) / 2,
      );
      if (!line) {
        lines.push(r);
        continue;
      }
      const x0 = Math.min(line.x, r.x);
      const y0 = Math.min(line.y, r.y);
      line.w = Math.max(line.x + line.w, r.x + r.w) - x0;
      line.h = Math.max(line.y + line.h, r.y + r.h) - y0;
      line.x = x0;
      line.y = y0;
    }
  }
  return lines;
}

/**
 * A box given as fractions of the image (`data-face`, `data-subject`), mapped through the
 * image's object-fit: cover geometry.
 */
export function imageBox(img: HTMLImageElement, o: DOMRect, attr: "face" | "subject"): Rect | null {
  const f = img.dataset[attr]?.split(" ").map(Number);
  if (!f || f.length !== 4 || !img.naturalWidth) return null;
  const b = img.getBoundingClientRect();
  const s = Math.max(b.width / img.naturalWidth, b.height / img.naturalHeight);
  const rw = img.naturalWidth * s;
  const rh = img.naturalHeight * s;
  const [px, py] = getComputedStyle(img)
    .objectPosition.split(" ")
    .map((v) => parseFloat(v) / 100);
  const ox = b.left + (b.width - rw) * (px || 0.5);
  const oy = b.top + (b.height - rh) * (py || 0.5);
  return {
    x: ox + f[0] * rw - o.left,
    y: oy + f[1] * rh - o.top,
    w: (f[2] - f[0]) * rw,
    h: (f[3] - f[1]) * rh,
  };
}

export type Scan = {
  obstacles: Rect[];
  face: Rect | null;
  subject: Rect | null;
  photo: Rect | null;
};

/** Everything the sculpture must stay clear of, padded, in stage-local px. */
export function scanStage(stage: HTMLElement, pad = 1): Scan {
  const o = stage.getBoundingClientRect();
  const obstacles: Rect[] = [];
  const img = stage.querySelector<HTMLImageElement>("img[data-face]");
  const f = img ? imageBox(img, o, "face") : null;
  const face = f ? inflate(f, PAD.face * pad) : null;
  // the torso below the face: placement keeps off it; it is not a mask (rings may pass in front)
  const subject = img ? imageBox(img, o, "subject") : null;
  // the face first: it is the one mask that must never be dropped
  if (face) obstacles.push(face);
  const visible = (el: Element) =>
    el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden";
  stage.querySelectorAll<HTMLElement>("[data-sculpture-avoid]").forEach((el) => {
    if (!visible(el)) return;
    const mode = el.dataset.sculptureAvoid as keyof typeof PAD;
    const rects =
      mode === "text"
        ? textRects(el, o)
        : mode === "children"
          ? [...el.children].filter(visible).map((c) => toLocal(c.getBoundingClientRect(), o))
          : [toLocal(el.getBoundingClientRect(), o)];
    for (const r of rects) obstacles.push(inflate(r, (PAD[mode] ?? PAD.box) * pad));
  });
  const anchor = stage.querySelector("[data-stage-anchor]");
  const photo = anchor ? toLocal(anchor.getBoundingClientRect(), o) : null;
  return { obstacles, face, subject, photo };
}

/** Largest free sculpture box in the stage's first viewport, nearest the portrait's free edge. */
export function findSculptureBox(stage: HTMLElement): Box | null {
  const o = stage.getBoundingClientRect();
  const scan = scanStage(stage);
  const { face, photo } = scan;
  const obstacles = scan.subject ? [...scan.obstacles, scan.subject] : scan.obstacles;
  const header = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
  const top = Math.max(0, header - o.top) + 12;
  const bottom = Math.min(o.height, window.innerHeight - o.top) - 12;
  if (bottom - top < 160) return null;
  const narrow = window.innerWidth < 768;
  const step = 6;

  // the silhouette is roughly elliptical: test an ellipse (inflated so ring tips and
  // parts near its corners stay clear too) against each obstacle's nearest point
  const fits = (cx: number, cy: number, rx: number, ry: number) => {
    const ex = rx * ELLIPSE_INFLATE;
    const ey = ry * ELLIPSE_INFLATE;
    for (const r of obstacles) {
      const qx = Math.min(Math.max(cx, r.x), r.x + r.w);
      const qy = Math.min(Math.max(cy, r.y), r.y + r.h);
      if (((qx - cx) / ex) ** 2 + ((qy - cy) / ey) ** 2 < 1) return false;
    }
    return true;
  };
  // on phones the sculpture may run a little past the screen edge beside the photo
  const centres = (ry: number) => {
    const rx = ry / SLOT.aspect;
    const over = narrow ? rx * 0.35 : 0;
    const list: [number, number][] = [];
    for (let cy = top + ry; cy <= bottom - ry; cy += step)
      for (let cx = rx - over; cx <= o.width + over - rx; cx += step) list.push([cx, cy]);
    return { rx, list };
  };
  const feasible = (ry: number) => {
    const { rx, list } = centres(ry);
    return list.some(([cx, cy]) => fits(cx, cy, rx, ry));
  };

  let lo = 56;
  let hi = (bottom - top) * 0.46;
  if (!feasible(lo)) return null;
  for (let i = 0; i < 10 && hi - lo > 2; i++) {
    const mid = (lo + hi) / 2;
    if (feasible(mid)) lo = mid;
    else hi = mid;
  }
  const ry = lo;
  const { rx, list } = centres(ry);
  // prefer the portrait's edge that faces the free space, at face height
  const faceCx = face ? face.x + face.w / 2 : o.width / 2;
  const prefX = photo ? (faceCx > o.width / 2 ? photo.x : photo.x + photo.w) : o.width / 2;
  const prefY = face ? face.y + face.h / 2 : (top + bottom) / 2;
  let best: Box | null = null;
  let bestD = Infinity;
  for (const [cx, cy] of list) {
    if (!fits(cx, cy, rx, ry)) continue;
    const d = (cx - prefX) ** 2 + ((cy - prefY) * 0.6) ** 2;
    if (d < bestD) {
      bestD = d;
      best = { cx, cy, rx, ry };
    }
  }
  return best;
}
