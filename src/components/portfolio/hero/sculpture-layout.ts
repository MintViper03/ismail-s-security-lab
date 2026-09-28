/**
 * Where the hero sculpture goes, measured from the real page rather than guessed.
 *
 * Obstacles are marked in the DOM: `data-sculpture-avoid="text"` (the text's own line
 * boxes), `"children"` (each child element's box) or `"box"` (the element's box), plus the
 * face and the torso inside the portrait (`img[data-face]`, `data-subject`: fractions of the
 * image). The sculpture box is an upright elliptical footprint (height = 1.6 × width) that
 * touches none of them, aligned to the portrait: centred on its inner edge (the seam with the
 * copy) at face height when the copy sits beside it, or set into its free corner with an even
 * inset when the page stacks. It is as large as that aligned slot allows, within a cap
 * relative to the portrait, and always inside the first viewport between the header and the
 * mobile dock. Everything here is in stage-local CSS pixels.
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

/**
 * Everything the sculpture must stay clear of, padded, in stage-local px. `copyGap` scales
 * the padding around the copy and controls only (not the face) for extra breathing room.
 */
export function scanStage(stage: HTMLElement, pad = 1, copyGap = 1): Scan {
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
    for (const r of rects) obstacles.push(inflate(r, (PAD[mode] ?? PAD.box) * pad * copyGap));
  });
  const anchor = stage.querySelector("[data-stage-anchor]");
  const photo = anchor ? toLocal(anchor.getBoundingClientRect(), o) : null;
  return { obstacles, face, subject, photo };
}

/**
 * The sculpture slot, aligned to the portrait (see the top of this file): the largest box
 * that fits near the aligned position. If even the smallest one does not fit there, the
 * largest free box nearest the portrait's inner edge instead.
 */
export function findSculptureBox(stage: HTMLElement): Box | null {
  const o = stage.getBoundingClientRect();
  const first = scanStage(stage);
  const photo = first.photo;
  // side by side: the portrait starts well into the stage, with the copy to its left
  const side = !!photo && photo.x > o.width * 0.25;
  // beside the copy, keep a wider margin from it so the two never look crowded
  const scan = side ? scanStage(stage, 1, 1.6) : first;
  const { face } = scan;
  const obstacles = scan.subject ? [...scan.obstacles, scan.subject] : scan.obstacles;
  const header = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
  const dock = document.querySelector("nav.mobile-dock");
  const floor =
    dock && dock.getClientRects().length ? dock.getBoundingClientRect().top : window.innerHeight;
  const top = Math.max(0, header - o.top) + 16;
  const bottom = Math.min(o.height, floor - o.top) - 16;
  if (bottom - top < 160) return null;

  // bounds: on screen; beside the copy, within the portrait's height; when the page stacks,
  // inside the portrait with an even inset
  const inset = photo ? Math.max(12, photo.w * 0.03) : 12;
  const inPhoto = !side && !!photo;
  const x0 = inPhoto ? photo.x + inset : 8;
  const x1 = inPhoto ? photo.x + photo.w - inset : o.width - 8;
  const y0 = inPhoto ? Math.max(top, photo.y + inset) : photo ? Math.max(top, photo.y) : top;
  const y1 = inPhoto ? Math.min(bottom, photo.y + photo.h - inset) : bottom;
  if (y1 - y0 < 160) return null;

  // the silhouette is roughly elliptical: test an ellipse (inflated so ring tips and
  // parts near its corners stay clear too) against each obstacle's nearest point
  const fits = (cx: number, cy: number, rx: number, ry: number) => {
    if (cx - rx < x0 || cx + rx > x1 || cy - ry < y0 || cy + ry > y1) return false;
    const ex = rx * ELLIPSE_INFLATE;
    const ey = ry * ELLIPSE_INFLATE;
    for (const r of obstacles) {
      const qx = Math.min(Math.max(cx, r.x), r.x + r.w);
      const qy = Math.min(Math.max(cy, r.y), r.y + r.h);
      if (((qx - cx) / ex) ** 2 + ((qy - cy) / ey) ** 2 < 1) return false;
    }
    return true;
  };

  // aligned position: beside the copy, centred on the seam at the face line (clamped into
  // the bounds); stacked, in the portrait's top corner away from the face
  const faceCx = face ? face.x + face.w / 2 : o.width / 2;
  const faceCy = face ? face.y + face.h / 2 : (y0 + y1) / 2;
  const freeRight = !!photo && faceCx < photo.x + photo.w / 2;
  // the fitting box of height 2·ry nearest the aligned position, and how far off it is
  // (in radii). `drift` is how far it may move onto the photo beside the copy.
  const aligned = (ry: number, drift: number) => {
    const rx = ry / SLOT.aspect;
    const ax = !photo ? o.width / 2 : side ? photo.x : freeRight ? x1 - rx : x0 + rx;
    const ay = side || !photo ? Math.min(Math.max(faceCy, y0 + ry), y1 - ry) : y0 + ry;
    const [dx0, dx1] = side ? [-0.15 * rx, drift * rx] : [-0.35 * rx, 0.35 * rx];
    // beside the copy it holds the face line closely (it shrinks rather than drifting up
    // against the header); in the stacked portrait's corner it may move more
    const wy = ry * (side ? 0.12 : 0.4);
    let best: { box: Box; d: number } | null = null;
    for (let j = Math.ceil(-wy / 4); j * 4 <= wy; j++)
      for (let i = Math.ceil(dx0 / 4); i * 4 <= dx1; i++) {
        const dx = i * 4;
        const dy = j * 4;
        if (!fits(ax + dx, ay + dy, rx, ry)) continue;
        const d = (dx / rx) ** 2 + (dy / ry) ** 2;
        if (!best || d < best.d) best = { box: { cx: ax + dx, cy: ay + dy, rx, ry }, d };
      }
    return best;
  };
  const cap = Math.min(photo ? photo.h * (side ? 0.34 : 0.42) : Infinity, (y1 - y0) / 2);
  const largest = (drift: number): Box | null => {
    let lo = 48;
    let hi = cap;
    if (lo > hi || !aligned(lo, drift)) return null;
    for (let i = 0; i < 10 && hi - lo > 2; i++) {
      const mid = (lo + hi) / 2;
      if (aligned(mid, drift)) lo = mid;
      else hi = mid;
    }
    // give up a little size (at most ~20 %) where that brings it closer to the alignment
    let best: Box | null = null;
    let bestScore = Infinity;
    for (let k = 0; k <= 7 && lo * (1 - 0.03 * k) >= 48; k++) {
      const ry = lo * (1 - 0.03 * k);
      const a = aligned(ry, drift);
      const score = a ? a.d + 0.5 * (1 - ry / lo) : Infinity;
      if (a && score < bestScore) {
        bestScore = score;
        best = a.box;
      }
    }
    return best;
  };
  let best = largest(0.3);
  // where the copy runs close to the seam, let it move onto the photo's free side instead
  // of shrinking to a token size
  if (side && photo && (!best || best.ry < photo.h * 0.25)) {
    const wider = largest(0.9);
    if (wider && (!best || wider.ry > best.ry * 1.15)) best = wider;
  }
  if (best) return best;

  // fallback: the largest free box anywhere in bounds, nearest the aligned position
  const step = 6;
  const centres = (ry: number) => {
    const rx = ry / SLOT.aspect;
    const list: [number, number][] = [];
    for (let cy = y0 + ry; cy <= y1 - ry; cy += step)
      for (let cx = x0 + rx; cx <= x1 - rx; cx += step) list.push([cx, cy]);
    return { rx, list };
  };
  const feasible = (ry: number) => {
    const { rx, list } = centres(ry);
    return list.some(([cx, cy]) => fits(cx, cy, rx, ry));
  };
  let lo = 48;
  let hi = (y1 - y0) * 0.46;
  if (!feasible(lo)) return null;
  for (let i = 0; i < 10 && hi - lo > 2; i++) {
    const mid = (lo + hi) / 2;
    if (feasible(mid)) lo = mid;
    else hi = mid;
  }
  const ry = lo;
  const { rx, list } = centres(ry);
  const prefX = photo ? (side ? photo.x : freeRight ? x1 : x0) : o.width / 2;
  let bestD = Infinity;
  for (const [cx, cy] of list) {
    if (!fits(cx, cy, rx, ry)) continue;
    const d = (cx - prefX) ** 2 + ((cy - faceCy) * 0.6) ** 2;
    if (d < bestD) {
      bestD = d;
      best = { cx, cy, rx, ry };
    }
  }
  return best;
}
