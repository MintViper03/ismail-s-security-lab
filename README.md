# Ismail's Security Lab

Personal portfolio for **Ismail Murtaza** — Penetration Tester | Security Engineer | Incident Response, based in Udaipur, Rajasthan, India. A single-page site built from the resume, with an optional Interactive layer (3D hero, exploration panel, command palette) and a Reading mode that shows everything with no motion.

## Tech Stack

| Layer     | Technology                                                                        |
| --------- | --------------------------------------------------------------------------------- |
| Framework | [TanStack Start](https://tanstack.com/start) (SSR)                                |
| UI        | [React 19](https://react.dev) · TypeScript                                        |
| Styling   | [Tailwind CSS v4](https://tailwindcss.com) · [shadcn/ui](https://ui.shadcn.com)   |
| 3D        | [three.js](https://threejs.org) (lazy-loaded, desktop only, static SVG fallback)  |
| Motion    | CSS (scroll-driven where supported) · [Lenis](https://lenis.darkroom.engineering) |
| Palette   | Radix Dialog + [cmdk](https://cmdk.paco.me) (lazy-loaded)                         |
| Linting   | ESLint · Prettier                                                                 |

## Getting Started

```sh
npm install        # install dependencies
npm run dev        # dev server (SSR)
npm run build      # production build -> dist/
npm run preview    # serve the production build (http://localhost:4173)
npm run lint       # lint
```

To review a build locally: `npm run build && npm run preview`, then open the printed URL. The resume download is served from `/resume/Ismail_Murtaza_Resume.pdf`.

## Content

Every professional fact comes from `src/content/resume.ts`, which is a verbatim transcription of `public/resume/Ismail_Murtaza_Resume.pdf`. Interface wording lives in `src/content/site.ts`. See `docs/resume-content-map.md` for the item-by-item map, `docs/qa-report.md` for measured QA results, and `docs/HANDOFF.md` for the latest review summary.

## Project Structure

```
src/
├── components/
│   ├── portfolio/         # Page sections, shell, palette, explore panel
│   │   ├── hero/          # Security-core scene: shared geometry, SVG fallback, lazy three.js canvas
│   │   └── projects/      # Conceptual project diagrams (SVG)
│   └── ui/                # shadcn/ui primitives
├── content/               # resume.ts (facts), site.ts (UI labels), highlights.ts, sources.ts
├── hooks/                 # Lenis, media queries, active section, dwell tracking
├── lib/                   # View mode, exploration store, UI storage, navigation, utils
├── routes/
│   ├── __root.tsx         # HTML shell, meta + JSON-LD, 404/error pages
│   └── index.tsx          # Home route -> <Portfolio />
├── router.tsx             # TanStack Router setup
├── server.ts              # Custom SSR entry (error recovery around h3)
├── start.ts               # TanStack Start middleware (CSRF, error boundary)
└── styles.css             # Tailwind v4 theme (design tokens, reading-mode rules)
```

## License

Private — all rights reserved.
