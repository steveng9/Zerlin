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

### Phase 1 — Networking scaffolding [x]
- [x] Add PeerJS CDN to `index.html`
- [x] Write `js/NetworkManager.js` (host/join/send/receive)
- [x] Add lobby UI to `index.html` + `style.css`
- [x] Test: two browsers can connect and exchange messages
- [x] Commit: `multiplayer: Phase 1 - NetworkManager and lobby UI`

### Phase 2 — Second player in local mode [x]
- [x] Add `Zerlin2` class to `HeroEntities.js`
- [x] Placeholder sprite (reuses Zerlin's until P2 art is ready)
- [x] P2 status bars (top-right of screen)
- [x] SceneManager: create both players in training ground multiplayer mode
- [x] Camera: follow midpoint of both players
- [x] Commit: `multiplayer: Phase 2 - Zerlin2 entity and dual-player training ground`

### Phase 3 — Wire networking to game state [x]
- [x] Snapshot serializer: player positions, health, force, saber angle
- [x] Host: serialize + send player snapshot at 20 Hz
- [x] Client: apply snapshot (P1 position, P2 reconciliation) before local sim
- [x] Client: send keys/mouse/click to host every frame
- [x] Zerlin2.update() host-aware: host=received input, client=local input
- [x] Note: droids/lasers run independently per machine (each fights their own) — full entity sync deferred to polish phase
- [x] Commit: `multiplayer: Phase 3 - game state sync over WebRTC`

### Phase 4 — Co-op collision rules [x]
- [x] `CollisionManager.laserOnZerlin()` → `_laserOnPlayer(zerlin)` helper called for both players; `!laser.removeFromWorld` guard prevents double-hit
- [x] `CollisionManager.droidOnSaber()` → `_droidOnPlayerSaber(zerlin)` helper called for both players
- [x] `CollisionManager.laserOnSaber()` → `_laserOnPlayerSaber(zerlin)` helper called for both sabers; deflect methods accept zerlin param
- [x] `isCollidedWithSaber(laser, lightsaber)` — lightsaber param instead of hardcoded Z1
- [x] Droid targeting: `SceneManager.nearestPlayer(fromX)` helper; `BasicDroid.get target()` getter (inherited by all droid subclasses and LeggyDroidBoss); replaced all `this.sceneManager.Zerlin` in DroidBasic.js and DroidBoss.js
- [x] Test: laser deflection, saber hits, damage on both players
- [x] Bug fix: Z2's saber collision line stale on host — `_applySnapshot` now calls `updateCollisionLine()` after setting `lightsaber.angle`
- [x] Commit: `multiplayer: Phase 4 - co-op collision rules`

### Phase 5 — Polish & resilience [~]
- [ ] Local prediction for P2's own character — defer until remote latency is tested
- [ ] Disconnect handling: pause + reconnect prompt
- [x] Lobby: copy-to-clipboard button with "COPIED!" feedback (was already wired; added visual confirmation)
- [x] Multiplayer entry point in cheat buttons bar (was already implemented)
- [x] Entity sync: droids and lasers now fully synced host→client via snapshot (ghost pattern)
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
- Phase 1 complete (committed `94c10b1`) ✓
- Phase 2 complete ✓
- Phase 3 complete (commit `e8ccb8e`); multiple bug-fix commits
- Phase 3 fully verified ✓ — both players visible and synced across browsers
- Phase 4 complete ✓
- Entity sync complete ✓ — droids and lasers ghost-synced; CollisionManager host-only in multiplayer — **Next: Phase 5 polish**
- Bug fix: Z1's saber collision line on P2's screen was stale; fixed by calling `updateCollisionLine()` after angle override
- Bug fix: Z2's saber collision line stale on host — `_applySnapshot` now calls `updateCollisionLine()`
- Bug fix: Z1 saber throw, lightning, and orb not visible on P2's screen — synced via `airbornSaber` position, `totalLightningFired` counter, and `orbActive` flag
- Arch refactor: `Lightsaber.ghost = true` blocks all input handling on remote saber; `armSpriteKey` getter+setter replaces multi-boolean arm sprite logic — new arm sprites require only one map entry, no sync changes
- Bug fix: orb position off by one frame (angle stale at orb.update time) — recompute orb x/y after setting ls.angle in override block
- Bug fix: orb grew indefinitely after bolt fired (shocking=true but orb=null) — use `orbActive: ls.orb !== null` instead of `shocking`
- Bug fix: saber angle discrepancy between views — `bounceOffset` decay moved outside ghost guard; `bounceOffset` serialized and applied each frame

### Phase 3 bug fixes (all committed together):
- `closeLobby()` was calling `network.disconnect()` on successful connect — fixed by splitting into `closeUI()` (success path) vs `closeLobby()` (cancel path)
- SFX disabled by default (set `soundFxMuted = true` at init)
- Z1 animation state (somersaulting, slashing, crouching, forceJumping, facingRight, saber arm sprite) now synced to P2's screen every frame via `lastP1State`
- `slashZone` initialized to `{}` in `reset()` to prevent crash when snapshot sets `slashing=true` before `startSlash()` runs
- CollisionManager null-guard on `slashZone` access
- Fake keys/mouse strategy: fake mouse at `Zerlin.x - camera.x` (no spurious facing flips); fake direction keys from `lastP1State.direction` (prevents `deltaX=0` decel that caused choppiness when facing right)

## Key Files to Touch
- `index.html` — add PeerJS CDN, lobby UI
- `style.css` — lobby styles, P2 health bar
- `js/NetworkManager.js` — NEW
- `js/HeroEntities.js` — add Zerlin2 class
- `js/SceneManager.js` — dual-player support, snapshot send/receive
- `js/CollisionManager.js` — co-op collision rules
- `js/Camera.js` — follow midpoint
- `js/Constants.js` — P2 constants (health, spawn position, default saber hue)
