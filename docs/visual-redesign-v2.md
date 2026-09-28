# Visual redesign v2 — "The Security Architect"

Status: direction + foundation implemented (2026-09-27). Supersedes the restrained "precision workstation" look of Steps 2–9. Content rules are unchanged: every professional fact still comes verbatim from `src/content/resume.ts`, and all links, contact details, the resume download, Reading mode, the palette and the explore panel keep working.

## 1. Why the portrait and 3D looked missing or weak (measured on the pre-v2 build)

Headless Chrome 153, production build, fresh storage unless noted.

| Condition                                     | Portrait on screen | 3D canvas                                           |
| --------------------------------------------- | ------------------ | --------------------------------------------------- |
| 2560×1440 (this machine's primary screen)     | 70×70 px (0.13 %)  | 570×428 px box (6.6 % of screen)                    |
| 1920×1080                                     | 70×70 px (0.24 %)  | 570×428 px (11.8 %)                                 |
| 1366×768                                      | 70×70 px (0.47 %)  | 570×428 px (23.2 %)                                 |
| 1280×720 laptop at 150 % scaling (853 CSS px) | 70×70 px           | **none**, below the 1024 px gate                    |
| Phone 390 px                                  | 62×62 px           | **none**, mobile gate                               |
| Stored display preference "reading"           | 70×70 px           | **none**                                            |
| OS "reduce motion" on                         | 70×70 px           | **none**, and the site silently switched to Reading |

Root causes, all confirmed in code:

1. **Portrait by design was an avatar.** Step 3 made it a 64–72 px "identity detail" (`photo-avatar.jpg`, a 216 px crop). Step 9 deleted the full `public/photo.jpg`, so no large source was even served.
2. **The 3D was a small, fixed-size panel.** It was confined to a 4:3 box in a 6/12 column inside a 1280 px container. Its size did not grow with the screen, and the object filled about 38 % of that box (about 2.5 % of a 2560 px screen).
3. **Four conditional gates removed it entirely:** `min-width: 64rem` (every phone and every zoomed or high-scaling laptop), Reading mode, OS reduced motion (which also defaulted the whole site to Reading), and WebGL availability.
4. **The lighting was deliberately flat.** Graphite frames on a graphite panel, a neutral key light, mint only on the selected edge, fog, no environment reflections, and a 700 ms cross-fade after lazy load.
5. **Not causes** (checked): asset paths (all resolve), clipping or stacking (the canvas fills its box at z 0; nothing covers it), canvas sizing bugs (ResizeObserver kept it matched). This machine has Windows "Show animations" **on**, so reduced motion is not what hid it here.

## 2. Direction

An immersive digital workspace built around the person. The opening viewport is a **lit stage**:

- **The portrait is the subject,** large and in natural colour, standing in the right half of the stage. A cyan key light rakes one edge and an ultraviolet backlight sits behind it.
- **Real 3D architecture** fills the stage behind and around the subject: nested machined frames, a luminous core, and three orbiting domain modules (Offensive Security, Incident Response, Development) that react to the skill-focus controls.
- **Type is architectural:** a very large name set in two lines, with small precise metadata.
- **Scrolling changes the composition,** not just the opacity. The stage camera pulls back and turns as the hero leaves; each section arrives on its own plane with a wipe and depth, not a uniform fade.
- **Contrast comes from light, scale and placement.** There are no glowing borders around everything: surfaces are matte graphite, and light is reserved for the subject, the core, the active state and the primary action.

### Palette (measured WCAG contrast)

| Token         | Value     | Role                                   | Contrast                      |
| ------------- | --------- | -------------------------------------- | ----------------------------- |
| `--bg`        | `#090C11` | deep graphite stage                    | —                             |
| `--surface`   | `#10151C` | raised planes                          | —                             |
| `--surface-2` | `#171E27` | cards, active tabs                     | —                             |
| `--text`      | `#EEF2F6` | silver-white                           | 17.4 on bg, 14.9 on surface-2 |
| `--muted`     | `#A6B1BE` | secondary text                         | 9.0 / 8.4 / 7.7               |
| `--accent`    | `#22E1FF` | electric cyan: key light, primary      | 12.4 on bg; ink on cyan 12.0  |
| `--uv`        | `#A78BFA` | selective ultraviolet: backlight, tags | 7.2 on bg, 6.7 on surface     |
| `--control`   | `#6C7888` | control borders                        | ≥ 3.7 (non-text ≥ 3:1)        |

Rules: cyan is the single action colour. Ultraviolet is only lighting and rare secondary tags, never a text colour for body copy. There is no duotone on the photo: the face keeps its natural colour (see earlier feedback), and only the edges receive light and a fall-off.

### Type

Inter throughout, with JetBrains Mono for metadata. A new `text-hero` size (`clamp(3.5rem, 1rem + 8vw, 10.5rem)`, tight tracking, weight 700) is used only for the name. Section titles move up to `text-h1` (`clamp(2.5rem, 1.2rem + 3.6vw, 5rem)`) with a large outlined index numeral behind them.

## 3. Composition

> The hero was later rebuilt around the photograph; §9 supersedes the desktop and mobile hero details below.

**Desktop ≥ 1024 px, stage (min-height 100svh, full-bleed):**

- The canvas fills the whole stage. The scene reads the portrait's real layout box (`[data-stage-anchor]`) and builds a portal of frames around it: the core sits behind the portrait's left third and the frames reach out past its faded edge toward the name. A left-side fall-off keeps the architecture from competing with the text.
- Left 6/12: kicker (index · location), the name in two lines, the exact role line, the three CTAs and the availability.
- Right 6/12: the portrait, a 4:5 crop up to `min(86svh, 58rem)` tall, bottom-anchored like a subject on a stage. A skill-focus HUD card overlaps its lower-left corner (foreground layer), so depth reads as 3D scene → portrait → HUD. The scene caption and pause control sit in a small pill at the stage's bottom-right.
- Summary and figures follow directly below on a separate plane.

**Tablet 768–1023 px:** the same two columns (name left, portrait right, vertically centred so short laptop screens such as 1280×720 at 150 % still show both); the HUD moves below them in flow.

**Mobile < 768 px:** the portrait comes first, full-bleed and 4:5 with the 3D portal behind it (the layer fades out below the portrait). The name overlaps the portrait's lower edge, then the kicker, role, CTAs, availability, and the HUD in normal flow. The caption pill sits at the portrait's top-right. 3D is **on** here (pixel ratio ≤ 1.25 on touch).

## 4. 3D scene spec (`hero/architect-scene.ts`)

- **One canvas** with vanilla three.js named imports, lazy-loaded; the static SVG drawing is the immediate fallback.
- **Geometry:** three nested extruded frames (existing geometry), an octahedron core with an icosahedral wire shell, and three domain modules on a tilted orbit (Offensive: tetrahedron shard; Incident Response: ring; Development: layered slabs). Modules and frames have crisp edge lines, over a perspective floor grid that fades into the dark.
- **Materials and light:** physical silver-graphite metal lit by a procedural room environment (no texture downloads), a cyan key, an ultraviolet rim/back light, and a cyan point light in the core. ACES tone mapping. No post-processing.
- **Behaviour:** a slow idle drift; the focus control raises the matching module and frame; mouse-only pointer parallax (written to closure variables, never React state); scroll progress through the stage pulls the camera back and rotates the assembly.
- **Budget:** pixel ratio ≤ 1.5 (≤ 1.25 on touch devices), antialiasing only below the cap, about 30 draw calls per frame. The loop runs only while the stage is on screen, the tab is visible and the scene isn't paused. Context loss falls back to SVG, and everything is disposed on unmount.
- **Gates (v2):** the scene renders at **all widths** whenever WebGL exists and Reading mode is off. With OS **reduced motion** it renders a _single still frame_ (real 3D, no motion, no bundle-heavy animation loop). Reading mode shows the static drawing.

## 5. Motion system

- **Stage exit** (CSS scroll-driven, `animation-timeline: view()`): the portrait scales down slightly and drifts, the text lifts, and the lighting dims as the hero leaves. The camera pull-back in WebGL complements it.
- **Section arrival:** the index numeral slides in, the title wipes in (`clip-path`), and content planes rise with a small `rotateX` from depth. Each is scroll-driven, so the motion follows the reader's own scroll and never plays on its own.
- **Controls:** buttons have a press state (`scale 0.97`), a light sweep on hover (mouse devices only) and a cyan focus ring. The rail indicator glides between sections.
- **Off switches:** Reading mode and `prefers-reduced-motion` remove every animation and transition. Content is visible by default: no animation ever hides it.

## 6. Guardrails kept

The following stay as they were: verbatim resume content (149/149 atoms), one H1, 44 px targets, visible focus, no layout shift from late UI (reserved space), no content locked behind interaction, no fake telemetry, no key lengths, CEH/OSCP "in preparation", the exact links, and the original PDF.

## 7. This step vs. later

- **Implemented now (foundation):**
  - the new tokens and type scale
  - the full-bleed hero stage with the prominent portrait, the 3D scene v2 at all widths, lighting layers and the foreground HUD
  - v2 gating (no mobile gate; reduced motion shows a still frame; the stored preference key is versioned)
  - cinematic section chrome and scroll transitions, and the button and nav interaction states
  - the portrait assets (from the original photo in git, cropped to exclude the "AI-generated" watermark)
- **Later:** per-section re-layouts beyond the chrome (Experience, Projects, Skills, Credentials, Contact compositions), portrait swap to a real photo, and optional 3D hand-off between sections.

## 8. Verified after implementation (production build, headless Chrome 153)

| Viewport / condition        | Portrait on screen            | 3D                                | Page overflow | CLS    |
| --------------------------- | ----------------------------- | --------------------------------- | ------------- | ------ |
| 2560×1440                   | 740×925 px (19 %)             | full-stage canvas, animating      | 0             | —      |
| 1920×1080                   | 740×925 px (33 % of viewport) | full-stage canvas, animating      | 0             | 0.0004 |
| 1366×768                    | 528×660 px (33 %)             | full-stage canvas, animating      | 0             | 0.0011 |
| 853×480 (1280×720 at 150 %) | 330×413 px, beside the name   | canvas, animating                 | 0             | 0.0038 |
| 390×844                     | 390×488 px (58 %)             | canvas behind the portrait        | 0             | 0      |
| 320×640                     | 320×400 px (63 %)             | canvas behind the portrait        | 0             | 0      |
| OS reduced motion           | unchanged                     | still frame; no loop, no pause UI | 0             | —      |
| Reading mode                | unchanged, top-aligned        | static SVG drawing (no WebGL)     | 0             | —      |

Also re-checked:

- the PDF content audit in Reading mode: 149/149 atoms at 1440 px
- the project links: exact hrefs, new tab with `noreferrer`, and 44 px targets at 1440 and 390 px interactive and at 1440 px reading
- no console errors

While verifying, one older issue surfaced and was fixed: the `.reveal` scroll range (`entry 90%`) kept tall cards partly faded until they almost reached the top of the viewport. `.reveal` and `.plane-rise` now settle after a fixed 25–30vh of scroll.

Not verified: real devices, Safari/iOS, Firefox rendering of the new stage, Lighthouse, screen readers.

Costs: the lazy 3D chunk is 574 kB (146 kB gzip), up from the Step 9 scene because of the physical materials and the procedural room environment. It is still fetched only after hydration, in Interactive mode, when WebGL exists. The unused `public/photo-avatar.jpg` was removed.

## 9. Hero rebuilt around the photograph (2026-09-27)

### Source asset

- **Searched:** the working tree, all git history (`git log --all`) and `stash@{0}`.
- **Only portrait found:** `public/photo.jpg` (1200×1798, one version, commit `a8dbb8f`). Step 9 deleted it from the working tree; it is recoverable from git.
- **No transparent cutout exists.** `public/logo.png` is an "IM" monogram, not a portrait.
- **Crop:** the full source width at 9:10 (1200×1333 from y = 390), ending at y = 1723, above the photo's "AI-generated content" mark (about y = 1745). No person was generated or substituted, and no pixels were altered except resizing.
- **Files:** `public/hero-portrait-{640,960,1200}.webp` and `hero-portrait-960.jpg` (fallback). The earlier `portrait-*` crops were removed.
- **Resolution ceiling:** the source is only 1200 px wide, so above about 1200 CSS px of photo width (or at 2× density) the image is upscaled. A higher-resolution original would sharpen it.

### Composition

**Desktop:**

- The grid's photo column is `min(0.9 × (stage height − header − 1.5rem), 56 % / 62 % of the grid)`. At common laptop and desktop sizes the photo spans the full stage height beside the name.
- The name is sized to its column (`min(10.5rem, 19.5cqi)`), with the exact role line, the three actions, and the availability.
- The full summary starts directly below the stage.

**Layers**, back to front:

1. stage light and the 3D portal (centred just inside the photo's left edge, so the frames emerge between the name and the photo)
2. an ultraviolet backlight spill, a graphite plane offset down-left, a drafting outline offset up-right, and a cyan key spill on the right
3. the photograph (chamfered top-right corner, hairline cyan edge light, inner hairline, and an edge-only grade: floor fade, top 11 %, left 14 %, right 10 %)
4. front accents at the edges only: a corner bracket, a tick scale, and a lit shard below the face line
5. the controls

**Skill-focus HUD:** from 1280 px it is a foreground card inside the photo column, over the photo's lower-left corner and below the face. Up to 1279 px it sits below the name and photo, with the caption/pause pill beside it. From 1280 px the pill sits at the foot of the name column.

**Mobile:** the photo comes first (4:5, 90–92 % of the width), with the name overlapping its faded lower edge. Then come the kicker, the role, the actions stacked full-width (44 px), the availability, the HUD and the pill.

**Pointer depth** (`useStageParallax` + `.depth`):

- Mouse on hover-capable fine pointers only; never touch, reduced motion or Reading mode.
- Eased values are written to CSS variables, with no React state per frame.
- Layers move up to 28 px (back plane), 20 px (outline), 14 and 10 px (light spills), and −10 to −24 px (front accents). The photograph moves 4 px.
- The name, actions, HUD and pause control are never inside a parallax layer.

### Verified (production build, headless Chrome 153, script `faceverify`)

For each viewport the script:

- **Asset:** fetches every srcset URL (all 200 `image/*`) and confirms the decoded file.
- **Face on screen:** computes the face box from the object-fit geometry and checks it lies fully on screen, below the header.
- **Face uncovered:** compares a screenshot of the face region against the source photo drawn at the same scale. Mean pixel difference is 0.7–4.8 on a 0–255 scale, and the worst 8×8 block is ≤ 17, where a covering layer would light up a whole block. The residue is resampling along edges such as the sunglasses rims (difference images checked).
- **Overlaps:** checks that no front layer, HUD, pill or text box intersects the face, and that the name, role, three actions, availability, HUD, pill and face don't collide with each other.
- **Controls:** confirms each control is hit at its centre and is ≥ 44 px tall.

| Viewport                         | Photo (CSS px)              | Share of hero area\*                  | Result |
| -------------------------------- | --------------------------- | ------------------------------------- | ------ |
| 2560×1440                        | 1217×1352                   | 48 %                                  | pass   |
| 1920×1080                        | 893×992                     | 47 %                                  | pass   |
| 1440×900                         | 731×812                     | 52 %                                  | pass   |
| 1366×768                         | 612×680                     | 46 %                                  | pass   |
| 1280×720                         | 569×632                     | 45 %                                  | pass   |
| 1024×768                         | 495×551                     | 38 % (stage taller than the viewport) | pass   |
| 853×480                          | 372×413                     | beside the name                       | pass   |
| 768×1024                         | 341×379                     | beside the name                       | pass   |
| 390×844 / 360 / 320              | 355×443 / 326×408 / 288×360 | first screen, 52 % at 390             | pass   |
| reduced motion (1920, 1366, 390) | same                        | —                                     | pass   |
| Reading mode (1920, 1366, 390)   | same                        | —                                     | pass   |

\* Photo area ÷ stage area visible below the header and beside the rail.

Also verified:

- **Parallax on a fine pointer** (mouse at a corner): the back plane moved 24 px while the photo moved 3.4 px at 1920. `--px` stays unset under touch emulation.
- **Content:** PDF audit 149/149 in Reading mode at 1440 and 390 px; project links intact.
- **Layout shift:** CLS ≤ 0.0004 (1920, 1366, 853, 390, 320).
- **Errors:** no console errors.
- **Not verified:** real devices, Safari/iOS, Firefox, screen readers.

## 10. The 3D security-architecture sculpture (2026-09-27)

Replaces the §4 frames portal, which mostly hid behind the photo, and its SVG fallback (`architect-scene.ts`, `CoreFallback.tsx`, `core-geometry.ts`, `SecurityCore*.tsx` removed).

### What it is

- **Tooling:** vanilla three.js 0.185, already a dependency, with named imports plus the bundled `RoomEnvironment` and `mergeGeometries` helpers. No new dependency. React Three Fiber stays unused.
- **Renderer:** one WebGL canvas, lazy-loaded (`SculptureCanvas`, 149 kB gzip), on a bounded scene of 26 draw calls and about 10.5 k triangles.
- **Geometry** (`hero/sculpture-scene.ts`):
  - a faceted metallic core (icosahedron with flat shading, silver physical metal) with cyan seams and an illuminated band
  - three segmented orbital structures, each made of bevelled machined arcs with lit segments (cyan, with one violet)
  - five suspended components: two glass pieces with lit edges, two cyan emissive nodes and one violet shard
  - fine elbow paths from the core to each component and each ring, with travelling pulses
- **Light:** a procedural room environment (no downloads), a key light, a restrained violet rim, a light at the core, and ACES tone mapping.
- **Motion:**
  - an entrance from slightly separated, rotated and scaled components into the assembly (staggered, about 1.5 s)
  - slow idle: ring spin, a core turn, a gentle bob and pulses
  - fine-pointer orientation, up to about 0.22 rad
  - a slight turn as the hero scrolls out
- **The three HTML controls** (the existing Skill focus tabs: Offensive Security, Incident Response, Development) each set an arrangement, lighting and view, eased over about 1 s:

  | Tab                | Arrangement                                 | Light                         | View                      |
  | ------------------ | ------------------------------------------- | ----------------------------- | ------------------------- |
  | Offensive Security | offset probing orbits, parts spread         | cyan key                      | turned left               |
  | Incident Response  | a closed containment gimbal, parts drawn in | violet rim rises, violet core | from above, closer        |
  | Development        | stacked layers, parts in a column           | neutral white key             | turned right, pulled back |

- **Pause:** the Pause control stops the loop. The loop also stops off-screen and in hidden tabs.

### Placement: beside and around the portrait, never over the face, name or actions

**Slot search** (`hero/sculpture-layout.ts`):

- The layout measures the real page: the name, role, kicker, actions and availability line boxes, the HUD, the caption pill, and the face and torso boxes (`data-face` / `data-subject` fractions of the photo).
- It places an upright elliptical footprint (1.6 : 1) that avoids them all, aligned to the portrait, between the header and the mobile dock:
  - **Copy beside the photo** (from 1024 px, or landscape from 768 px): centred on the photo's inner edge (the seam with the copy) at the face line, within the photo's height. It keeps 1.6× the usual margin from the copy, with a size cap of 34 % of the photo's height. It gives up at most about 20 % of its size to stay on the alignment. It moves further onto the photo only when the copy runs close to the seam (1024×768).
  - **Stacked** (phones, portrait tablets): inside the photo, in the top corner away from the face, with an even inset (max(12 px, 3 % of the photo's width)). It never runs past the screen edge.
  - If the aligned slot cannot fit even the smallest size, it falls back to the largest free footprint nearest that position.
- Measured offsets after the change:
  - Seam and face line: 0–4 px at 1366, 1536, 1920, 2560 and 853×480; 12–28 px at 1280 and 1440, where the buttons limit it.
  - Stacked insets: 21/21 px at 768 and 12/12 px at 390 and 320.
- The search runs again on resize, after fonts load and when the photo decodes.
- The canvas is sized to that slot plus a faded margin.

**Hard guarantees**, drawn inside the renderer:

- Depth-only near-plane masks over the face, the name, role, kicker, actions, availability, HUD and pill, so geometry cannot draw there.
- A depth-only plane at the photograph, on its face side, so rings pass behind the portrait.
- The masks refresh on scroll, resize and each re-measure.

### Static representation

`public/hero-sculpture-{offensive,response,development}.webp` (816×1171, 34–47 kB) are rendered from the same scene and camera by `renderSculpturePoster`. They are shown:

- while the 3D loads
- when WebGL is unavailable, fails or loses its context
- under reduced motion, where the 3D code is never downloaded and the tabs swap posters
- in Reading mode

To regenerate after changing the scene: run `npx vite dev`, open the site, and in the console run `const m = await import("/src/components/portfolio/hero/sculpture-scene.ts"); m.renderSculpturePoster(0, 816, 1171)` (use 1 and 2 for the other arrangements). Save each data URL over the matching file.

### Verified (production build, headless Chrome 153 with SwiftShader software WebGL)

**Rendering** (script `sculptverify`, 11 viewports from 2560×1440 to 320×640, all pass):

- The first frame arrived 1.6–4.1 s after navigation.
- Geometry pixels were counted by comparing screenshots with the 3D layer on and off.
- Zero geometry pixels were found inside the face, name, role, action or availability boxes.
- Each tab click set the scene's focus and the tab's `aria-selected`, and changed 9 k–230 k pixels.
- Moving the pointer changed the orientation (desktop).
- Pause stopped frames (0 new frames).
- No console errors or warnings.

| Viewport  | Sculpture extent on screen | Share of the visible hero |
| --------- | -------------------------- | ------------------------- |
| 2560×1440 | 543×938                    | 14.5 %                    |
| 1920×1080 | 420×727                    | 15.7 %                    |
| 1440×900  | 282×485                    | 11.4 %                    |
| 1366×768  | 254×439                    | 11.6 %                    |
| 1280×720  | 221×379                    | 10.0 %                    |
| 1024×768  | 203×352                    | 9.9 %                     |
| 853×480   | 146×250                    | 10.3 %                    |
| 768×1024  | 163×281                    | 6.2 %                     |
| 390×844   | 134×246                    | 10.8 %                    |
| 360×740   | 126×232                    | 12.0 %                    |
| 320×640   | 107×197                    | 11.4 %                    |

**Fallbacks** (script `fallbackverify`, all pass, console clean):

- **Reduced motion:** poster, no canvas, 3D code never requested, the tabs swap posters.
- **Reading mode:** poster.
- **WebGL disabled:** poster.
- **Context lost while running:** the canvas is removed and the poster returns.
- **3D chunk held back 4 s:** the poster shows, then the live scene takes over.

**Unchanged:** the portrait checks (face pixels untouched), 149/149 PDF atoms in Reading mode, the project links, and CLS ≤ 0.0011.

**Bugs found and fixed while verifying:**

- **Face mask dropped:** the mask list was capped at 24 entries, so on busy layouts the face mask fell off the end. The face now goes first, text is merged per line, and the cap is 64.
- **Loop stayed off after load:** visibility was observed while the layer was still `display:none`, so the loop sometimes never started. Observation now starts after placement.
- **Stale masks after the photo decoded:** the masks now refresh on every re-measure.

**Not verified:**

- **Frame rate:** headless software GL runs at about 12 fps at 1920, so the entrance takes longer there. No real GPU, real phone, Safari or Firefox was available.
- **Other checks:** no Lighthouse or screen-reader pass.

## 11. The page motion sequence (2026-09-28)

This replaces the uniform treatment, where every section had the same title wipe and every block the same fade-up (`.reveal`, `.plane-rise`), with one connected sequence. Each section gets a motif (`SectionShell motif`):

| Transition            | What happens                                                                                                                                                                                                                                                                                                                                                                                 | Driven by                                                       |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Hero → summary        | The planes, spills and drafting accents around the photo drift apart (`.geo-sep`, individual `translate`, so pointer depth still composes). The 3D sculpture comes apart again, the name column lifts and dims, and the portrait only recedes (scale 0.965, no fade). A light draws along the summary's rule and the summary rises.                                                          | stage view timeline; sculpture scroll progress                  |
| Summary → experience  | A thin illuminated path draws down from the section's top edge (continuing the summary rule's line) into the role timeline, whose lit part follows reading progress. Each role's node and top rule light when its content reaches the reading line (60 % down), and reverse going back up. The featured role rises from depth, and a light sweeps its edge and its scope legend staggers in. | `--exp` view timeline; geometry on scroll (roles); `--featured` |
| Experience → projects | The vertical path hands off to a horizontal plane along the Projects edge. Titles move to display size. Each project is a large presentation: its diagram sits on a real CSS 3D plane (back plate, card, front frame) that swings in and separates in depth, while the copy rises at its own rate.                                                                                           | `--proj`, per-figure `--pv`                                     |
| Projects → skills     | Seven scattered clusters assemble into a capability constellation (security on the left arc, engineering on the right, one point per skill). It sits beside the readable HTML list and lights the selected category's cluster, and its points twinkle slowly only while on screen.                                                                                                           | `--cst`                                                         |
| Skills → contact      | Credentials and Education are quiet: no header motion and no reveals. Contact is the finale: a display title, the email address set large, the actions and channels, and one CSS 3D accent (segmented rings around a faceted core). The accent folds into place, then turns once per 48 s, only while on screen.                                                                             | `--contact`                                                     |

**Timing:** feedback 150 ms, reveals 450–700 ms or about 30–45 vh of scroll, ambient 30 s or more. Only `transform`, `translate`, `opacity`, `clip-path` (title wipes) and the diagrams' `stroke-dashoffset` animate. There is no pinning: the only sticky element is the role timeline inside its own column, which the page scrolls past normally. There are no spacer sections and no forced scroll speed.

**Native scrolling:** Lenis (JS-smoothed wheel scrolling) was removed. The `lenis` package is still listed in `package.json`, unused.

**Motion control:**

- `html[data-motion="full" | "reduced"]` is set before first paint from the visitor's choice (the header **Motion** toggle at 1024 px and up, the mobile menu, and the command palette), or from the OS setting until they choose. The OS setting is followed live.
- "Reduced" is a complete path: no animation, no transition, no smooth scrolling, no pointer depth, no heading scramble or magnetic buttons, and the 3D sculpture shows its static poster (its code isn't loaded).
- Without JavaScript, CSS falls back to the OS setting alone.

**Safety:**

- **Content visible if animation fails:** every resting style is the final state, and hidden "from" states exist only while an animation runs. Role "pending" states are applied only after JavaScript has measured them.
- **Reverse scrolling and resizing:** view timelines reverse with the scroll and recompute on resize.
- **Deep links:** they resolve correctly. Role activation is measured from geometry, so a jump past a role still counts it.
- **Reading position across rotation:** `useScrollAnchor` keeps the reader's place across width changes. Native scroll anchoring is suppressed by the animated transforms, and rotating a phone had moved the view 1.3–2.2 k px. Height-only changes (mobile toolbars) are left alone.

**Verified** (production build, headless Chrome 153; script `motionverify`, all pass):

- the Motion toggle stops all 115 animations and the 3D, persists, and restores
- OS reduced motion gives 0 animations, with every section visible
- with animations force-disabled, all text is visible in Experience, Projects, Skills and Contact
- deep links to #experience, #role-konstent, #projects, #skills and #contact resolve fully visible
- reverse scrolling returns role states and the hand-off
- resizing and a mobile toolbar height change cause no overflow
- a phone rotation keeps the section within 10 px
- no horizontal overflow over a full scroll at 320, 390, 768, 1024, 1440 and 1920 px
- CLS 0.0009 over a full down-and-up scroll
- no console errors

Scroll journeys (14 stops each) were inspected at 1440×900 and 390×844. The sculpture, fallback, portrait and link suites still pass.

**Not verified:**

- Firefox: no scroll-driven animations there without a flag, so it shows the static, complete page plus the JavaScript role activation.
- Safari 26, real devices, and frame rate on real GPUs.

## 12. Interactive skills constellation (2026-09-28)

- **One control for everything.** WAI-ARIA tabs for the seven resume categories. Arrow keys work in both directions, plus Home/End, with wrap-around. On phones and tablets the tabs are a two-column grid of 48–54 px touch targets above the list; from 1024 px they form a column beside it.
- **Exact lists.** The selected category's complete skill list is always shown in HTML, exactly as in `resume.ts`. "Show all skills" and Reading mode list all 7 categories and 54 skills.
- **Constellation.** Selecting a category lights its cluster. Clicking or tapping a cluster selects that category too; each cluster has a 62-unit touch area. Hovering a skill with a mouse lights its exact point and names it. The drawing stays `aria-hidden` with no tab stops: the tabs are the keyboard and screen-reader path.
- **No proficiency cues.** Every point and node is one size, emphasised only by selection. There are no scores, levels or weighting.
- **Assembly.** The map is assembled by the time 60 % of it is on screen. View timelines exclude the page's scroll padding, so a deep link to #skills lands on the finished map.
- **Verified** (script `skillsverify`, 1440 / 768 / 390, all pass):
  - tab semantics and sizes
  - keyboard sequence
  - every category's panel matching its complete reference list
  - the constellation following the selection
  - cluster click and tap
  - hover-lit points
  - equal point sizes
  - show-all round trip
  - Reading mode
  - no overflow and no console errors
- **Also re-run:** the motion suite passes. The PDF audit finds all 61 skill items; its overall 148/149 is the separate role-line change in commit 99ea769.

## 13. Interaction layer (2026-09-28)

- **Navigation dock.**
  - Desktop: the section rail's single indicator glides to the active section (450 ms). Labels show on hover and on keyboard focus. Two tools are always there: Reading mode (`aria-pressed`) and email.
  - Phones: a bottom dock shows the current section, with a lit segment gliding along seven. It has Email, Reading and Commands, all 44 px. The explore pill sits above it, and the page reserves `--dock-h` so nothing is covered.
  - Section links stay in the header and menu.
- **Magnetic attraction.** Primary buttons only. The label drifts at most 4 px toward a mouse on fine pointers with motion on; the clickable box never moves.
- **Press and light.**
  - Every button, tab, disclosure and dock tool has a press state (scale 0.95–0.97).
  - Primary and secondary buttons have a directional light that follows the pointer. It is centred on keyboard focus and appears at the point of a tap on touch. It replaces the hover-only sweep.
- **Project depth.** The diagram's plane tilts up to about 3° toward a mouse and lifts slightly on hover. Keyboard focus inside the project, or a tap on its buttons, lifts it the same way. It is flat with motion off or in Reading mode.
- **Command palette.** It has a visible trigger (header, and the mobile dock) and opens with Ctrl/⌘ K or `/`. Shortcuts never fire while typing, and the keyboard hints are shown in the dialog.
- **Exploration.** The same four optional steps: experience viewed, both projects opened, skills explored, credentials viewed. When the last one is done, a one-off, visual-only cue plays:
  - a light runs down the rail (or across the dock)
  - the explore pill rings twice
  - the progress segments light in sequence

  The text stays "You have opened all four areas." The cue never replays on reload and is absent with motion off.

- **Reading mode.** It is reachable from the header, the rail, the mobile dock, a second skip link and the palette. The default stays Interactive (fresh visits, OS reduced motion and no WebGL were all checked).
- **Not added.** No custom cursor or pointer-follower, no audio, no tutorial, nothing gated.
- **Verified** (script `interactverify`, all 17 checks pass at 1440 and 390 px). The motion, skills, sculpture, portrait and link suites still pass.
