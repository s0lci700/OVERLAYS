# TableRelay — Critical Patterns & Anti-Patterns

This file serves as the "Anti-Pattern Firewall" for `/dual-brainstorm` sessions. 
It contains common pitfalls and architectural regressions discovered in past sessions.

---

## Anti-Patterns (The "Firewall")

### ❌ Direct NL-to-API (Zero-Confirmation)
- **Status:** Active
- **Description:** Attempting to update the live game state (HP, conditions, deletions) directly from an LLM's natural language interpretation without an intermediate operator confirmation step.
- **Why it failed:** High risk for live production. LLMs can misinterpret "Fireball Grog" as "Delete Grog" or "Set Grog to 0 HP" erroneously.
- **Fix:** Always implement a "Draft" or "Stage Confirmation" state in the UI. Gemini should propose a `WhisperIntent`, and the human operator clicks "Confirm" to fire the REST call.

### ❌ DOM-Based High-Volume Particles
- **Status:** Active
- **Description:** Using individual DOM `<div>` or `<svg>` elements for magical disintegration or "glow" effects with hundreds of particles.
- **Why it failed:** Crashes mobile browsers (Cast layer) and drops frame rates on OBS browser sources (Audience layer).
- **Fix:** Use a single `<canvas>` element for complex particle systems or stick to simple CSS transitions on a few key elements.

### ❌ Synchronous AI in Main Loop (Latency Landmine)
- **Status:** Active
- **Description:** Directly calling an LLM or image generation API inside a synchronous or performance-critical function (like `broadcast()` or a request handler).
- **Why it failed:** External API latency (Gemini/Google) can block the server's heartbeat, causing UI stuttering, socket timeouts, and a degraded experience for all users.
- **Fix:** Use an **Asynchronous Sidecar Queue** or an **Event Subscriber** pattern. `broadcast()` should push to a buffer and return immediately; a background worker processes the buffer.
