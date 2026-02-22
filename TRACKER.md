# DADOS & RISAS — Project Tracker

> **One-page status document. Share this with teammates, LLMs, or anyone who needs context.**  
> Update the checkboxes and dates as work progresses.

---

## 📌 PITCH CONTEXT (TL;DR for LLMs)

| Field                | Value                                                                                         |
| -------------------- | --------------------------------------------------------------------------------------------- |
| **Project**          | "DADOS & RISAS" — custom D&D streaming overlay system                                         |
| **Goal**             | Prove technical capability to ESDH (El Show de Héctor, 400K+ YouTube)                         |
| **Why it matters**   | ESDH uses generic `overlays.uno`; this is a custom real-time solution                         |
| **Advantage**        | Mobile HP control + real-time OBS overlays — nothing like this exists for Chilean D&D content |
| **Email deadline**   | Monday Feb 24, 2026 at 8am (pitch email to Héctor)                                            |
| **Meeting deadline** | ~~Monday Feb 24, 2026~~ **Rescheduled — new date TBD**                                        |
| **Dev started**      | Tuesday Feb 18, 2026                                                                          |
| **Developer**        | Sol (technical lead)                                                                          |

---

## 🗓️ TIMELINE STATUS

| Day           | Date               | Plan                       | Status         |
| ------------- | ------------------ | -------------------------- | -------------- |
| Day 1         | Tue Feb 18         | Backend + OBS overlays     | ✅ COMPLETE    |
| Day 2         | Wed Feb 19         | Svelte control panel       | ✅ COMPLETE    |
| Day 3         | Thu Feb 20         | Polish + demo video        | 🔄 IN PROGRESS |
| Pitch email   | Mon Feb 24         | Email demo to Héctor (8am) | ⏳ PENDING     |
| Pitch meeting | ~~Mon Feb 24~~ TBD | Live demo at ESDH          | ⚠️ RESCHEDULED |

---

## ✅ FEATURE COMPLETION

### MVP Requirements (from CLAUDE.md)

| Requirement                 | Built? | Notes                               |
| --------------------------- | ------ | ----------------------------------- |
| Server running on port 3000 | ✅     | Node.js + Express + Socket.io       |
| HP updates from phone       | ✅     | PUT `/api/characters/:id/hp` tested |
| ONE overlay live in OBS     | ✅     | Both overlays working               |
| Real-time WebSocket sync    | ✅     | `hp_updated` + `dice_rolled` events |
| Mobile-first control panel  | ✅     | Svelte, runs with `--host` on LAN   |

### Full Feature Set (as-built)

| Feature                                            | Status     | File                                         |
| -------------------------------------------------- | ---------- | -------------------------------------------- |
| Express + Socket.io server                         | ✅ Working | `server.js`                                  |
| `GET /api/characters`                              | ✅ Working | `server.js`                                  |
| `PUT /api/characters/:id/hp`                       | ✅ Working | `server.js`                                  |
| `POST /api/characters/:id/conditions`              | ✅ Working | `server.js`                                  |
| `DELETE /api/characters/:id/conditions/:condId`    | ✅ Working | `server.js`                                  |
| `PUT /api/characters/:id/resources/:rid`           | ✅ Working | `server.js`                                  |
| `POST /api/characters/:id/rest`                    | ✅ Working | `server.js`                                  |
| `POST /api/rolls`                                  | ✅ Working | `server.js`                                  |
| HP bars overlay (OBS)                              | ✅ Working | `public/overlay-hp.html`                     |
| Dice roll popup overlay (OBS)                      | ✅ Working | `public/overlay-dice.html`                   |
| Socket.io singleton (Svelte)                       | ✅ Working | `control-panel/src/lib/socket.js`            |
| Dashboard store (history + pending)                | ✅ Working | `control-panel/src/lib/dashboardStore.js`    |
| CharacterCard (HP + conditions + resources + rest) | ✅ Working | `control-panel/src/lib/CharacterCard.svelte` |
| DiceRoller (d4–d20)                                | ✅ Working | `control-panel/src/lib/DiceRoller.svelte`    |
| `initialData` on connect                           | ✅ Working | Server emits on connection                   |
| `hp_updated` broadcast                             | ✅ Working | All clients + overlays receive               |
| `condition_added` broadcast                        | ✅ Working | All clients receive                          |
| `condition_removed` broadcast                      | ✅ Working | All clients receive                          |
| `resource_updated` broadcast                       | ✅ Working | All clients receive                          |
| `rest_taken` broadcast                             | ✅ Working | All clients receive                          |
| `dice_rolled` broadcast                            | ✅ Working | All clients + overlays receive               |
| Nat 20 → ¡CRÍTICO! glow                            | ✅ Working | `overlay-dice.html`                          |
| Nat 1 → ¡PIFIA! red glow                           | ✅ Working | `overlay-dice.html`                          |
| Color-coded HP states                              | ✅ Working | Green >60%, Orange 30–60%, Red <30%          |
| Phone LAN access                                   | ✅ Working | Vite `--host` + hardcoded IP                 |
| Multi-client sync                                  | ✅ Working | Confirmed across devices                     |

### Optional / Post-Demo

| Feature                       | Status        | Priority                      |
| ----------------------------- | ------------- | ----------------------------- |
| Tailwind CSS on control panel | ⏳ Optional   | Low (visual polish for video) |
| SQLite persistence            | ⏳ Post-pitch | Medium                        |
| Tonybet odds tracker overlay  | ⏳ Post-pitch | High (sponsor integration)    |
| Chilean branding / theme      | ⏳ Post-pitch | Medium                        |
| Sound effects (crit/fail)     | ⏳ Post-pitch | Low                           |
| Initiative tracker            | ⏳ Post-pitch | Medium                        |
| Character creation UI         | ⏳ Post-pitch | Medium                        |
| Combat log / history          | ⏳ Post-pitch | Low                           |

---

## 📋 DAY 3 CHECKLIST (Thu Feb 20)

- [ ] Record 2–3 min demo video
  - [ ] Scene 1: Phone control panel — show characters
  - [ ] Scene 2: Damage → HP bar updates in OBS (<100ms)
  - [ ] Scene 3: Heal → color changes green→yellow→red
  - [ ] Scene 4: Roll d20 → dice popup appears in OBS
  - [ ] Scene 5: Roll Nat 20 → ¡CRÍTICO! animation
  - [ ] Scene 6: "Este es solo el MVP — puedo agregar lo que necesiten"
- [ ] Screenshot key moments (for email backup if video fails)
- [ ] Optional: Apply Tailwind CSS to CharacterCard + DiceRoller

---

## 📧 PITCH EMAIL CHECKLIST (Mon Feb 24 — 8am)

- [ ] Write email to Héctor
- [ ] Attach / link demo video
- [ ] Mention technical differentiator vs. `overlays.uno`
- [ ] Request meeting for Monday
- [ ] Send before 8am Monday

---

## 🎤 PITCH MEETING CHECKLIST (Mon Feb 24)

- [ ] Laptop ready with OBS open + both overlays loaded
- [ ] Phone with control panel open (LAN connection ready)
- [ ] Practice run-through (under 3 minutes)
- [ ] Pitch deck on screen
- [ ] Prepared for objections (budget, niche, D&D knowledge)

---

## 👥 TEAM DELIVERABLES

| Person   | Deliverable                       | Deadline   | Status       |
| -------- | --------------------------------- | ---------- | ------------ |
| Lucas    | Sample one-shot written           | Sun Feb 23 | ⏳ Pending   |
| Salvador | Technical requirements assessment | Sun Feb 23 | ⏳ Pending   |
| Kuminak  | Workshop plan                     | Sun Feb 23 | ✅ Complete  |
| Hermano  | Financial validation memo         | Sun Feb 23 | ⏳ Reviewing |

---

## 🔧 CURRENT ARCHITECTURE (as-built)

```
Phone / Tablet (Control Panel — Svelte + Vite :5173)
  │
  │  HTTP PUT/POST + Socket.io
  ▼
Node.js Server (Express + Socket.io :3000)
  │
  │  WebSocket broadcast (<100ms)
  ├──────────────────────────────┐
  ▼                              ▼
overlay-hp.html             overlay-dice.html
(OBS Browser Source)        (OBS Browser Source)
```

**Characters (in-memory, resets on restart):**

- `CH101` → Kael (player: Mara) — HP: 12/12
- `CH102` → Lyra (player: Nico) — HP: 8/8

**Hardcoded IP to update:** appears in `server.js`, `control-panel/src/lib/socket.js`, `public/overlay-hp.html`, and `public/overlay-dice.html`

---

## 📊 PITCH COMPARISON

|                        | `overlays.uno` (what ESDH uses now) | DADOS & RISAS (what we built)   |
| ---------------------- | ----------------------------------- | ------------------------------- |
| HP tracking            | ❌ No                               | ✅ Real-time, color-coded       |
| Dice integration       | ❌ No                               | ✅ d4–d20, crit/fail animations |
| Mobile control         | ❌ No                               | ✅ Any phone on LAN             |
| Custom branding        | ⚠️ Limited templates                | ✅ 100% custom                  |
| D&D game state         | ❌ No                               | ✅ Full (HP + rolls)            |
| Cost model             | 💸 Monthly subscription             | 🔧 Custom build (one-time)      |
| Chilean market support | ❌ No (PayPal/Stripe only)          | ✅ Can integrate Ceneka/local   |

---

## 🚨 KNOWN GAPS / RISKS

| Gap                             | Impact                  | Mitigation                                                                            |
| ------------------------------- | ----------------------- | ------------------------------------------------------------------------------------- |
| No Tailwind CSS yet             | Visual polish in video  | Record at current quality or apply Day 3 morning                                      |
| IP hardcoded in multiple files  | Must update per machine | Documented in README — update `socket.js`, both overlays, and `server.js` before demo |
| Data resets on server restart   | Demo interruption       | Keep server running continuously during demo                                          |
| No persistence (in-memory only) | Post-demo concern       | Fine for MVP; SQLite in post-pitch roadmap                                            |

---

## 📁 KEY FILES AT A GLANCE

| File                                         | Purpose                                        |
| -------------------------------------------- | ---------------------------------------------- |
| `server.js`                                  | Express + Socket.io backend                    |
| `.env.example`                               | Environment variable template (copy to `.env`) |
| `public/overlay-hp.html`                     | OBS HP bars overlay                            |
| `public/overlay-dice.html`                   | OBS dice popup overlay                         |
| `control-panel/src/App.svelte`               | Root component                                 |
| `control-panel/src/lib/socket.js`            | Socket.io singleton + Svelte stores            |
| `control-panel/src/lib/CharacterCard.svelte` | HP + conditions + resources + rest UI          |
| `control-panel/src/lib/DiceRoller.svelte`    | Dice rolling UI                                |
| `docs/ARCHITECTURE.md`                       | Codebase map + data-flow diagrams              |
| `docs/SOCKET-EVENTS.md`                      | Complete Socket.io event reference             |
| `docs/DESIGN-SYSTEM.md`                      | CSS tokens, typography, component guide        |
| `CONTEXTO_COMPLETO_PITCH.md`                 | Full pitch context (for LLMs)                  |
| `README.md`                                  | Technical setup & API docs                     |
| `TODO.md`                                    | Detailed task checklist                        |

---

_Last updated: Thu Feb 20, 2026 — Day 3 in progress | Pitch meeting rescheduled (TBD)_
