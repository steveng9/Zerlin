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

## 5. 3D Platforms with Graduated Movement
Make platforms feel three-dimensional and animate in a graduated way (e.g. easing in/out, depth parallax, subtle tilt).

## 6. Spin Attack / Deflect
Add a spinning attack that also deflects incoming lasers — a 360° saber sweep triggered by a dedicated input.

## 7. Directional Force Jump Animations
- Force jump backward → backflip animation
- Force jump forward → front flip animation
(Currently both use the same jump arc)
- (possibly try disabling left/right movement control when in air for force jump, so the arc is locked in when the jump is triggered?)

## 8. Landing Impact Animations
When falling from above a certain height threshold, landing triggers either:
- A planting/absorb animation (hard stop, knees bent)
- An impact-absorbing somersault (rolling recovery)

---

## Architecture Refactor

The high-level separation of concerns (SceneManager, CollisionManager, SoundEngine,
Camera, NetworkManager, Animation) and the droid class hierarchy are solid foundations.
The following four refactors are listed in priority order — each is independent and can
be tackled one at a time without breaking the others.

### A. Extract scenes out of SceneManager (highest priority)

**Problem:** SceneManager is a ~1600-line god class. It owns entity arrays, spawn pools,
per-scene update/draw logic, camera shake state, training HUD rendering, the control
scheme overlay, powerup respawn queues, and multiplayer networking callbacks — all mixed
together. Each "scene" is currently a 200–300 line blob living inside one giant class,
connected by swapping `this.update` / `this.draw` function pointers at runtime.

**Fix:** Give each scene its own class:
- `OpeningScene`
- `LevelScene`
- `TrainingGroundScene`
- `CreditsScene`

Each scene class owns its own entity arrays (`droids`, `lasers`, `powerups`, etc.),
spawn logic, camera shake state, and update/draw methods. SceneManager becomes a thin
router: it holds a `currentScene` reference and delegates `update()` and `draw()` to it.
Transitions (`startLevelScene()`, `startTrainingGroundScene()`, etc.) become factory
methods that construct and activate the appropriate scene object.

**Benefit:** Each scene is self-contained and testable. Adding a new scene or game mode
no longer requires touching a monolithic file. The multiplayer training ground could even
be a subclass of `TrainingGroundScene` rather than a mode flag mixed into update logic.

---

### B. Extract a SnapshotManager for multiplayer sync

**Problem:** The snapshot serialize/deserialize/reconcile logic (~250 lines:
`_buildPlayerSnapshot`, `_serializePlayer`, `_serializeDroid`, `_serializeLaser`,
`_applyPlayerFromSnapshot`, `_applyEntitySnapshot`, `_getGhostDroidFromPool`,
`_createTrainingPowerup`) lives inside SceneManager but has nothing to do with scene
management. It will grow as more entity types are synced.

**Fix:** Extract a `SnapshotManager` class (or fold it into `NetworkManager` as a
serialization layer). It receives references to the entity arrays and player objects it
needs, and exposes two methods: `buildSnapshot()` and `applySnapshot(snap)`. SceneManager
just calls those two methods — it doesn't know the format.

**Benefit:** Multiplayer sync logic is isolated, easier to unit-test, and won't bloat
scene classes as the protocol evolves.

---

### C. Separate Level data from Level entity-spawning

**Problem:** `Level.js` conflates two responsibilities: (1) defining the level layout
as a 2D character grid with tile/background configs, and (2) instantiating concrete game
entities (droids, powerups, tiles) from that grid via `level.set()`. This means adding a
new level requires wiring entity constructors directly into the layout parser, and calling
`level.set()` has the side effect of constructing live game objects.

**Fix:** Split into:
- `LevelDefinition` (pure data: layout string, tile image paths, background layers,
  droid/powerup spawn specs) — no game object imports, easily serializable
- `LevelLoader` (factory: reads a `LevelDefinition` and constructs the actual
  `BasicDroid`, `HealthPowerUp`, `Tile`, etc. instances, returning them to the caller)

**Benefit:** Level definitions become portable data. New levels can be added without
touching entity construction code. `level.set()` side effects become explicit factory
calls.

---

### D. Formalize the ghost pattern for multiplayer entities

**Problem:** Ghost mode (suppressing simulation on client-side remote entities) is
currently implemented by duck-typing `entity.ghost = true` at runtime and adding `if
(this.ghost) { ... return; }` guards individually in `BasicDroid.update()`,
`DroidLaser.update()`, and `HomingLaser.update()`. As more entity types get synced, each
one needs its own guard manually added and there is no enforced contract.

**Fix:** Add a `ghost` property and dead-reckoning `ghostUpdate()` method to the
`AbstractDroid` and `DroidLaser` base classes, and have each `update()` call
`ghostUpdate()` and return early when `this.ghost` is true. Alternatively, a lightweight
`GhostEntity` mixin/wrapper that intercepts `update()` and replaces it with pure
dead-reckoning movement. Either way, the pattern becomes a single well-defined place
rather than repeated guards.

**Benefit:** Adding a new synced entity type (e.g. boss, moving platform) automatically
gets correct ghost behavior without copy-pasting guard logic. The contract is visible and
enforced at the base class level.
