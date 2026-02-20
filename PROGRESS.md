# DADOS & RISAS - Development Progress

**Project:** Real-time D&D overlay system for ESDH pitch  
**Developer:** Sol  
**Started:** Tuesday, February 18, 2026  
**Pitch Deadline:** Email — original date Monday Feb 24 at 8am (⚠️ Meeting rescheduled — TBD)

---

## 📊 OVERALL STATUS

**Current Phase:** Day 3 - Polish & Demo Recording 🔄

**Progress:** 67% (Days 1 & 2 complete, Day 3 in progress)

**Confidence Level:** 🟢 High - Core MVP complete, demo recording remaining

**⚠️ NOTE:** Pitch meeting has been rescheduled (new date TBD)

---

## ✅ DAY 1 COMPLETED - Tuesday Feb 18, 2026

### Backend (Node.js + Socket.io)

**What was built:**
- Express server running on port 3000
- Socket.io server with CORS configured (origin: "*")
- HTTP server using Node's `http` module
- In-memory data storage (characters, rolls arrays)

**API Endpoints:**
- `GET /` - Landing page ("Hello World!")
- `GET /api/characters` - Returns all characters
- `PUT /api/characters/:id/hp` - Update HP, emit socket event
- `POST /api/rolls` - Log roll, emit socket event

**Socket.io Events:**
- `connection` → Server emits `initialData` with characters & rolls
- `hp_updated` → Broadcast to all clients when HP changes
- `dice_rolled` → Broadcast to all clients when dice rolled

**Demo Data:**
```javascript
{ id: 'char1', name: 'El verdadero', player: 'Lucas', hp_current: 28, hp_max: 35 }
{ id: 'char2', name: 'B12', player: 'Sol', hp_current: 30, hp_max: 30 }
```

### HP Overlay (OBS-ready HTML)

**File:** `public/overlay-hp.html`

**Features:**
- Transparent background (required for OBS)
- Real-time Socket.io connection to server
- Character HP bars with visual states:
  - 🟢 Healthy (>60% HP) - Green gradient
  - 🟡 Injured (30-60% HP) - Orange gradient
  - 🔴 Critical (<30% HP) - Red gradient with pulse animation
- Smooth transitions (0.5s width animation)
- Status messages (connection state, HP updates)
- OBS-optimized dimensions (1920x1080)

**Technical Details:**
- Socket.io CDN: v4.8.3
- Uses `data-char-id` attributes for DOM targeting
- Percentage-based width calculations
- CSS animations for visual feedback

**Testing Results:**
- ✅ Works in browser (localhost file)
- ✅ Works in OBS Browser Source
- ✅ Real-time updates confirmed
- ✅ Color transitions working correctly
- ✅ Connection/disconnection handling

### Key Learnings

**Problem encountered:**
- Initially tried to run Socket.io commands in browser console without loading client library
- Event name mismatch: server used `hpUpdate`, documentation said `hp_updated`

**Solutions:**
- Fixed event name to `hp_updated` (matching CLAUDE.md spec)
- Created proper HTML file with Socket.io CDN loaded
- Tested end-to-end flow successfully

---

## ✅ DAY 2 COMPLETED - Wednesday Feb 19, 2026

### Svelte Control Panel

**What was built:**
- Svelte + Vite app in `control-panel/` with `socket.io-client`
- `socket.js` — Singleton Socket.io connection, Svelte `characters` & `lastRoll` stores
- `CharacterCard.svelte` — name/player/HP display, HP bar, Damage/Heal buttons, PUT API call
- `DiceRoller.svelte` — d4/d6/d8/d10/d12/d20 buttons, character selector, POST API call

**Testing Results:**
- ✅ Control panel loads characters from server (`initialData`)
- ✅ HP updates from phone appear in OBS overlay in <100ms
- ✅ Dice rolls broadcast to all devices
- ✅ Real-time two-way sync confirmed across devices
- ✅ Mobile-ready via `npm run dev -- --host` on LAN (192.168.1.82:5173)
- ✅ Zero crashes, stable system

---

## ⏳ DAY 3 PLAN - Thursday Feb 20, 2026

### Objective
Polish demo and prepare pitch materials.

### Tasks

**1. Visual Polish (1 hour)**
- Improve overlay styling if needed
- Add minimal DADOS & RISAS branding
- Ensure colors match Chilean aesthetic
- Test readability on OBS

**2. End-to-End Testing (1 hour)**
- Full flow: Phone control → Server → OBS display
- Test all HP update scenarios
- Test dice rolls (if implemented)
- Check for bugs/edge cases
- Verify on multiple phone browsers

**3. Demo Video Recording (1.5 hours)**
- Write 2-3 minute script
- Set up OBS recording
- Record demo:
  1. Show control panel on phone
  2. Update HP → Show OBS updating
  3. Roll dice → Show result
  4. Explain advantages vs overlays.uno
- Edit video (minimal cuts)
- Export & upload

**4. Screenshot Key Moments (30 min)**
- Control panel UI
- OBS with overlay active
- HP bars in different states
- Dice roll display

**5. Demo Script Writing (30 min)**
- Talking points for pitch
- Technical explanation (1 min version)
- Advantages list
- Next steps proposal

**Estimated Time:** ~4 hours

---

## 📋 TEAM DELIVERABLES STATUS

**Due:** Sunday Feb 23, 2026 (evening check-in)

| Person | Deliverable | Status |
|--------|-------------|--------|
| Lucas | Sample one-shot written | ⏳ Pending |
| Salvador | Technical requirements assessment | ⏳ Pending |
| Kuminak | Workshop plan | ✅ Complete |
| Hermano | Financial validation memo | ⏳ Reviewing |

---

## 🎯 PITCH MATERIALS READY

- ✅ Pitch deck (complete)
- ✅ Market research (complete)
- ✅ Financial model (under review)
- ✅ Sponsorship strategy (complete)
- ✅ Creative content (campaigns 1-3)
- ⏳ Technical demo (Day 2-3)
- ⏳ Demo video (Day 3)

---

## 🔧 TECHNICAL ARCHITECTURE

### Current Setup
```
┌─────────────────────┐
│   Phone Browser     │ (Day 2)
│   Control Panel     │
│   localhost:5173    │
└──────────┬──────────┘
           │ HTTP + WebSocket
           ↓
┌─────────────────────┐
│   Node.js Server    │ ✅ Day 1
│   localhost:3000    │
└──────────┬──────────┘
           │ WebSocket broadcast
           ↓
┌─────────────────────┐
│   OBS Browser       │ ✅ Day 1
│   overlay-hp.html   │
└─────────────────────┘
```

### Future Enhancements (Post-Demo)
- SQLite database (replace in-memory)
- Additional overlays (dice, odds tracker)
- User authentication
- Session history/analytics
- Chilean branding theme
- Combat tracker
- Initiative order

---

## 📝 NOTES & DECISIONS

### Design Decisions Day 1
- **In-memory storage:** Sufficient for demo, no DB complexity needed
- **CORS wide open:** Development only, will restrict in production
- **Vanilla JS for overlays:** Lighter than frameworks, better OBS performance
- **Socket.io over alternatives:** Industry standard, reliable, good docs

### Next Decision Points
- Control panel style: Material Design vs minimal custom
- Dice implementation: Physical dice feel vs instant results
- Character data: Hardcoded vs editable in control panel
- Branding: How much Chilean aesthetic in 3-day build?

---

## ⚠️ RISKS & MITIGATIONS

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Day 2 takes longer than planned | Medium | Medium | Keep scope minimal, skip polish |
| Phone testing issues (network) | Low | Medium | Test early, have USB fallback |
| OBS compatibility issues | Low | High | Already tested Day 1 ✅ |
| Team deliverables delayed | Medium | Low | Can pitch without them |
| Demo video quality | Low | Low | Simple screen record sufficient |

---

## 🎬 DEMO SCRIPT (DRAFT)

**[30 seconds] Hook:**
"This is a real-time overlay system I built for DADOS & RISAS. Watch this."

**[60 seconds] Demo:**
- *Show phone* "This is the control panel."
- *Update HP* "I tap to damage El verdadero..."
- *Pan to OBS* "...and it updates instantly in OBS."
- *Show colors* "Green, yellow, red based on HP."
- *Roll dice* "Here's a dice roll..." *show animation*

**[30 seconds] Value Prop:**
"This is better than overlays.uno because:
- Designed specifically for D&D
- Real-time game state tracking
- Mobile control during gameplay
- Custom integration with sponsors (Tonybet odds)

**[30 seconds] Bigger Picture:**
"This proves I can build custom solutions for ESDH. Not just for D&D - for any production needs you have."

---

## 📊 SUCCESS METRICS

**MVP Demo Success Criteria:**
- [ ] Server runs without crashes (30+ min uptime)
- [ ] HP updates appear in OBS within 1 second
- [ ] Control panel works on phone browser
- [ ] Demo video under 3 minutes, clearly shows value
- [ ] No major bugs during recording

**Pitch Success Criteria:**
- [ ] Héctor understands technical advantage
- [ ] Demo impresses (not just concept talk)
- [ ] Positions Sol as technical partner (not just idea guy)
- [ ] Opens conversation about broader collaboration
- [ ] Gets follow-up meeting/green light

---

**Last Updated:** Friday Feb 20, 2026 - 20:24 CLT  
**Status:** Day 2 complete ✅ | Day 3 in progress 🔄 | Pitch meeting rescheduled (TBD)
