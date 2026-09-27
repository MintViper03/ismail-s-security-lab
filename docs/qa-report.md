# QA report: responsive, performance and accessibility pass

Date: 2026-09-28 · Branch: `content/resume-source-of-truth` (uncommitted) · Build: `vite build` (Vite 8.2.0), served with `vite preview` on localhost.

## What was actually run

| Tool / engine                                      | Version               | Used for                                                                                          |
| -------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------- |
| Google Chrome, headless, driven over CDP (Node 25) | 153.0.8010.53 (Blink) | Every scripted check below: viewports, touch emulation, throttling, keyboard, WebGL (SwiftShader) |
| Mozilla Firefox, headless `--screenshot`           | 156.0.1 (Gecko)       | Visual render at 390 and 1440 px (no scripted interaction: Firefox no longer exposes CDP)         |
| TypeScript `tsc --noEmit`, ESLint, Prettier        | repo versions         | Static checks                                                                                     |

The "mobile" results are Chrome device emulation (viewport, DPR, `mobile`, touch events, CPU/network throttling), not real devices. WebGL ran on SwiftShader (software), so frame costs there are not representative of a real GPU.

## Not tested (do not treat as verified)

- **Real iPhone / iOS Safari / any WebKit engine.** This includes the `dvh` and toolbar behaviour, `env(safe-area-inset-*)` with `viewport-fit=cover`, iOS touch scrolling, and the lack of `requestIdleCallback`, all of which are coded for but unobserved.
- **Real Android devices or a real GPU.**
- **Lighthouse or PageSpeed.** The numbers below come from the browser's own Performance APIs under CDP throttling, not from Lighthouse.
- **Screen readers** (VoiceOver, NVDA, JAWS, TalkBack). Only the DOM semantics were checked (roles, names, headings, live regions, focus order), not real announcements.
- **Firefox interaction** (keyboard, dialogs, touch). Only the rendered screenshots were checked.
- **Production hosting.** Compression, caching and HTTP/2 headers were not tested: preview served the HTML uncompressed (113 KB on the wire).
- **Real 200% browser zoom.** This was approximated with a 640 px CSS viewport at DPR 2, which is equivalent for layout but not for OS-level text scaling.

## Viewports checked

320×640@2, 390×844@3, 768×1024@2, 1024×768, 1366×768, 1440×900, 1920×1080, and 640×450@2 (≈200% zoom of a 1280 px window). Viewports under 1024 px also used touch emulation.

| Check (all viewports)                                                       | Before this pass                   | After                                |
| --------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------ |
| Horizontal overflow                                                         | none                               | none                                 |
| Interactive targets < 44×44 px (excluding inline text links in paragraphs)  | 5–15 per viewport                  | **0**                                |
| Text contrast failures (every visible text node vs. its painted background) | 0 (min 7.53:1)                     | 0 (min 7.53:1)                       |
| Visible focus indicator on first 59 Tab stops                               | 59/59                              | 59/59                                |
| Headings                                                                    | one H1, no skipped levels          | one H1, no skipped levels            |
| Controls/landmarks without an accessible name                               | 0                                  | 0                                    |
| Positive `tabindex`                                                         | 0                                  | 0                                    |
| CLS after scrolling the full page                                           | **0.66 at 320 px**, 0.10 at 390 px | 0 at 320/390/768; ≤ 0.0014 elsewhere |
| Focus lands in view below the fixed header (with smooth-scroll settle)      | yes                                | yes                                  |

## Performance (Chrome, measured)

**Bundles** (minified / gzip, from `dist/client/assets`):

| Chunk                                 | Before                     | After                                           |
| ------------------------------------- | -------------------------- | ----------------------------------------------- |
| Framework (`index`)                   | 350 / 110 KB               | 349 / 110 KB                                    |
| Page code (`routes` + shared `site`)  | 280 / 94 KB                | 98 / 29 KB                                      |
| Command palette (cmdk + Radix dialog) | in page code               | 56 / 19 KB, loaded on first interaction or idle |
| Lenis                                 | in page code               | 18 / 5 KB, mouse-wheel devices only             |
| 3D scene (desktop only)               | 861 / 227 KB (three + R3F) | 546 / 138 KB (vanilla three, named imports)     |
| GSAP                                  | 110 KB                     | removed                                         |
| Hero portrait                         | 200 KB (1200×1798)         | 10 KB (216×216 crop of the same photo)          |

**Load**: Chrome Performance APIs, localhost, median of three runs where repeated.

| Run                                   | FCP    | LCP    | CLS   | Long tasks / TBT | JS transferred | 3D fetched |
| ------------------------------------- | ------ | ------ | ----- | ---------------- | -------------- | ---------- |
| 390 px, CPU 4×, 150 ms RTT / 1.6 Mbps | 1.16 s | 1.16 s | 0.013 | ~150 ms          | 165 KB         | no         |
| 1440 px, no throttling                | 0.33 s | 0.33 s | 0.002 | 115 ms           | 304 KB         | yes        |

For comparison, mobile LCP was 1.70 s with the hero fading in from transparent, and mobile CLS was 0.033 before the metric-matched font fallback.

**3D scene** (draw calls counted by wrapping `drawElements`/`drawArrays`):

- **Resolution:** backing store 855×642 for a 570×428 CSS box on a 2× screen, i.e. pixel ratio capped at 1.5.
- **Render loop:** 14 draw calls per frame while visible; **0/s** when scrolled off-screen, paused, or with the tab hidden (`visibilitychange`); it resumes afterwards.
- **Paused focus change:** exactly one frame (14 calls).
- **`WEBGL_lose_context`:** the canvas is removed and the static SVG shown, with no errors.
- **Switching to Reading mode:** the canvas unmounts and resources are disposed (0 draws after).
- **Reduced motion, Reading mode, width < 1024 px, or WebGL unavailable:** the 3D chunk is **never requested**.

**Palette first open** (keydown → dialog in DOM, measured in-page): 324 ms → **19–35 ms**. The fix was to render the preloaded component directly instead of through React 19's Suspense reveal throttle.

## Resilience

- **JavaScript disabled:** 21/21 animated blocks fully visible, with all headings and bullets present.
- **`requestAnimationFrame` broken:** 21/21 visible. Reveals are CSS-only with no hidden pre-state, so an animation that never runs leaves content visible.
- **Reading mode and reduced motion:** `animation`/`transition` are none site-wide, there is no canvas, and all details are shown (54 skills, 18 experience bullets, 4 project bullets).
- **`localStorage` throwing:** no errors; preferences and exploration fall back to memory.
- **Firefox (no scroll-driven animations):** renders with the time-based fallback, and the hero is readable at the load event.

## Keyboard and dialogs (Chrome)

- **Command palette:**
  - It is a Radix modal: the rest of the page is `aria-hidden`, and focus stays inside for 12 Tab/Shift+Tab presses.
  - Escape returns focus to the element that opened it, including when the palette's code was still loading on a throttled network.
  - Section actions move focus to the section heading.
  - The shortcut is ignored while typing in a field.
- **Mobile menu:** focus moves to the first link, and the page behind is `inert` (focus contained for 16 Tabs). Escape closes it and focuses Menu; a link closes the menu, scrolls, and focuses the section heading.
- **Explore panel:** Escape collapses it to the pill, and Hide and Restore move focus to the Commands button and the pill.

## Issues found and fixed in this pass

1. **Layout shift (0.96 during scroll at 320 px):** the heading "decode" re-wrapped headings. The box is now pinned during the effect, with a stable `aria-label`.
2. **Undersized targets:** 5–15 controls per viewport were below 44 px (header, rail, toggles, Pause, footer links, quiet links, dialog close); all are ≥ 44 px now.
3. **Oversized portrait:** a 200 KB, 1200×1798 image was shown at 72 px. It is now a 10 KB 216 px crop, with reserved width and height.
4. **GSAP (110 KB) on the critical path:** replaced by CSS reveals, a rAF heading effect and CSS-transition magnetic buttons (mouse only, hover-capable devices, off under reduced motion).
5. **R3F pulling all of three.js:** replaced with a vanilla scene that has an explicit render loop, an off-screen/hidden-tab pause, a 1.5 DPR cap, context-loss fallback and full disposal.
6. **3D under reduced motion:** the bundle used to load (paused); now it isn't fetched at all.
7. **Lenis, the palette and the dialog loaded for everyone:** Lenis is now lazy and fine-pointer only; the palette is lazy and preloaded on first interaction or idle.
8. **Hero faded in from transparent:** this delayed LCP by ~0.5 s. The hero now rises in without any opacity change.
9. **Font-swap layout shift:** added a metric-matched `Inter Fallback` (local Arial with size and ascent overrides).
10. **Palette focus return raced its lazy load:** the opener is now captured when the palette is requested.
11. **Mobile menu links lost focus to `<body>`:** they now focus the section heading.
12. **Floating pill covered the hero Contact button at 320 px:** it is icon + count on phones, and the footer has clearance.
13. **Diagram flow animation ran off-screen:** it is now paused unless the diagram is in view.
14. **Safe areas:** `viewport-fit=cover`, `env(safe-area-inset-*)` on gutters, the dock, the menu and the footer, and a `dvh` fallback. Coded but **not verified on iOS**.

## Remaining / known

- ESLint in the Step 1 scope has 795 errors (from 2195), all in 12 files not touched in this work (legacy unused hero components, `lib/error-*`, `lib/motion/*`, `use-mobile.tsx`, `routes/index.tsx`), almost entirely CRLF/Prettier formatting. A formatting-only commit would clear them; it was deliberately kept out of this work. `eslint .` also reports shadcn `ui/` and config files.
- The SSR HTML is ~113 KB uncompressed, partly because server-rendered alternates (desktop tabs and mobile disclosures, wide and tall SVG variants, reading/interactive views) are swapped by CSS to avoid layout shift. Production compression should shrink this considerably; not measured.
- A residual mobile CLS of ~0.013 at the font swap remains (one line nudged), well under 0.1.
- `public/photo.jpg` (the AI-generated original) is still in `public/`, but the page only loads the crop.
