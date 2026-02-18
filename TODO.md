# DADOS & RISAS - MVP TODO

**Pitch Deadline:** Email Friday Feb 21, Meeting Monday Feb 24

---

## ✅ DAY 1 - BACKEND + FIRST OVERLAY (Tuesday Feb 18)

- [x] Node.js + Express server setup
- [x] Socket.io integration with CORS
- [x] In-memory character data (El verdadero, B12)
- [x] REST API endpoints (GET characters, PUT hp, POST rolls)
- [x] Real-time WebSocket events (hp_updated, dice_rolled)
- [x] Create overlay-hp.html
- [x] Test overlay in browser
- [x] Test overlay in OBS
- [x] Verify color transitions (green→yellow→red)

**Status:** ✅ COMPLETE

---

## ⏳ DAY 2 - CONTROL PANEL (Wednesday Feb 19)

- [ ] Initialize Svelte + Vite app in `control-panel/`
- [ ] Install dependencies (svelte, socket.io-client)
- [ ] Create mobile-first layout
- [ ] Build character list component
- [ ] Add HP update controls (+/- buttons or slider)
- [ ] Socket.io client connection
- [ ] Real-time state sync from server
- [ ] Test on phone (use `--host` flag)
- [ ] Basic dice roller UI (d20 minimum)
- [ ] Emit roll events to server

**Goal:** Control everything from phone, no browser console needed

---

## ⏳ DAY 3 - POLISH + DEMO (Thursday Feb 20)

- [ ] Polish overlay styling (optional improvements)
- [ ] Add DADOS & RISAS branding (minimal)
- [ ] Test full flow: Phone → Server → OBS
- [ ] Verify HP updates appear in OBS instantly
- [ ] Verify dice rolls display (if time permits)
- [ ] Record demo video (2-3 minutes)
- [ ] Screenshot key moments
- [ ] Write demo script for pitch

**Goal:** Working demo video showing real-time capabilities

---

## 📧 FRIDAY FEB 21 - PITCH EMAIL

- [ ] Write pitch email to Héctor
- [ ] Attach/link demo video
- [ ] Include one-pager summary
- [ ] Mention technical differentiator
- [ ] Request meeting for Monday
- [ ] Send before EOD

---

## 🎯 MONDAY FEB 24 - PITCH MEETING

- [ ] Prepare laptop with demo ready
- [ ] Have OBS open with overlay
- [ ] Have phone with control panel
- [ ] Practice demo (under 3 minutes)
- [ ] Prepare pitch deck
- [ ] Ready to answer technical questions

---

## 🔄 OPTIONAL (IF TIME PERMITS)

- [ ] Add dice roll overlay (overlay-dice.html)
- [ ] Add Tonybet odds tracker overlay
- [ ] SQLite database persistence
- [ ] Add character creation interface
- [ ] Chilean branding/colors
- [ ] Sound effects for rolls
- [ ] Combat log/history view

---

## 📝 NOTES

- Server runs on `localhost:3000`
- Control panel will run on `localhost:5173`
- For phone testing: find local IP with `ipconfig`, use `npm run dev -- --host`
- OBS Browser Source: 1920x1080, local file path
- Keep it simple - working > perfect
