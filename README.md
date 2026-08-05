# Ismail's Security Lab

Personal portfolio for **Ismail Murtaza** — penetration tester, red teamer, and security engineer based in Udaipur, India. Showcases offensive security case studies, tooling, and research through an immersive, interactive single-page experience.

## Tech Stack

| Layer       | Technology                                                     |
| ----------- | -------------------------------------------------------------- |
| Framework   | [TanStack Start](https://tanstack.com/start) (SSR)             |
| UI          | [React 19](https://react.dev) · TypeScript                     |
| Styling     | [Tailwind CSS v4](https://tailwindcss.com) · [shadcn/ui](https://ui.shadcn.com) |
| 3D / Motion | [Three.js](https://threejs.org) via React Three Fiber · [GSAP](https://gsap.com) |
| Routing     | TanStack Router (file-based)                                   |
| Linting     | ESLint · Prettier                                              |

## Getting Started

```sh
# Install dependencies
npm install

# Start the dev server (SSR)
npm run dev

# Production build
npm run build

# Preview the production build
npm run preview

# Lint
npm run lint

# Format
npm run format
```

## Project Structure

```
src/
├── components/
│   ├── portfolio/     # Main portfolio sections (hero, skills, projects, contact)
│   ├── three/         # Three.js / R3F components
│   └── ui/            # shadcn/ui primitives
├── hooks/             # Custom React hooks (Lenis smooth scroll, mobile detection)
├── lib/               # Utilities (error handling, motion helpers)
├── routes/
│   ├── __root.tsx     # Root layout (HTML shell, error/404 pages, meta tags)
│   └── index.tsx      # Home route → <Portfolio />
├── router.tsx         # TanStack Router setup
├── server.ts          # Custom SSR entry (error recovery around h3)
├── start.ts           # TanStack Start middleware (CSRF, error boundary)
└── styles.css         # Tailwind v4 theme (custom design tokens, utilities)
```

## License

Private — all rights reserved.
