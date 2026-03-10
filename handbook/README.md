# Handbook

Learning and reference handbook for the **OVERLAYS / Dados & Risas** project codebase.

This is a standalone SvelteKit + TypeScript + Svelte 5 app, deployed to Vercel.
It is fully isolated from the rest of the monorepo.

## Stack

- SvelteKit 2
- Svelte 5
- TypeScript
- Vite
- adapter-vercel

## Getting started

```bash
cd handbook
npm install
npm run dev
```

## Structure

```
handbook/
├── src/
│   ├── lib/
│   │   ├── components/   # Shared UI components
│   │   ├── content/      # Learning content / data
│   │   └── types/        # TypeScript types
│   ├── routes/           # SvelteKit file-based routes
│   └── app.html          # HTML shell
├── static/               # Public static assets
├── svelte.config.js
├── tsconfig.json
└── vite.config.ts
```

## Phase 1

Phase 1 implementation is handled separately. This scaffold is the starting point.