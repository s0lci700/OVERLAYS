# Architecture Index

This document is the source-of-truth map of the project architecture during the overhaul phase.

It ties together the key documentation artifacts so contributors understand:

- system surfaces
- state ownership
- contracts
- developer workflows

## Core product surfaces

### Stage

Backstage operational control panel.

### Cast

Role-specific tools:

- DM
- Players

### Commons

Shared in-room display.

### Audience

Browser-source overlays used in OBS/vMix.

### Production

External broadcast crew operating OBS/vMix scenes.

## Surface responsibilities

### Stage

- setup
- session state mutation
- content/reveal queue
- operator monitoring

### Cast / DM

- combat facilitation
- reference
- NPC/enemy/lore lookup

### Cast / Players

- digital character sheet
- personal notes

### Commons

- party status
- combat order
- location/environment context

### Audience

- passive overlay rendering
- animation and display

### Production

- decides what is visible on-air

## Stack responsibilities

### SvelteKit

Application shell and UI routes.

### PocketBase

Persistence, authentication, files, relations.

### Express + Socket.io

Live orchestration and event fan-out.

### Storybook

Isolated UI development and preview.

## Architecture documentation map

The following documents define the architecture:

- `state-ownership-matrix.md` — who owns which state
- `contracts-inventory.md` — system contracts
- `DX-improvement-plan.md` — developer experience improvements
- `UX.md` — product UX and interaction direction
- `storybook-surface-map.md` — Storybook organization
- `storybook-mock-data.md` — canonical story fixtures

## Route surface model

Routes are grouped by surface:

- `(stage)`
- `(cast)`
- `(commons)`

Examples:

- `/live/characters`
- `/live/dice`
- `/live/queue`
- `/dm`
- `/dm/npcs/[id]`
- `/players/[id]`
- `/session-display`

Audience overlays remain separate from the main app.

## Development principles

1. Separate records, live state, events, and display payloads.
2. Prefer record-driven pages where possible.
3. Use Storybook for isolated UI development.
4. Keep Stage, Cast, Commons, and Audience responsibilities distinct.
5. Avoid coupling display components to backend orchestration.

## One-line summary

The system is built around clear surface ownership, explicit contracts, and UI isolation through Storybook.
