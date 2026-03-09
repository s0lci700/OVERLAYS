# Handbook — DADOS & RISAS Learning Reference

A standalone SvelteKit app that serves as the project learning and reference handbook for the **DADOS & RISAS** D&D streaming campaign production system.

## Purpose

This app documents the production stack, component library, and technical decisions for the project. It is intended to be deployed to Vercel as a static/SSR reference site.

## Stack

- **SvelteKit** + **Svelte 5** + **TypeScript**
- **Vite** build tooling
- **@sveltejs/adapter-vercel** for Vercel deployment

## Getting Started

```bash
# From the handbook/ directory
bun install
bun run dev
```

## Available Scripts

| Script | Description |
|---|---|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run preview` | Preview the production build locally |
| `bun run check` | Type-check the project |

## Project Structure

```
handbook/
├── src/
│   ├── lib/
│   │   ├── components/   # Shared UI components
│   │   ├── content/      # Markdown/content modules
│   │   └── types/        # TypeScript type definitions
│   ├── routes/           # SvelteKit file-based routing
│   └── app.html          # Root HTML template
├── static/               # Static assets (fonts, images, etc.)
├── svelte.config.js      # SvelteKit + Vercel adapter config
├── vite.config.ts        # Vite config
└── tsconfig.json         # TypeScript config
```

## Isolation

This app is fully isolated from the rest of the OVERLAYS repo. It has its own `package.json`, `node_modules`, and build pipeline. It does **not** share dependencies or configuration with the control panel or backend server.

## Deployment

Configured for Vercel. Point Vercel to the `handbook/` directory as the project root.
