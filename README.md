# 🎲 DADOS & RISAS - Real-Time D&D Overlay System

> Professional overlay system for streaming D&D sessions with real-time HP tracking, dice rolls, and mobile control.

![Status](https://img.shields.io/badge/status-MVP%20Demo-yellow)
![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📋 Overview

**DADOS & RISAS** is a custom-built overlay system designed for D&D livestreaming and recording. Built specifically for the ESDH pitch, this system demonstrates the technical capability to create production-ready solutions for content creators.

### Key Features

- 🎮 **Real-time HP Tracking** - Visual HP bars that update instantly
- 📱 **Mobile Control Panel** - Manage game state from any device
- 🎲 **Dice Roll Integration** - Track and display dice rolls
- 🖥️ **OBS/vMix Compatible** - Works with professional streaming software
- ⚡ **WebSocket Real-Time Sync** - Zero-latency updates across all devices
- 🎨 **Color-Coded Health States** - Automatic visual feedback (green/yellow/red)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│        Control Panel (Phone/Tablet)     │
│        Svelte + Socket.io Client        │
│              Port: 5173                  │
└───────────────────┬─────────────────────┘
                    │
                    │ HTTP + WebSocket
                    ↓
┌─────────────────────────────────────────┐
│         Node.js Backend Server          │
│    Express + Socket.io + In-Memory DB   │
│              Port: 3000                  │
└───────────────────┬─────────────────────┘
                    │
                    │ WebSocket Broadcast
                    ↓
┌─────────────────────────────────────────┐
│          OBS/vMix Browser Source        │
│         HTML + CSS + Vanilla JS         │
│           Real-time Overlays            │
└─────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **OBS Studio** or **vMix** (optional, for overlays)

### Installation

```bash
# Clone the repository
git clone https://github.com/s0lci700/OVERLAYS.git
cd OVERLAYS

# Install dependencies
npm install

# Start the server
node server.js
```

The server will start on `http://localhost:3000`

---

## 📖 Usage

### 1. Start the Backend Server

```bash
node server.js
```

You should see:
```
Server is running on port 3000
```

### 2. Open the HP Overlay

#### In Browser (for testing):
- Open `public/overlay-hp.html` in your browser
- Or navigate to: `file:///C:/path/to/OVERLAYS/public/overlay-hp.html`

#### In OBS Studio:
1. **Add Source** → **Browser**
2. Check **"Local file"**
3. Browse to `public/overlay-hp.html`
4. Set dimensions: **Width: 1920**, **Height: 1080**
5. ✅ Enable **"Refresh browser when scene becomes active"**
6. ❌ Disable **"Shutdown source when not visible"**

### 3. Test HP Updates

Open browser console (F12) and run:

```javascript
fetch('http://localhost:3000/api/characters/char1/hp', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ hp_current: 15 })
});
```

Watch the HP bar update in real-time! 🎉

---

## 🔌 API Reference

### REST Endpoints

#### Get All Characters
```http
GET /api/characters
```

**Response:**
```json
[
  {
    "id": "char1",
    "name": "El verdadero",
    "player": "Lucas",
    "hp_current": 28,
    "hp_max": 35
  }
]
```

#### Update Character HP
```http
PUT /api/characters/:id/hp
Content-Type: application/json

{
  "hp_current": 20
}
```

**Response:** Updated character object

#### Log Dice Roll
```http
POST /api/rolls
Content-Type: application/json

{
  "charId": "char1",
  "result": 18,
  "modifier": 3
}
```

**Response:**
```json
{
  "charId": "char1",
  "rollResult": 21
}
```

### Socket.io Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `connection` | Server → Client | - | Client connected |
| `initialData` | Server → Client | `{ characters, rolls }` | Initial state on connect |
| `hp_updated` | Server → All | `{ character, hp_current }` | HP changed |
| `dice_rolled` | Server → All | `{ charId, result, modifier, rollResult }` | Dice rolled |

---

## 🎨 Overlay Features

### HP Bars

**Health States:**
- 🟢 **Healthy** (>60% HP) - Green gradient
- 🟡 **Injured** (30-60% HP) - Orange gradient  
- 🔴 **Critical** (<30% HP) - Red gradient with pulse animation

**Animations:**
- Smooth width transitions (0.5s)
- Color fade effects
- Pulse animation when critical
- Status messages on updates

---

## 💻 Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Backend** | Node.js | 18+ |
| **Server Framework** | Express | 5.2.1 |
| **Real-time Communication** | Socket.io | 4.8.3 |
| **CORS Handling** | cors | 2.8.6 |
| **Frontend (Overlays)** | Vanilla JS | - |
| **Control Panel** | Svelte + Vite | TBD |
| **Data Storage** | In-Memory | - |

---

## 🗂️ Project Structure

```
OVERLAYS/
├── server.js                 # Backend server (Express + Socket.io)
├── package.json              # Dependencies and scripts
├── README.md                 # This file
├── TODO.md                   # Task checklist
├── PROGRESS.md               # Detailed development log
├── CLAUDE.md                 # Technical specifications
├── .gitignore                # Git ignore rules
│
├── public/                   # OBS overlay files
│   └── overlay-hp.html       # HP bars overlay
│
└── ROADMAPS/                 # Development roadmaps
    ├── CRASH_COURSE_3_DAY_DEMO.docx
    └── COMPLETE_DEVELOPMENT_ROADMAP.docx
```

---

## 🎯 Demo Characters

The system includes two demo characters:

```javascript
[
  {
    id: 'char1',
    name: 'El verdadero',
    player: 'Lucas',
    hp_current: 28,
    hp_max: 35
  },
  {
    id: 'char2',
    name: 'B12',
    player: 'Sol',
    hp_current: 30,
    hp_max: 30
  }
]
```

---

## 🔧 Development

### Running the Server in Dev Mode

```bash
node server.js
```

### Testing WebSocket Connection

```javascript
// In browser console
const socket = io('http://localhost:3000');
socket.on('connect', () => console.log('Connected!'));
socket.on('hp_updated', (data) => console.log('HP Update:', data));
```

### Debugging

1. **Check server logs** - Terminal running `node server.js`
2. **Browser console** - F12 → Console tab
3. **Network tab** - F12 → Network → WS (WebSocket frames)
4. **OBS Interact** - Right-click Browser Source → Interact → Console

---

## 📱 Mobile Testing (Coming Day 2)

To test the control panel on your phone:

1. Find your local IP:
```bash
ipconfig  # Windows
```

2. Start Vite with network access:
```bash
npm run dev -- --host
```

3. Access from phone: `http://192.168.x.x:5173`

---

## 🚧 Roadmap

### ✅ Day 1 - Backend + First Overlay (Complete)
- [x] Express + Socket.io server
- [x] REST API endpoints
- [x] Real-time WebSocket events
- [x] HP overlay with animations
- [x] OBS compatibility verified

### ⏳ Day 2 - Control Panel (In Progress)
- [ ] Svelte app initialization
- [ ] Mobile-first UI
- [ ] HP control interface
- [ ] Socket.io client integration
- [ ] Basic dice roller

### ⏳ Day 3 - Polish + Demo
- [ ] Visual improvements
- [ ] End-to-end testing
- [ ] Demo video recording
- [ ] Documentation updates

### 🔮 Future Enhancements
- [ ] SQLite database persistence
- [ ] Dice roll overlay (overlay-dice.html)
- [ ] Tonybet odds tracker overlay
- [ ] Character creation interface
- [ ] Combat log/history
- [ ] Chilean branding theme
- [ ] Sound effects
- [ ] Initiative tracker

---

## 🎬 Demo Script

**Hook (30s):**
"This is a real-time overlay system for D&D streaming. Watch this."

**Demo (60s):**
1. Show control panel on phone
2. Update HP → See instant OBS update
3. Show color transitions (green → yellow → red)
4. Roll dice → Animation appears

**Value Prop (30s):**
- Designed specifically for D&D
- Real-time game state tracking
- Mobile control during gameplay
- Better than generic overlay services

---

## 📊 Advantages vs Alternatives

| Feature | overlays.uno | DADOS & RISAS |
|---------|--------------|---------------|
| HP Tracking | ❌ No | ✅ Automated |
| Dice Integration | ❌ No | ✅ Yes |
| Game State Sync | ❌ No | ✅ Full tracking |
| Mobile Control | ❌ No | ✅ Yes |
| Custom Branding | ⚠️ Limited | ✅ 100% custom |
| D&D-Specific | ❌ No | ✅ Yes |
| Chilean Market | ❌ No | ✅ Optimized |
| Cost | $0-15/mo | ✅ One-time build |

---

## 🤝 Contributing

This is currently a pitch/demo project. If you'd like to contribute after the pitch:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👥 Team

- **Sol** - Creator, Developer, Technical Lead
- **Lucas** - Dungeon Master, Creative Lead
- **Salvador** - Technical Assistant
- **Kuminak** - D&D Expert, Workshop Leader

---

## 📞 Contact

**Pitch Target:** ESDH (El Show de Héctor)  
**Pitch Deadline:** Friday, February 21, 2026  
**Meeting:** Monday, February 24, 2026

---

## 🎯 Success Criteria

**Technical Demo:**
- [x] Server runs stable (30+ min)
- [x] HP updates in OBS <1 second
- [x] Color transitions working
- [x] Real-time WebSocket sync
- [ ] Mobile control functional
- [ ] Demo video under 3 minutes

**Pitch Success:**
- Position as technical solution provider
- Demonstrate custom capabilities
- Show advantage over generic tools
- Open conversation for broader collaboration

---

<div align="center">

**Built with ❤️ for D&D, streaming, and Chilean content creators**

[Report Bug](https://github.com/s0lci700/OVERLAYS/issues) · [Request Feature](https://github.com/s0lci700/OVERLAYS/issues)

</div>
