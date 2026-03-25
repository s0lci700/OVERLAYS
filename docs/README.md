---
title: Documentation Index
type: reference
source_files: []
last_updated: 2026-03-25
---

# Documentation Index

**Start here** to understand the current state of the TableRelay project.

## 📋 Quick Reference

| Document | Purpose | Read when... |
|----------|---------|--------------|
| **`../CLAUDE.md`** | Project instructions & conventions | Setting up your environment or starting work |
| **`../PROJECT.md`** | Four-layer system architecture | Understanding system design (Stage/Cast/Audience) |
| **`ARCHITECTURE.md`** | Technical data flows & API routes | Building new features or debugging |
| **`API.md`** | REST endpoints + frontend services reference | Calling the API or using a service module |
| **`SOCKET-EVENTS.md`** | Socket.io event contracts | Working with real-time communication |
| **`DESIGN-SYSTEM.md`** | Design tokens & component reference | Building UI or styling components |
| **`UI-COMPONENTS.md`** | Primitive & business component style guide | Finding where a style lives |
| **`ENVIRONMENT.md`** | `.env` setup & IP configuration | Setting up local development |
| **`THEMING.md`** | Token generator & theme editor | Customizing design tokens |
| **`INDEX.md`** | File locations & entry points | Quick navigation |

## 🏗️ Subdirectories

- **`layers/`** — Documentation for route groups: audience.md, cast.md, stage.md
- **`plans/`** — Current implementation plans and design documents
- **`done/`** — Archived: completed plans, migrations, research, audits

## 🎯 Common Tasks

### "How does X work?"
→ Read `PROJECT.md` for system overview, then `ARCHITECTURE.md` for technical details

### "What events are available?"
→ See `SOCKET-EVENTS.md`

### "How do I set up locally?"
→ Follow `../CLAUDE.md` Commands section, then `ENVIRONMENT.md`

### "How do I style a component?"
→ Check `DESIGN-SYSTEM.md` for tokens and `layers/` for route-specific patterns

### "Why is feature X not working?"
→ Check `ARCHITECTURE.md` data flows, then `SOCKET-EVENTS.md` for event contracts

## 📚 Archive

Historical documentation (migrations, completed plans, research, audits) is organized in `done/`. See `done/README.md` for a detailed inventory.

This keeps the active docs focused on **current project state** and makes navigation faster.

