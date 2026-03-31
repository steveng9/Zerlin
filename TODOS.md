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


## 9. make 2-player fun and objective-driven. For example, implement keeping      
score of each player's kill count, and having there be some kind of prize for  
winning. Or build a simple co-op campaign, where the players have to work      
together to get through the levels.                                            


## 10. Add a feature where Zerlin can latch onto a driod (i.e. jump to it, then    
catch it) and then float around, dangling off the droid, and being able to     
control the droid's shooting, while hanging. When Zerlin catches the droid,    
the droid's flight path should dip a little from the sudden increase in        
weight, then rise back up. When the dip happens it should kindof follow the    
path of Zerlin in a way that makes sense; I mean, if Z catches the droid on    
his jump, but is in the ascent stage of his jump, then the droid's path should 
 react upward, not dip, to properly absorb both Z's momentum, and also dip     
after, absorbing Z's added weight.  


## 11. add power move where Z can do some cool spin / saber twirl 
and deflect all incoming lasers for a brief moment

## 12. some sort of force pull / push / manipulate to do something cool

## 13. add front-to-back cars flying cars to coruscant scene

## 14. add blood when laser hits Z (like how the sparks fly when they hit the saber)

## 15. Change movements of some of the Droids so that they don't fly within range of Z's lightsaber slash / throw. So Z is required to deflect lasers at it to destroy it.

## 






---


## Bugs:

- lightening and other artifacts freeze when Zerlin dies (during death animation). Should be just removed, or fade out as normal.
- somersault makes Z not begin falling, if somersault off of platform, until done with animation. Z should begin falling immediately.
- upper tile platform surface bleeds through tile face
- some animations with the saber conflict when the saber is doing something different
- make smaller Z's damge box (don't include his feet)
- when z dies, and falls over, if he's on a platform, he might be laying in the air off the edge of the platform. Instead, have him fall to floor, or where there is not floating

---

## Architecture Refactor ✅ Completed 2026-03-28

### A. Extract scenes out of SceneManager ✅

SceneManager reduced from ~1951 lines to ~454. Function-pointer swapping removed.
Six scene classes extracted to `js/scenes/`:
- `OpeningScene`, `LevelTransitionScene`, `CollectionScene`, `CreditsScene`
- `LevelScene`, `TrainingGroundScene`

UI entity classes (`PauseScreen`, `TextScreen`, `Overlay`, `AttributeCollectionScreen`)
extracted to `js/SceneEntities.js`. SceneManager is now a thin router — `update()` and
`draw()` delegate to `this.currentScene`. Scene classes receive `sm` (SceneManager) in
their constructor and access shared state via `this.sm.xxx`.

### B. Extract snapshot logic into TrainingGroundScene ✅ (partial)

All multiplayer serialize/deserialize methods (`_buildPlayerSnapshot`, `_serializePlayer`,
`_serializeDroid`, `_serializeLaser`, `_applyPlayerFromSnapshot`, `_applyEntitySnapshot`,
`_getGhostDroidFromPool`, `_createTrainingPowerup`) moved out of SceneManager and into
`TrainingGroundScene` where they belong. A dedicated `SnapshotManager.js` class is a
possible future step if this logic grows further.

### C. Separate Level entity-spawning into LevelLoader ✅

`LevelLoader.js` created as a static factory — parses layout strings and constructs
`BasicDroid`, `HealthPowerUp`, `Tile`, etc. instances, returning them to the caller.
`Level.set()` is now a 6-line wrapper around `LevelLoader.load()`. The old inline
`_parseTiles()` method (75+ lines) removed entirely.

### D. Formalize the ghost pattern ✅

`ghostUpdate()` added to `AbstractDroid` and `DroidLaser` base classes with the correct
dead-reckoning logic. Each subclass `update()` now just needs:
```js
if (this.ghost) { super.update(); return; }
```
`BasicDroid` simplified from an 8-line inline dead-reckoning block to a one-liner.
