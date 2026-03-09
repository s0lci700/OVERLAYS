# Dados & Risas — Learning Handbook

A standalone SvelteKit app serving as the **project reference handbook** for the *Dados & Risas* D&D streaming overlay system.

Deployed on Vercel, separately from the main `control-panel` and `server.js` stack.

---

## What this is

This handbook documents:

- **Architecture** — how the backend, control panel, PocketBase, and OBS overlays connect
- **Socket Events** — every Socket.io event payload and data shape
- **Design System** — CSS tokens, component states, animations, and brand guidelines
- **Data Layer** — PocketBase collections, character structure, roll history, and seed data
- **Deployment** — Railway config, OBS browser source URLs, LAN IP setup
- **Onboarding** — getting-started guide for new contributors

---

## Tech stack

- [SvelteKit](https://kit.svelte.dev/) `^2`
- [Svelte 5](https://svelte.dev/) with runes
- TypeScript
- [`@sveltejs/adapter-vercel`](https://github.com/sveltejs/kit/tree/main/packages/adapter-vercel) for Vercel deployment

---

## Getting started

```bash
cd handbook
npm install       # or: bun install
npm run dev       # starts dev server at http://localhost:5173
```

### Build

```bash
npm run build
npm run preview
```

### Type-check

```bash
npm run check
```

---

## Project structure

```
handbook/
├── src/
│   ├── lib/
│   │   ├── components/   # Shared Svelte components
│   │   ├── content/      # Markdown / structured content
│   │   └── types/        # TypeScript type definitions
│   └── routes/           # SvelteKit pages
├── static/               # Static assets (favicon, etc.)
├── svelte.config.js
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Isolation

This app is **fully isolated** from the rest of the monorepo:

- Has its own `package.json` and dependencies
- Does **not** import from `control-panel/`, `server.js`, or `data/`
- Does **not** share a build pipeline with the main app
- Deploys independently on Vercel

---

## Status

🚧 **Phase 1 — scaffolding only.** Content pages are not yet implemented.
