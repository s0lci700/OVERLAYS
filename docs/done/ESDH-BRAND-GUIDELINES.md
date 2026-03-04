# ESDH Brand Guidelines: "Dados & Risas" Implementation

This document provides a formal framework for maintaining the **ESDH Producciones** (El Sentido del Humor) brand identity within the **Dados & Risas** (D&R) project. Adhering to these guidelines ensures the overlay system feels authentic to the cast, the audience (Uh Lalá), and the broader Chilean digital culture.

---

## 1. Core Brand Personality

### Voice & Tone
- **Professional Irreverence:** The system should be technically flawless (low latency, high polish) but visually and textually playful.
- **Chilean Identity:** Use local "modismos" in the UI labels and feedback.
    - *Example:* Instead of "Critical Failure," use "¡LA MEDIA PIFIA!" or "F por Kael."
    - *Example:* Instead of "Healing," use "Su Completo de Vida" or "Sanación."
- **Self-Deprecating Humor:** The UI shouldn't take itself too seriously. If a character is at 1 HP, the UI might display a "Sticker" of a "Tío Aceite" or a "Cerca del Arpa" reference.

---

## 2. Visual Identity

### A. Color Palette
The primary palette is high-contrast, designed for visibility on stream and mobile screens.

| Element | Hex Code | Purpose |
| :--- | :--- | :--- |
| **ESDH Yellow** | `#FFD200` | Primary brand color, logo accents, Nat 20 highlights. |
| **ESDH Black** | `#000000` | Deep backgrounds, high-contrast text on yellow. |
| **Charcoal Grey** | `#1A1A1A` | Card backgrounds, sidebar surfaces. |
| **"Patria" Red** | `#D0021B` | Damage pips, "Pifia" flash, critical health (pulsing). |
| **Neon Cyan** | `#00D4E8` | Healing, selection rings, active character glow. |

### B. Typography
- **Display (Headings/Names):** **Impact** or **Bebas Neue**. These evoke the "Meme" aesthetic while remaining readable at small sizes.
- **UI (Buttons/Body):** **Inter** or **Montserrat**. Clean, modern, and professional (the "Pro" side of the productora).
- **Values (HP/Dice):** **JetBrains Mono** or **Space Mono**. For that "technical/gaming" data feel.

### C. Iconography & "Meme Logic"
- Avoid generic fantasy icons where possible. 
- Use "Sticker-style" graphics (bold white outlines) for conditions.
- **Nat 20 / Nat 1:** These should be "Visual Events." A Nat 20 should trigger a high-impact flash of ESDH Yellow and a celebratory meme sticker (e.g., a "Factos" or "Uh Lalá" logo).

---

## 3. Interaction Design (The "ESDH Flow")

### The "Sticker" System
ESDH content often uses visual puncuation. The D&R system should support a **Socket.io event: `show_sticker`**.
- **Triggers:** High damage, critical rolls, or DM manual override.
- **Visuals:** A 2D "sticker" appears over the character's portrait for 2-3 seconds and then fades.
- **Content:** Local memes (e.g., "Hermoso", "Brigado", "Atangana").

### Tactical Feedback
- **HP Changes:** Should be "juicy." When a character takes damage, the bar shouldn't just shrink; it should "shake" (Screen Shake) and show a red flash (`--red`).
- **Turn Transition:** The "Next Player" notification should be as clear as a "Breaking News" (Último Minuto) banner in a Chilean matinal.

---

## 4. Cast Archetypes (Persona-Driven UI)

Each member of the ESDH trio interacts with the brand differently:

- **The Architect (Héctor):** UI is data-dense, dark, and precise. Focuses on "The Plan."
- **The Speedster (Luis):** UI is minimal and fast. Focuses on "The Remate" (The Finish).
- **The Pop-Bard (Marcelo):** UI is colorful and interactive. Focuses on "The Community."

---

## 5. Implementation Checklist

When building a new component for D&R, ask:
1. [ ] Does it use **ESDH Yellow (`#FFD200`)** for success/branding?
2. [ ] Is the typography **Impact** or **Bebas Neue** for display labels?
3. [ ] Does it include a **Chilean "modismo"** or meme reference in its error/success state?
4. [ ] Does the animation feel **"Snappy"** (fast transition, high impact)?
5. [ ] Is the contrast high enough for a **mobile viewer** on a small screen?

---

## 6. Conclusion

Adhering to these guidelines transforms **Dados & Risas** from a generic D&D tool into an official extension of the **ESDH Producciones** universe. It bridges the gap between the complexity of tabletop RPGs and the fast-paced, irreverent world of Chilean digital comedy.
