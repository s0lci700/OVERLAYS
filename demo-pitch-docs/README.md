# DADOS & RISAS — Demo Pitch Docs

Workflow charts and reference diagrams for every audience involved in the **DADOS & RISAS** project.

---

## Documents in this folder

| File | Audience | Description |
|------|----------|-------------|
| [workflow-developers.md](./workflow-developers.md) | Developers / Technical contributors | Full system setup, architecture, data flow, and development cycle |
| [workflow-users.md](./workflow-users.md) | Dungeon Masters / Players (everyday users) | How to run a session: control panel, HP tracking, dice rolling |
| [workflow-stakeholders.md](./workflow-stakeholders.md) | El Sentido del Humor Producciones (ESDH) | What the system delivers for their comedy shows, no tech jargon |

---

## Quick summary

**DADOS & RISAS** is a real-time D&D overlay system built for live streaming and content creation. A phone becomes the game master's remote control; OBS overlays update instantly for the audience.

```
📱 Phone / Tablet (control panel)
        │  tap a button
        ▼
🖥️  Node.js Server  ──── WebSocket broadcast ────▶  🎬 OBS Overlays
                                                        (HP bars, dice popups)
```

- **HP changes** → bar animates, turns orange → red → pulses when critical  
- **Dice rolls** → animated popup flies in on stream, ¡CRÍTICO! / ¡PIFIA! effects  
- **All clients stay in sync** in under 100 ms
