/**
 * Headline figures for the Overview. Each `caption` is a verbatim fragment of the
 * resume item named in `source`, and `value` is the figure that fragment states
 * (a spelled-out number may be shown as digits). See docs/resume-content-map.md.
 */

export interface Highlight {
  value: string;
  caption: string;
  source: string;
  /** Names what the figure belongs to when the caption alone would leave it ambiguous. */
  context?: string;
}

export const highlights: readonly Highlight[] = [
  {
    value: "4",
    caption: "compromised production environments",
    source: "summary.s2",
  },
  {
    value: "15+",
    caption: "production websites",
    source: "exp.brandskey.b09",
  },
  {
    value: "Top 8%",
    caption: "globally on TryHackMe",
    source: "ach.tryhackme",
  },
  {
    value: "95%",
    caption: "accuracy in flagging attack indicators",
    source: "proj.aigisai.b02",
    context: "AigisAI detection engine",
  },
];

/**
 * Scope of the BrandsKey incident work, shown above the incident sequence so the
 * prolonged primary compromise is not confused with the three additional sites.
 * Each `text` is a verbatim fragment of `source`.
 */
export const incidentScope = [
  { key: "overall", text: "four compromised production environments", source: "summary.s2" },
  {
    key: "primary",
    text: "a production WordPress environment compromised for approximately ten months",
    source: "exp.brandskey.b01",
  },
  {
    key: "additional",
    text: "three additional compromised WordPress sites",
    source: "exp.brandskey.b08",
  },
] as const;
