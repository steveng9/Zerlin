# Multiplayer Co-op Implementation Plan

Branch: `multiplayer` (merge to `master` only when fully ironed out)

## Architecture Summary

- **P2P WebRTC via PeerJS** (CDN, no npm, no game server)
- **Host-authoritative snapshots**: P1 runs full simulation, sends state to P2 at 20 Hz; P2 sends inputs to P1
- **Co-op**: both players fight droids together; no friendly fire
- **Room codes**: P1 hosts → gets 6-char code → P2 enters it to join
- PeerJS Cloud handles signaling (free, no infrastructure to maintain)

## Collision Rules (co-op simplification)
- Lasers damage either player (same as single-player laser-on-zerlin)
- Deflected lasers from either saber harm droids (same as single-player)
- No friendly fire between players

## Camera
- Follows midpoint of P1.x and P2.x
- Clamped to level bounds as before

---

## Phases

### Phase 1 — Networking scaffolding [ ]
- [ ] Add PeerJS CDN to `index.html`
- [ ] Write `js/NetworkManager.js` (host/join/send/receive)
- [ ] Add lobby UI to `index.html` + `style.css`
- [ ] Test: two browsers can connect and exchange messages
- [ ] Commit: `multiplayer: Phase 1 - NetworkManager and lobby UI`

### Phase 2 — Second player in local mode [ ]
- [ ] Add `Zerlin2` class to `HeroEntities.js`
  - Same physics as Zerlin, input from `network.lastReceivedInput` (or WASD locally for testing)
  - Placeholder sprite (reuse Zerlin's until art is ready)
  - Separate health bar (bottom-right)
- [ ] SceneManager: create both players in training ground multiplayer mode
- [ ] Camera: follow midpoint of both players
- [ ] Commit: `multiplayer: Phase 2 - Zerlin2 entity and dual-player training ground`

### Phase 3 — Wire networking to game state [ ]
- [ ] Snapshot serializer: pack world state (both players, droids, lasers, killCount)
- [ ] Host: serialize + send snapshot at 20 Hz
- [ ] Client (P2): deserialize snapshot, update entity positions
- [ ] Client (P2): capture keyboard/mouse input, send to P1 each frame
- [ ] P1: apply received P2 inputs to Zerlin2's update()
- [ ] Commit: `multiplayer: Phase 3 - game state sync over WebRTC`

### Phase 4 — Co-op collision rules [ ]
- [ ] `CollisionManager.laserOnZerlin()` → check both P1 and P2
- [ ] `CollisionManager.droidOnSaber()` → check both sabers
- [ ] `CollisionManager.laserOnSaber()` → check both sabers for deflection
- [ ] Test: laser deflection, saber hits, damage on both players
- [ ] Commit: `multiplayer: Phase 4 - co-op collision rules`

### Phase 5 — Polish & resilience [ ]
- [ ] Local prediction for P2's own character (run physics locally, lerp to authoritative pos on snapshot)
- [ ] Disconnect handling: pause + reconnect prompt
- [ ] Lobby: copy-to-clipboard button for room code
- [ ] Add multiplayer entry point to main menu
- [ ] Commit: `multiplayer: Phase 5 - local prediction and UX polish`

### Phase 6 — P2 Sprites [ ]
- [ ] Steven creates P2 character sprite sheets (same format/dimensions as Zerlin's)
  - Sheets needed: idle, run, jump, crouch, slash (multi-frame), somersault, death, arm/saber
  - Suggested naming: `img/zerlin2_idle.png`, `img/zerlin2_run.png`, etc.
- [ ] Swap placeholder sprite in `Zerlin2` for real art
- [ ] Set P2 default saber hue to something distinct from P1
- [ ] Commit: `multiplayer: Phase 6 - P2 sprites`

---

## Current Status
- Branch `multiplayer` created
- Plan written
- **Next: Phase 1**

## Key Files to Touch
- `index.html` — add PeerJS CDN, lobby UI
- `style.css` — lobby styles, P2 health bar
- `js/NetworkManager.js` — NEW
- `js/HeroEntities.js` — add Zerlin2 class
- `js/SceneManager.js` — dual-player support, snapshot send/receive
- `js/CollisionManager.js` — co-op collision rules
- `js/Camera.js` — follow midpoint
- `js/Constants.js` — P2 constants (health, spawn position, default saber hue)
