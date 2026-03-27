# Zerlin

A Star Wars-themed 2D side-scrolling action game built with HTML5 Canvas. Created for TCSS 491 - Computational Worlds at University of Washington Tacoma.

**Authors:** Joshua Atherton, Michael Josten, Steven Golob

## Play

Open `index.html` in a browser, or visit the GitHub Pages deployment.

> Note: Most browsers block audio autoplay. You may need to interact with the page first before sound plays. If running locally, serve from a simple HTTP server (e.g. `python3 -m http.server`) rather than opening as a `file://` URL, as browsers restrict audio and image loading from the filesystem.

## Controls

| Action | Input |
|---|---|
| Move | A / D |
| Jump | W |
| Force Jump | Shift + W |
| Crouch | X |
| Roll | D + S (right) or A + S (left) |
| Slash | Space |
| Saber Throw | Left Click |
| Flip Lightsaber | Right Click |
| Lightning | Left Click + Shift (hold to charge) |
| Pause / Unpause | Enter |
| Skip Scene | Enter |

## Architecture

Pure client-side game — no server required. All logic runs in the browser.

```
index.html          — entry point, loads all scripts
js/                 — game logic (20 files)
  GameEngine.js     — main loop, input handling, requestAnimationFrame
  SceneManager.js   — level sequencing, opening/ending scenes, pause menu
  HeroEntities.js   — Zerlin (player), lightsaber, lightning, projectiles
  CollisionManager.js — AABB collision detection
  Level.js          — tile-based level layouts and background parallax layers
  Camera.js         — viewport tracking the player
  SoundEngine.js    — Howler.js wrapper for music and sound FX
  Boss.js           — flying boss enemy (beam cannon, bombs)
  DroidBoss.js      — leggy droid boss enemy
  DroidBasic.js     — basic enemy droids
  DroidUtil.js      — shared droid/laser behavior
  StatusBar.js      — HUD (health hearts, force meter, powerup timers)
  PowerUp.js        — collectible powerups (health, force, invincibility, laser)
  CheckPoint.js     — checkpoint respawn system
  Animation.js      — sprite sheet animation helper
  Lightning.js      — force lightning visual effect
  Spark.js          — spark particle effect
  Constants.js      — all game constants (level layouts, scene timing, physics)
  howler.js         — Howler.js audio library (bundled)
  Main.js           — asset loader, game bootstrap
img/                — sprite sheets and parallax backgrounds (PNG)
sound/              — music and SFX (OGG/MP3/WAV/M4A multi-format via Howler)
style.css           — minimal page layout
```

## Levels

1. **Kashyyyk Forest** — parallax tree/bat backgrounds, forest tiles
2. **Coruscant City** — hovering highway layers, city skyline
3. **Hoth Snow** — snow parallax, ice tiles, blizzard particles

Each level ends with a boss encounter.

## Sound

Audio is handled entirely client-side via [Howler.js](https://howlerjs.com/). Background music and sound FX can be toggled with the in-game music menu (visible during gameplay).
