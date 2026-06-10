---
name: apply-technical-occult-aesthetic
description: Apply the project's signature "Technical Occult" / "Digital Grimoire" aesthetic using hex-clips and glowing effects.
---

## When to Use
- Building or refactoring UI components for any TableRelay surface (Stage, Cast, Audience).
- Implementing character portraits, action buttons, or status badges.
- Aligning new features with the "Technical Occult" visual identity.

## Procedure

1. **Apply Signature Geometry**:
   - Use `clip-path` to create the hexagonal look.
   - **Portrait Hexagon (Vertical)**: For character photos or tall indicators.
     ```css
     clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
     ```
   - **Button Hexagon (Horizontal)**: For primary action buttons or horizontal labels.
     ```css
     clip-path: polygon(10% 0%, 90% 0%, 100% 50%, 90% 100%, 10% 100%, 0% 50%);
     ```
   - **Compact Hexagon (Thumbnail)**: For small previews or quick-selectors.
     ```css
     clip-path: polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%);
     ```

2. **Implement Glowing Effects**:
   - Standard CSS borders are often hidden by `clip-path`. Use `filter: drop-shadow` on a parent container or the element itself (if it has a background) to create a "border glow".
   - **Live State (Cyan)**:
     ```css
     filter: drop-shadow(0 0 4px var(--shadow-cyan));
     ```
   - **Focus/Structural (Amber)**:
     ```css
     filter: drop-shadow(0 0 6px rgba(200, 148, 74, 0.4));
     ```

3. **Typography and Case**:
   - Use `var(--font-display)` for labels.
   - Apply uppercase transform and wide tracking:
     ```css
     text-transform: uppercase;
     letter-spacing: 0.12em;
     font-weight: 700;
     ```

4. **Surface-Specific Accents**:
   - **Stage**: Use `--cyan` for live interactions and data density.
   - **Cast**: Use `--cast-amber` for the "Digital Grimoire" reference feel.
   - **Critical**: Use `--red` for low HP, negative conditions, or dangerous actions.

## Pitfalls and Fixes
- **Vanishing Borders**: Setting a `border` on a clipped element.
  - *Fix*: Use `drop-shadow` or wrap the element in a slightly larger clipped container with a background color.
- **Cropped Content**: Clipping hides the corners of images or text.
  - *Fix*: Add internal padding or use `calc(100% - 4px)` sizing for inner elements to prevent content from hitting the clip edges.

## Verification
- Confirm the component uses `clip-path` with one of the standard TableRelay polygons.
- Verify that `var(--shadow-*)` or a hex-coded glow is visible.
- Check that labels are all-caps with wide tracking.
