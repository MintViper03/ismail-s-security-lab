# Visual acceptance pass — v2 redesign (2026-09-28)

Local production build (`npm run build` + `vite preview`), inspected in headless Chrome 153 through the DevTools protocol, with WebGL via SwiftShader (software). Screenshots are in `docs/review-screenshots/acceptance/` (the first screen and selected scroll stops at 390×844, 768×1024, 1366×768, 1440×900, 1920×1080, 320×640 and 853×480, all from the final build). Nothing was deployed.

## Outcomes

| Required outcome                                                    | Result                                                                                                                                                                                                                         |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Real photograph prominent in the opening composition                | **Pass.** Share of the visible first screen: 390: 45 %; 768: 61 %; 1366: 43 %; 1440: 49 %; 1920: 45 %; 320×640: 39 %; 853×480: 35 %.                                                                                                          |
| Face unobstructed, correctly proportioned                           | **Pass.** At 11 viewports from 2560×1440 to 320×640, the face region of the screenshot is compared with the source photo drawn at the same scale (object-fit cover, no distortion), and no element's box intersects the face (`faceverify`). At 390 and 320 the strict pixel threshold is exceeded slightly (mean 6.5 vs 6). Bisection shows no layer causes this: hiding each overlay changes nothing, while turning off the scroll-driven exit animation on the photo brings the diff down to 4.0. The residue is compositor resampling of the 640 px source, not something painted over the face. |
| Actual 3D geometry visible and well lit                             | **Pass.** WebGL sculpture live at every size: about 10.5 k triangles on desktop, 5.1 k in lite mode on touch devices. The sculpture's slot is 431×618 at 1366, 722×1036 at 1920 and 240×344 at 390.                          |
| First screen communicates name, role and actions                    | **Pass** at 390, 768, 1366, 1440 and 1920: the name, the role line and all three actions are fully visible and not covered, including by the mobile dock. At 320×640 and 853×480 (landscape phone) the name, role and primary action are visible, with the two other actions just below. |
| Distinct, coherent scroll transitions                               | **Pass.** The hero geometry separates, the summary rule lights, the experience path draws, the projects plane hand-off plays, the skills constellation assembles, then the quiet sections and the contact finale. Reverse scroll, deep links and resize all pass (`motionverify`). |
| Projects and skills interactions work                               | **Pass.** Project details and links; skills tabs (keyboard, click, touch, cluster click, hover and tap lights a point) (`skillsverify`, `interactverify`).                                                                       |
| Substantially different from the earlier dark-card layout           | **Pass** (see the screenshots): full-bleed portrait stage, WebGL sculpture, display type, a layered 3D project plane, the constellation and docks.                                                                              |
| Resume content exact and accessible                                 | **148/149 PDF atoms.** The one mismatch is the hero role line, "…Red Teamer" in commit 99ea769 where the PDF says "…Incident Response". This was left for Ismail to decide. All 7 skill categories and 54 skills, 39 experience atoms, projects, education, languages and certifications match. CEH/OSCP show "in preparation". |

## Fixed during this pass

1. **Phones:** the actions were below the new bottom dock at 390×844 (and the role line at 320×640). The stacked hero now uses a height-capped square portrait, a capped name size, and a shared row for the two secondary actions. The location line moved below the actions.
2. **Portrait tablets (768×1024):** the two-column hero shrank the photo to 341×379 (19 %). A new `split` breakpoint keeps two columns only from 1024 px or on landscape tablets; portrait tablets stack, giving a 714×592 photo (61 %).
3. **Variant precedence:** the new `split:` rules were emitted after `lg:`/`xl:` and overrode the desktop sizing. Desktop refinements now use `wide:`/`wider:` variants, declared after `split`.
4. **Floating explore pill overlaps:** the pill covered the skill-focus card at 1366 and 1920 and the hero text on phones. The trigger now lives in the navigation docks (rail and mobile dock), and the panel opens beside it.
5. **768 header:** the logo wrapped onto two lines. The header's Download action now shows from 1024 px (the hero keeps its own), and the logo no longer wraps.
6. **Phone constellation:** it sat small inside empty label margins. At phone widths the drawing now crops those margins and fills the width.
7. **Landscape phones and small tablets (853×480):** the face was cropped off the top of a 794×224 strip. The `split` variant was written as a comma-separated media query list, and Tailwind compiled only its first branch, so the landscape branch never existed in the CSS. It now uses the block form, with two `@media` slots. Result: a two-column 372×413 portrait with the face fully on screen. A new `short` variant (landscape, at most 36rem tall) also tightens the hero’s vertical gaps there, so the primary action clears the mobile dock (its bottom moved from 469 to 397, with the dock at 422).

8. **Hero sculpture placement and alignment** (follow-up request). The slot used to be "the largest free ellipse anywhere, then nearest the photo edge". Size won over alignment:
   - on desktop it pressed against the header and rode above the face line
   - on phones it ran off the right edge of the screen
   - on portrait tablets it was jammed into the photo corner

   Now the slot is aligned first and sized second (`hero/sculpture-layout.ts`):
   - **Beside the copy:** centred on the photo seam at the face line, within the photo's height, with a wider margin from the copy. Measured: seam and face-line offset 0–4 px at 1366, 1536, 1920, 2560 and 853×480; 12–28 px at 1280 and 1440, where the actions limit it.
   - **Stacked:** inside the photo's top corner away from the face, with even insets (21/21 px at 768, 12/12 px at 390 and 320), never off-screen.

   After the change, `sculptverify` passes at all 11 sizes, `fallbackverify` 5/5, and `faceverify` 9/11 strict. The 390 and 320 numbers are identical to before the change: the compositor residue above, with no overlaps or collisions. Content is unchanged: `pdfaudit` still gives 148/149 and `plinks` is OK.

## Performance and robustness (suite `acceptperf`, all pass)

- **Lazy 3D:** the name and portrait paint first (FCP/LCP 836 ms at 1440, the portrait image). The 3D chunk (144 kB gzip) is requested afterwards (890 ms), and the poster stands in meanwhile.
- **Resolution cap:** the pixel ratio is capped at 1.5 (2× desktop screen gives 1.5) and at 1.25 on touch (3× phone gives 1.25).
- **Constrained devices:** lite mode applies on touch or on devices reporting ≤ 4 cores or ≤ 4 GB. It uses about half the arc segments, a lower-poly band and pulses, and no clearcoat (10,562 → 5,104 triangles).
- **Pausing:** the render loop runs 0 frames off-screen and 0 frames with the tab hidden, and resumes afterwards.
- **Per-frame work:** no React state per frame. The idle DOM mutation rate is 4 per 3 s (verification stats, written only on change); scrolling causes 2–3 mutations per 30 steps.
- **Cleanup:** leaving Interactive unmounts the scene (0 rAF callbacks afterwards). Geometries, materials, the environment map and the renderer are disposed, and listeners are removed.
- **Static fallback:** posters are shown while loading, with no WebGL, after a context loss, with motion off, and in Reading mode (`fallbackverify`).

## Access and behaviour

- **Keyboard:** the whole page takes 51 Tab stops in reading order. Every stop is visible, has a focus ring, sits clear of the fixed header, and is never inside `aria-hidden` or `inert` content. Focus then wraps to the browser.
- **Touch:** the dock, the skill tabs, the constellation clusters and the tap light work; there is no magnetic drift on touch.
- **Reduced motion and the Motion toggle:** the OS setting or the toggle gives 0 running animations, the 3D poster and no parallax; all content stays visible.
- **Reading mode:** available from the header, rail, dock, skip link and palette. It shows every resume item, with no 3D and no motion. The default stays Interactive (fresh visit, OS reduced motion and no WebGL were all checked).
- **Downloads:** 4 links, one file, `application/pdf`, byte-identical to `D:\\Ismail_Murtaza_Resume.pdf` (MD5 `4b26b3d4d2952365fef98b3627e99dc3`).
- **Contact:** the email, phone, LinkedIn, GitHub and TryHackMe links are exact; external links open in a new tab with `noreferrer`. Contact is reachable at every scroll position.
- **Overflow and targets:** no horizontal overflow at 320–1920 px over a full scroll; no control under 44 px at 320.

## Suite results

The full suites ran on the build before fix 7. Fix 7 only changes CSS for landscape viewports 768–1023 px wide, so afterwards `faceverify` (853, 1024, 768, 390, 320), the default-mode check, the first-screen measurements, the screenshots and `tsc` were re-run on the final build.

| Suite            | Result                                                                                                                                                                                                                           |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `acceptperf`     | 11/11 pass                                                                                                                                                                                                                       |
| `interactverify` | 17/17 pass. The default-mode check failed once in a browser left with many stale tabs (3D not yet up in 3 s); it passed twice in a clean browser.                                                                              |
| `motionverify`   | all pass                                                                                                                                                                                                                         |
| `skillsverify`   | all pass                                                                                                                                                                                                                         |
| `sculptverify`   | 1920, 1366 and 390 pass (390 in lite mode, 5,104 triangles)                                                                                                                                                                      |
| `fallbackverify` | reduced motion, Reading, no WebGL, context lost and slow loading all pass                                                                                                                                                        |
| `faceverify`     | 9/11 strict pass. 853×480 was fixed in this pass (see 7). 390 and 320 have no occlusion, and the small residue is explained above. The 853 parallax "fail" was the probe pointer landing on the mobile dock; with the pointer inside the hero, `--px` = 0.83. |
| `pdfaudit`       | 148/149 at 1440 and 390 (the hero role line only)                                                                                                                                                                                |
| `plinks`         | project links correct in Interactive at 1440 and 390 and in Reading; 0 errors                                                                                                                                                    |
| TypeScript       | `tsc --noEmit` clean                                                                                                                                                                                                             |
| ESLint           | 0 rule errors apart from 6,174 `prettier/prettier` line-ending reports caused by `core.autocrlf` (CRLF), which Prettier will rewrite                                                                                            |

## Not verified here

- Real devices, including iOS Safari, Android Chrome and dynamic toolbars on hardware.
- Safari/WebKit and Firefox. Firefox has no scroll-driven animations without a flag, so it gets the static page plus the JavaScript-driven parts.
- Real-GPU frame rates. Headless SwiftShader runs at about 12–25 fps, so entrance timings are slower here.
- Lighthouse, and screen readers (NVDA, VoiceOver).

## Open for Ismail

- The hero role line: "Red Teamer" (commit 99ea769) or "Incident Response" (PDF).
- "Key Competencies" under the DCAP certificate: this text is not in the resume.
