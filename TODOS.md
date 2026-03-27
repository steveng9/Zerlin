# Zerlin — Feature TODO List

## 1. Playable Boss (Training Mode)
Add a "Play as Boss" option in the training ground that lets you control the Level 3 boss — fly around the arena and fire his laser cannon. Likely implemented as an alternate control mode in `trainingGroundUpdate` with a new player entity class wrapping the boss.

## 2. Multiplayer
Add local or online multiplayer support — two heroes fighting side-by-side (or against each other) in the training ground or a dedicated arena level.

## 3. Hero Customization (for Multiplayer)
Per-player customization screen before a multiplayer match:
- **Saber color** — pick blade hue (already wired in single-player via slider)
- **Movement style** — e.g. force jump height, roll speed, somersault behavior
- **Hero outfit** — swap sprite sheet / color palette for the Zerlin character

## 4. Playable Droid (Multiplayer)
Allow one player to take control of a droid type instead of a hero — fighting against the Jedi player. Would need droid-side input handling and a camera system that tracks both players.
