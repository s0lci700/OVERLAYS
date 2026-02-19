# DADOS & RISAS - MVP TODO

**Pitch Deadline:** Email Friday Feb 21, Meeting Monday Feb 24
**Today:** Wednesday Feb 19 — DAY 2

---

## ✅ DAY 1 - BACKEND + OVERLAYS (Tuesday Feb 18)

- [x] Node.js + Express server setup
- [x] Socket.io integration with CORS
- [x] In-memory character data (El verdadero, B12)
- [x] REST API endpoints (GET characters, PUT hp, POST rolls)
- [x] Real-time WebSocket events (`hp_updated`, `dice_rolled`)
- [x] Create `public/overlay-hp.html` (HP bars, color transitions)
- [x] Create `public/overlay-dice.html` (dice popup, crit/fail detection)
- [x] Test overlays in browser
- [x] Verify color transitions (green→yellow→red)

**Bonus:** `sugestion.html` — polished design mockup with Tonybet odds tracker and hexagon dice popup (static, no socket connection yet — good visual reference for pitch)

**Status:** ✅ COMPLETE

---

## ✅ DAY 2 - CONTROL PANEL (Wednesday Feb 19 — TODAY)

### ✅ COMPLETE - Functional Control Panel Built!

- [x] Initialize Svelte + Vite app in `control-panel/`
- [x] Install dependencies (svelte, vite, socket.io-client)
- [x] Create `control-panel/src/main.js` and `App.svelte` entry point
- [x] **Socket.io singleton** (`lib/socket.js`) — connects to `192.168.1.82:3000`
- [x] **Receive `initialData`** and sync character state
- [x] **CharacterCard component** — displays name, player, current/max HP
- [x] **HP visual bar** — dynamic width based on HP percentage
- [x] **HP controls** — amount input + Damage/Heal buttons
- [x] **PUT `/api/characters/:id/hp`** — updates HP on server (tested ✓)
- [x] **DiceRoller component** — character selector + d4/d6/d8/d10/d12/d20 buttons
- [x] **POST `/api/rolls`** — sends roll data to server (tested ✓)
- [x] **Real-time sync** — `hp_updated` and `dice_rolled` events broadcast to all clients
- [x] **Mobile-ready** — running on `192.168.1.82:5173` with `--host` flag
- [x] **Cross-device sync** — phone receives HP/roll updates from server

**What's Working:**
- ✅ Control panel loads characters from server
- ✅ HP updates from phone appear in OBS overlay instantly
- ✅ Dice rolls broadcast to all devices
- ✅ Real-time two-way sync confirmed
- ✅ Phone can control game state remotely

**What Still Needs Polish (Low Priority):**
- Tailwind CSS styling (currently inline styles — functional but not pretty)
- Last roll display in dice roller component
- Character selector dropdown styling
- Error handling UI

**Status:** ✅ CORE FUNCTIONALITY COMPLETE — READY FOR DEMO

---

## ⏳ DAY 3 - POLISH + DEMO (Thursday Feb 20)

- [ ] Apply Tailwind styling to CharacterCard and DiceRoller (optional but recommended)
- [ ] Test full flow: Phone control panel → Server → OBS overlays
- [ ] Verify HP updates appear in OBS instantly (overlay-hp.html)
- [ ] Verify dice roll popup works in OBS (overlay-dice.html)
- [ ] Connect overlay-dice.html to WebSocket (`dice_rolled` events)
- [ ] Record demo video (2–3 minutes showing full flow)
- [ ] Screenshot key moments for email backup
- [ ] Write demo script for pitch (3–4 clear steps)
- [ ] Final testing on OBS Studio

**Demo Flow Should Show:**
1. Control panel open on phone showing characters
2. Damage character from phone → HP bar updates in OBS in real-time
3. Roll dice → Dice popup appears in OBS
4. Explain advantages over overlays.uno

**Goal:** Working demo video showing full real-time system in action

---

## 📧 FRIDAY FEB 21 — PITCH EMAIL

- [ ] Write pitch email to Héctor
- [ ] Attach/link demo video
- [ ] Mention technical differentiator (vs overlays.uno)
- [ ] Request meeting for Monday
- [ ] Send before EOD

---

## 🎯 MONDAY FEB 24 — PITCH MEETING

- [ ] Setup laptop with demo ready 30 mins early
- [ ] OBS open with both overlays loaded
- [ ] Phone with control panel ready
- [ ] Practice demo (under 3 minutes)
- [ ] Pitch deck ready
- [ ] Prepared for objections (budget, niche, D&D knowledge)

---

## 🔄 OPTIONAL (if time permits)

- [ ] Apply Tailwind CSS to all components
- [ ] Connect `overlay-dice.html` to WebSocket (currently static)
- [ ] Add `overlay-odds.html` (Tonybet odds tracker overlay for OBS)
- [ ] SQLite database persistence (instead of in-memory)
- [ ] Chilean branding/colors (use `sugestion.html` for reference)
- [ ] Sound effects for critical hits (nat 20) and failures (nat 1)
- [ ] Combat log/history view in control panel
- [ ] Character creation interface
- [ ] Add initiative tracker for combat

---

## 📝 ARCHITECTURE SUMMARY

**Server (Node.js + Express + Socket.io):**
- Port: 3000 (192.168.1.82:3000)
- In-memory character storage
- Real-time event broadcasting
- REST API for HP/rolls updates

**Control Panel (Svelte + Vite):**
- Port: 5173 (192.168.1.82:5173)
- Socket.io connection to server
- CharacterCard.svelte — Per-character HP control
- DiceRoller.svelte — Dice rolling interface
- Fully functional and tested ✓

**Overlays (Vanilla HTML/CSS/JS):**
- `public/overlay-hp.html` — HP bars (WORKING ✓)
- `public/overlay-dice.html` — Dice popup (needs Socket.io connection)
- Both 1920×1080, OBS-ready, transparent background

**Data Flow:**
```
Phone (Control Panel) 
  ↓ HTTP/WebSocket
Server (192.168.1.82:3000)
  ↓ WebSocket Broadcast
OBS (Overlays) + Other Clients
```

---

## 🎯 STATUS: DAY 2 NEARLY COMPLETE!

**What's Done:**
- ✅ Full working control panel (all core features)
- ✅ Socket.io real-time sync confirmed
- ✅ HP updates working phone → server → OBS
- ✅ Dice roller sending rolls to all clients
- ✅ Mobile-responsive layout
- ✅ No errors, system is stable

**What's Remaining for DAY 3:**
- Polish styling (Tailwind recommended)
- Connect dice popup overlay to WebSocket
- Record demo video
- Final testing

**Recommendation:** Do quick Tailwind pass Thursday morning, then record demo. You're ahead of schedule!
- `socket.io-client` IS already installed in `control-panel/node_modules`
- Keep it simple — working > perfect
