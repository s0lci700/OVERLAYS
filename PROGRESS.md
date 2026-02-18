# DADOS & RISAS - Development Progress

**Project:** Real-time D&D overlay system for ESDH pitch  
**Developer:** Sol  
**Started:** Tuesday, February 18, 2026  
**Pitch Deadline:** Email Friday Feb 21, Meeting Monday Feb 24

---

## 📊 OVERALL STATUS

**Current Phase:** Day 1 Complete ✅ → Moving to Day 2

**Progress:** 33% (Day 1 of 3 complete)

**Confidence Level:** 🟢 High - On track for Friday deadline

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

## ⏳ DAY 2 PLAN - Wednesday Feb 19, 2026

### Objective
Build Svelte control panel for mobile control during gameplay.

### Tasks

**1. Initialize Svelte App (30 min)**
```bash
npm create vite@latest control-panel -- --template svelte
cd control-panel
npm install
npm install socket.io-client
```

**2. Basic Layout (1 hour)**
- Mobile-first responsive design
- Header with connection status
- Character list view
- Navigation structure

**3. HP Controls (1.5 hours)**
- Display current/max HP for each character
- +/- buttons for HP adjustment
- Optional: slider for quick updates
- Visual feedback on update
- Error handling

**4. Socket.io Integration (1 hour)**
- Connect to `http://localhost:3000`
- Listen for `initialData` event
- Listen for `hp_updated` event (for sync across devices)
- Emit updates via API calls (PUT requests)

**5. Dice Roller (1.5 hours)**
- d20 roller (minimum)
- Optional: d4, d6, d8, d10, d12, d100
- Modifier input (+/- to roll)
- Roll button with visual feedback
- POST to `/api/rolls` endpoint
- Display result

**6. Phone Testing (30 min)**
- Get local IP: `ipconfig` → IPv4 Address
- Run with: `npm run dev -- --host`
- Test from phone browser: `http://192.168.x.x:5173`
- Verify controls work
- Verify updates appear in OBS

**Estimated Time:** ~6 hours

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

**Last Updated:** Tuesday Feb 18, 2026 - 22:00 CLT  
**Next Update:** Wednesday Feb 19, 2026 - After Day 2 completion
