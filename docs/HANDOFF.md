# Handoff: final resume audit (Step 9)

Date: 2026-09-28 · Branch `content/resume-source-of-truth` · **Nothing committed, pushed, published or deployed.** Deployment settings were not touched.

## Run it locally

```sh
npm install
npm run build      # writes dist/ (already built and left in place)
npm run preview    # http://localhost:4173
```

Checked: `/` returns 200; `/resume/Ismail_Murtaza_Resume.pdf` returns 200 `application/pdf`; unknown paths return a real 404 page.

## Follow-up: project links (2026-09-28)

Added the three URLs you supplied, in `src/content/links.ts` (kept separate from the verbatim resume):

- AigisAI: Live demo `https://aigis-ai-workspace.vercel.app/` and Source on GitHub `https://github.com/MintViper03/AigisAI_Workspace`.
- SentinelTrace: Source on GitHub `https://github.com/MintViper03/SentinelTrace`.

Each was checked before adding: HTTP 200, both repositories public and not archived, and the AigisAI repository's own homepage field is the demo URL. They render as visible buttons on each project card (never behind hover or the disclosure). They open in a new tab with `rel=noreferrer`, have distinct names such as "AigisAI Live demo (opens in a new tab)", and are 44 px tall. Re-verified at 1440 and 390 px in both modes: 149/149 resume atoms, 0 broken or unsafe links, 0 overflow, 0 small targets, CLS 0.

## Change summary (this step)

- **Languages** now read exactly as the resume, "English (Professional)" and "Hindi (Native)". They were previously split into two cells, which was the only wording difference the PDF audit found.
- **Mobile hero skill tabs:** "Development" overflowed its tab at 390 px. The tabs now use tighter type below 640 px and stack below 360 px, and every tab fits at 320/360/390/640 px.
- **Contact rows:** Email and Phone show mail/phone icons instead of the "external link" arrow.
- **Layout-shift regression fixed:** the hero scene header now reserves room for the 44 px Pause button (CLS at 1024 px went from 0.058 to 0.0019).
- **Removed dead code:** ten files that nothing imports (`Hero3D`, `Hero3DCanvas`, `NetworkCanvas`, `ProfilePhoto` with its misleading "verified" caption, `ModeToggle`, `three/ThreeCanvas`, `lib/motion/*`) and the unused `public/photo.jpg`. The page now loads only the 10 KB crop, and the full AI-generated photo is no longer publicly downloadable. All of these are recoverable with `git checkout -- <path>`, and your earlier uncommitted `Hero3DCanvas`/`Portfolio` work is still in `stash@{0}`.
- **README** now describes the real stack and structure, the content sources and the review steps.
- **Review screenshots** are in `docs/review-screenshots/` (20 PNGs, desktop 1440 and mobile 390/320, Interactive and Reading mode, palette, menu, explore panel).

The earlier steps are summarised in `docs/implementation-plan.md` (Steps 1–8), and the measured QA results in `docs/qa-report.md`.

## Content coverage checklist

The rendered page (Reading mode) was compared against atoms parsed directly from **both PDF pages** (`pdftotext -layout`). Only whitespace and line-wrap hyphenation were normalised. Structured lines were compared item by item: `Label: a, b` → label + each item; `Org, Place | dates` → each part. The name is compared case-insensitively because the PDF sets it in capitals.

| Resume area              | Items checked                                                                                                                 | Result (1440 / 390 / 320 px) |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Name, role line, contact | 8 (name, "Penetration Tester \| Security Engineer \| Incident Response", location, phone, email, LinkedIn, GitHub, TryHackMe) | 8/8                          |
| Professional summary     | 4 sentences + "Availability" + the exact availability statement                                                               | 6/6                          |
| Technical skills         | 7 categories + 54 skills                                                                                                      | 61/61                        |
| Professional experience  | 4 role titles, employers/affiliation/locations, 4 date ranges, 18 bullets (incl. the freelance bullets on p.1 and p.2)        | 39/39                        |
| Security projects        | 2 full titles, 2 technology lists + 6 technologies, 2 years, 4 bullets                                                        | 16/16                        |
| Certifications           | 2 names + 2 full descriptions (incl. "in preparation.")                                                                       | 4/4                          |
| Achievements             | 3 complete statements                                                                                                         | 3/3                          |
| Education                | 2 qualifications, 2 institutions, locations, 2 date ranges                                                                    | 10/10                        |
| Languages                | English (Professional), Hindi (Native)                                                                                        | 2/2                          |
| **Total**                |                                                                                                                               | **149/149**                  |

Also checked:

- **Source module vs PDF text:** 24/24 blocks and 27/27 bullets verbatim.
- **Content-map strings rendered:** 144/144 at 1440 and 390 px.
- **Interactive mode:** everything not shown by default is reachable. Experience is 18/18 via the stage tabs and "Show full experience" (Enter and click); skills are 54/54 via the category tabs or mobile disclosures and "Show all skills"; both projects' bullets via "Project details".
- **Reading mode:** all 149 atoms, 54 skills, 18 experience bullets and 4 project bullets visible, and 0 toggles.

**Removed or absent:** a sweep of the SSR HTML and every file in `dist/` found no "3 sites/environments" total, no AES-256 or key length, no invented incident timestamps, `[REDACTED]`, CVE or case IDs, no severity ratings, none of the old unsupported skills (TypeScript, Post-Exploitation, Malware Analysis, WordPress Hardening, Hostinger, Marble…), no old tagline, footer claim, "uptime", "verified" or old LinkedIn slug, and no skill levels, percentages or years of expertise. The only percentages are the resume's "top 8%" and "95%" (the latter only inside its bullet and the hero figure labelled "AigisAI detection engine").

**CEH/OSCP** appear once, inside the dashed "in preparation" card, with no badge and no "Certified" label, in both modes. They are absent from the page head, metadata and JSON-LD. Only Defronix carries the "Certified" badge.

**Numbers keep their scope:** "four compromised production environments" (overall), "approximately ten months" (the compromise), and "three additional" (sites). No cleanup or monitoring duration is stated.

## Test results (this step, final build)

| Check                                                                  | Result                                                                                                                                                                                                                         |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npx tsc --noEmit`                                                     | pass                                                                                                                                                                                                                           |
| `npm run build`                                                        | pass                                                                                                                                                                                                                           |
| ESLint, app scope (`portfolio`, `routes`, `hooks`, `lib`, `content`)   | 140 problems, all in 4 untouched files (`use-mobile.tsx`, `lib/error-*`, `routes/index.tsx`), CRLF/Prettier formatting; every file changed in Steps 1–9 lints clean (was 2195)                                                 |
| PDF identity (MD5 of original, `public/`, `dist/`, served bytes)       | all `4b26b3d4d2952365fef98b3627e99dc3`, 203,746 bytes                                                                                                                                                                          |
| Links                                                                  | 23 in-page links, 0 broken; `mailto:`/`tel:` exact; 3 external links with `target=_blank`, `rel=noreferrer` and a screen-reader "opens in a new tab" note; 3 project links (supplied and verified); 0 `#`/empty hrefs; 0 forms |
| Metadata / JSON-LD                                                     | title, description, og and twitter taken from the resume; `twitter:card=summary`; no og:image, og:url or canonical (no confirmed domain or image); JSON-LD `Person` has only resume facts (no credentials)                     |
| Viewports 320, 390, 768, 1024, 1366×768, 1440, 1920, ~200% zoom        | no horizontal overflow; 0 targets under 44 px; contrast min 7.53:1, 0 failures; focus ring 59/59; one H1, no skipped levels, 0 unnamed controls; CLS ≤ 0.0019                                                                  |
| Navigation, disclosures, exploration, palette, menu (keyboard + touch) | all suites pass, including focus return under a slow network                                                                                                                                                                   |
| Fallbacks                                                              | JS disabled and broken `requestAnimationFrame`: 21/21 blocks visible; WebGL context loss swaps to the static SVG; `localStorage` blocked still works; reduced motion and Reading mode never fetch the 3D chunk                 |
| Secrets / private data in `dist/` and `public/`                        | no keys, tokens, private keys, `.env`, passwords, IPs or incident artefacts; only the public email and phone; no source maps shipped                                                                                           |

Engines: Chrome 153 headless (all scripted checks) and Firefox 156 headless (screenshots only).

## Unresolved / limitations

1. **Resume dates, kept as supplied.** The summary says "currently completing a BCA", but the education entry reads "August 2023 - July 2026" and today is 2026-09-28. Both are rendered verbatim. Update the PDF if you want them to agree, then mirror it in `src/content/resume.ts`.
2. **Project links:** resolved (see the follow-up below).
3. **Not tested:** real iOS/Safari/WebKit (the safe-area, `dvh` and toolbar handling is coded but unobserved), real Android devices and GPUs, Lighthouse/PageSpeed, screen readers (only DOM semantics were checked), Firefox interaction, production compression and caching, and real OS-level text zoom.
4. **Local path in the server bundle:** TanStack Start writes absolute source paths (`D:/New folder/...`) into `dist/server/.../_tanstack-start-manifest`. It is **not** sent to browsers (absent from the served HTML and all client files). Building in CI or another directory avoids it; build settings were left unchanged.
5. **Unused files and dependencies left in place:**
   - `public/logo.png` (1.5 MB) is untracked and unused but is copied into `dist/client`. Its only copy is in your working tree, so I did not delete it.
   - `favicon.ico` is 270 KB.
   - `gsap`, `@react-three/fiber` and `@react-three/drei` are no longer imported anywhere but remain in `package.json`. `npm uninstall gsap @react-three/fiber @react-three/drei` would remove them (this changes the lockfile).
6. The server-rendered HTML is about 113 KB uncompressed, because alternate layouts are pre-rendered to avoid layout shift.
7. The hero photo comes from the only portrait in the repository, git `public/photo.jpg` (1200×1798). That file carries an "AI-generated content" mark, and the crops end above it (`public/hero-portrait-{640,960,1200}.webp`, `hero-portrait-960.jpg`). For a sharper or unedited image, supply a higher-resolution original; a background-removed cut-out would also let the 3D frames pass behind the subject. See `docs/visual-redesign-v2.md` §9.
8. The hero 3D is the security-architecture sculpture (`src/components/portfolio/hero/sculpture-*.ts`, `Sculpture.tsx`). If you change the scene, regenerate the three posters in `public/hero-sculpture-*.webp`; the procedure is in `docs/visual-redesign-v2.md` §10.
