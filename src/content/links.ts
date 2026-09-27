/**
 * Project destinations supplied by Ismail on 2026-09-28 (they are not on the resume).
 * Verified the same day: each returns HTTP 200; both repositories are public and not
 * archived; the AigisAI repository's own homepage field is the demo URL below.
 */
export interface ProjectLink {
  kind: "demo" | "source";
  href: string;
}

export const projectLinks: Record<string, readonly ProjectLink[]> = {
  "proj.aigisai": [
    { kind: "demo", href: "https://aigis-ai-workspace.vercel.app/" },
    { kind: "source", href: "https://github.com/MintViper03/AigisAI_Workspace" },
  ],
  "proj.sentineltrace": [{ kind: "source", href: "https://github.com/MintViper03/SentinelTrace" }],
};
