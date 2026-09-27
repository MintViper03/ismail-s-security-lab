/**
 * Where each resume item sits in the source PDF, for on-page source references.
 * Pages measured with `pdftotext -f N -l N` on the authority PDF (2026-09-28).
 */
import { experience } from "./resume";

const page: Record<string, 1 | 2> = {
  "summary.s1": 1,
  "summary.s2": 1,
  "summary.s3": 1,
  "summary.s4": 1,
  "exp.brandskey.b01": 1,
  "exp.brandskey.b02": 1,
  "exp.brandskey.b03": 1,
  "exp.brandskey.b04": 1,
  "exp.brandskey.b05": 1,
  "exp.brandskey.b06": 1,
  "exp.brandskey.b07": 1,
  "exp.brandskey.b08": 1,
  "exp.brandskey.b09": 1,
  "exp.brandskey.b10": 1,
  "exp.brandskey.b11": 1,
  "exp.syncasist.b01": 1,
  "exp.syncasist.b02": 2,
  "exp.syncasist.b03": 2,
  "exp.konstent.b01": 2,
  "exp.konstent.b02": 2,
  "exp.konstent.b03": 2,
  "exp.l33tl3g10n.b01": 2,
};

/** Human-readable reference, e.g. "Resume p.2, bullet 3" or "Resume p.1, summary". */
export function sourceRef(id: string): string {
  const p = page[id];
  if (id.startsWith("summary.")) return `Resume p.${p}, summary`;
  for (const role of experience) {
    const i = role.bullets.findIndex((b) => b.id === id);
    if (i >= 0) return `Resume p.${p}, bullet ${i + 1}`;
  }
  return `Resume p.${p}`;
}

/** Reference for consecutive bullets of one role on one page, e.g. "Resume p.1, bullets 1–7". */
export function sourceRange(ids: readonly string[]): string {
  const first = sourceRef(ids[0]);
  if (ids.length === 1) return first;
  const last = sourceRef(ids[ids.length - 1]).replace(/^.*bullet /, "");
  return first.replace("bullet ", "bullets ") + `–${last}`;
}
