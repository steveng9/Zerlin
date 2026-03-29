/*
Zerlin
TCSS 491 - Computational Worlds
Joshua Atherton, Michael Josten, Steven Golob
*/

/*
// -  =  tile
// =  =  moving tile
// ~  =  falling tile
// d  =  basic droid
// s  =  scatter shot droid
// b  =  slow burst droid
// f  =  fast burst droid
// m  =  multi-shot droid
// n  =  sniper droid
//
// H  =  health powerup
// F  =  force powerup
// I  =  invincibility powerup
// S  =  split-shot powerup
// T  =  tiny mode powerup
// W  =  homing laser power up
//
// C  =  checkpoint
//
// *  =  leggy droid boss
// X  =  Boss
*/

const smc = Constants.SceneManagerConstants;
const lvlConst = Constants.LevelConstants;

/**
 * Thin scene router.
 *
 * Owns shared infrastructure (camera, entities arrays, Zerlin, collision
 * manager, etc.) and delegates all update/draw work to the active scene
 * object via `this.currentScene`.
 *
 * Scene transition methods (start*Scene) perform any SceneManager-level
 * setup, then construct the appropriate scene class and assign it to
 * `this.currentScene`.
 */
class SceneManager2 {

  constructor(game) {
    this.game = game;
    this.camera = new Camera(this, 0, 0, this.game.ctx.canvas.width, this.game.ctx.canvas.height);
    this.checkPoint = new CheckPoint(this.game, 0, 0);
    this.infiniteHealth = true;
    this.Zerlin = new Zerlin(this.game, this.camera, this);
    this.boss = null;
    this.collisionManager = new CollisionManager(this.game, this);
    this.levelNumber = 1;
    this.newLevel = true;
    this.canPause = false;
    this.pauseScreen = new PauseScreen(this.game);
    this.musicMenu = new MusicMenu(this.game, 1050, 50, [
      this.game.assetManager.getAsset('img/ui/music_menu.png'),
      this.game.assetManager.getAsset('img/ui/music_menu_xmusic.png'),
      this.game.assetManager.getAsset('img/ui/music_menu_xfx.png')
    ]);
    this.currentScene = null;
  }

  // ── Bootstrap ─────────────────────────────────────────────────────────────

  init() {
    this.buildLevels();
    document.getElementById("formOverlay").style.display = "none";
    this.startTrainingGroundScene();
  }

  buildLevels() {
    var LEVEL_ONE_BACKGROUNDS = [
      new ParallaxScrollBackground(this.game, this, 'img/levels/dagobah/backgroundTrees4.png', 1, 5200),
      new ParallaxFloatingBackground(this.game, this, 'img/levels/dagobah/backgroundStars3.png', 1, 5000, 0),
      new ParallaxGodLightBackground(this.game, this, 'img/levels/dagobah/god light new 3.png', 4500),
      new ParallaxScrollBackground(this.game, this, 'img/levels/dagobah/backgroundTrees3.png', 1, 2500),
      new ParallaxBirdBackground(this.game, this, 'img/enemies/dagobah bat.png', .17, false, 200, 500),
      new ParallaxBirdBackground(this.game, this, 'img/enemies/dagobah bat left.png', .45, true, 1300, 500),
      new ParallaxBirdBackground(this.game, this, 'img/enemies/dagobah bat.png', .3, false, 2300, 500),
      new ParallaxGodLightBackground(this.game, this, 'img/levels/dagobah/god light new 2.png', 1900),
      new ParallaxFloatingBackground(this.game, this, 'img/levels/dagobah/backgroundStars1.png', 1, 1650, Math.PI/2),
      new ParallaxScrollBackground(this.game, this, 'img/levels/dagobah/backgroundTrees2.png', 1, 1000),
      new ParallaxGodLightBackground(this.game, this, 'img/levels/dagobah/god light new 1.png', 800),
      new ParallaxFloatingBackground(this.game, this, 'img/levels/dagobah/backgroundStars2.png', 1, 800, Math.PI*1.2),
      new ParallaxScrollBackground(this.game, this, 'img/levels/dagobah/backgroundTrees1.png', 1, 600),
    ];
    var LEVEL_ONE_TILES = {
      centerTile: 'img/levels/dagobah/forest_center_tile.png',
      leftTile: 'img/levels/dagobah/forest_left_tile.png',
      rightTile: 'img/levels/dagobah/forest_right_tile.png',
      leftRightTile: 'img/levels/dagobah/forest_both_rounded_tile.png'
    };

    var CITY_LEVEL_BACKGROUNDS = [
      new ParallaxScrollBackground(this.game, this, 'img/levels/coruscant/city_background.png', 1, 5200),
      new ParallaxFloatingBackground(this.game, this, 'img/levels/coruscant/city_clouds2.png', 1, 8000, Math.PI*.67),
      new ParallaxScrollBackground(this.game, this, 'img/levels/coruscant/city_buildings_back.png', 1, 2500),
      new ParallaxHoverHighwayBackground(this.game, this, 'img/levels/coruscant/highway layer 2.png', 4000, false),
      new ParallaxHoverHighwayBackground(this.game, this, 'img/levels/coruscant/highway layer 2 right.png', 4000, true),
      new ParallaxScrollBackground(this.game, this, 'img/levels/coruscant/city_buildings_middle.png', 1, 1400),
      new ParallaxHoverHighwayBackground(this.game, this, 'img/levels/coruscant/highway layer 1.png', 1000, false),
      new ParallaxHoverHighwayBackground(this.game, this, 'img/levels/coruscant/highway layer 1 right.png', 1000, true),
      new ParallaxScrollBackground(this.game, this, 'img/levels/coruscant/city_buildings_foreground.png', 1, 1000),
      new ParallaxHoverHighwayBackground(this.game, this, 'img/levels/coruscant/highway layer 3.png', 350, false),
      new ParallaxHoverHighwayBackground(this.game, this, 'img/levels/coruscant/highway layer 3 right.png', 350, true),
      new ParallaxFloatingBackground(this.game, this, 'img/levels/coruscant/city_clouds_left.png', 1, 1000, 0),
      new ParallaxFloatingBackground(this.game, this, 'img/levels/coruscant/city_clouds_center.png', 1, 800, Math.PI*1.33)
    ];
    var CITY_LEVEL_TILES = {
      centerTile: 'img/levels/coruscant/city_tile_center.png',
      leftTile: 'img/levels/coruscant/city_tile_left.png',
      rightTile: 'img/levels/coruscant/city_tile_right.png',
      leftRightTile: 'img/levels/coruscant/city_tile_left_right.png'
    };

    var LEVEL_THREE_BACKGROUNDS = [
      new ParallaxScrollBackground(this.game, this, 'img/levels/hoth/snow level 0.png', 1, 6000),
      new ParallaxScrollBackground(this.game, this, 'img/levels/hoth/snow level 1.png', 1, 4500),
      new ParallaxScrollBackground(this.game, this, 'img/levels/hoth/snow level 2.png', 1, 3000),
      new ParallaxScrollBackground(this.game, this, 'img/levels/hoth/snow level 3.png', 1, 1500),
      new ParallaxSnowBackground(this.game, this, 2300),
      new ParallaxSnowBackground(this.game, this, 2200),
      new ParallaxSnowBackground(this.game, this, 2100),
      new ParallaxSnowBackground(this.game, this, 1800),
      new ParallaxScrollBackground(this.game, this, 'img/levels/hoth/snow level 4.png', 1, 1000),
      new ParallaxSnowBackground(this.game, this, 1500),
      new ParallaxSnowBackground(this.game, this, 1300),
      new ParallaxSnowBackground(this.game, this, 1100),
      new ParallaxSnowBackground(this.game, this, 1000),
      new ParallaxScrollBackground(this.game, this, 'img/levels/hoth/snow level 5.png', 1, 500),
      new ParallaxSnowBackground(this.game, this, 800),
      new ParallaxSnowBackground(this.game, this, 700),
      new ParallaxScrollBackground(this.game, this, 'img/levels/hoth/snow level 6.png', 1, 250),
      new ParallaxSnowBackground(this.game, this, 600),
      new ParallaxSnowBackground(this.game, this, 500),
      new ParallaxSnowBackground(this.game, this, 400)
    ];
    var LEVEL_THREE_TILES = {
      centerTile: 'img/levels/hoth/ice_tile_center.png',
      leftTile: 'img/levels/hoth/ice_tile_left.png',
      rightTile: 'img/levels/hoth/ice_tile_right.png',
      leftRightTile: 'img/levels/hoth/ice_tile_left_right.png'
    };

    this.levels = [];
    this.level = null;
    this.levelBackgrounds = [];
    this.levels.push(new Level(this.game, this, lvlConst.MIKE_LEVEL_ONE, LEVEL_ONE_BACKGROUNDS, LEVEL_ONE_TILES));
    this.levels.push(new Level(this.game, this, lvlConst.CITY_LEVEL, CITY_LEVEL_BACKGROUNDS, CITY_LEVEL_TILES));
    this.levels.push(new Level(this.game, this, lvlConst.MIKE_LEVEL_THREE, LEVEL_THREE_BACKGROUNDS, LEVEL_THREE_TILES));
    this.trainingBgIndex = 0;
    this.trainingLevels = [
      new Level(this.game, this, lvlConst.TRAINING_GROUND_LAYOUT, LEVEL_ONE_BACKGROUNDS, LEVEL_ONE_TILES),
      new Level(this.game, this, lvlConst.TRAINING_GROUND_LAYOUT, CITY_LEVEL_BACKGROUNDS, CITY_LEVEL_TILES),
      new Level(this.game, this, lvlConst.TRAINING_GROUND_LAYOUT, LEVEL_THREE_BACKGROUNDS, LEVEL_THREE_TILES)
    ];
    this.trainingLevel = this.trainingLevels[0];
  }

  // ── Scene dispatch ────────────────────────────────────────────────────────

  update() {
    this.currentScene.update();
  }

  draw() {
    this.currentScene.draw();
  }

  // ── Scene transitions ─────────────────────────────────────────────────────

  startOpeningScene() {
    this.restoreOriginalLaserSpeeds();
    this.canPause = false;
    document.getElementById("trainingControls").style.display = "none";
    this.currentScene = new OpeningScene(this);
  }

  startLevelTransitionScene() {
    this.canPause = false;
    this.currentScene = new LevelTransitionScene(this);
  }

  startLevelScene() {
    this.restoreOriginalLaserSpeeds();
    document.getElementById("trainingControls").style.display = "none";
    this.camera.x = 0;
    this.camera.y = 0;
    this.level = this.levels[this.levelNumber - 1];
    if (this.newLevel) {
      this.checkPoint = new CheckPoint(this.game, this.camera.width * cc.ZERLIN_POSITION_ON_SCREEN, 0);
    }
    this.newLevel = false;
    this.droids = [];
    this.lasers = [];
    this.powerups = [];
    this.otherEntities = [];
    this.activePowerups = [];
    this.boss = null;
    this.level.set();
    this.addEntity(new HealthStatusBar(this.game, this, 25, 25));
    this.addEntity(new ForceStatusBar(this.game, this, 50, 50));
    this.Zerlin.reset();
    this.canPause = false;
    this.game.audio.playSoundFx(this.game.audio.lightsaber, 'lightsaberOn');
    this.game.audio.playSoundFx(this.game.audio.saberHum);
    this.currentScene = new LevelScene(this);
  }

  startCollectionScene() {
    this.canPause = false;
    this.currentScene = new CollectionScene(this);
  }

  startCreditsScene() {
    this.canPause = false;
    this.currentScene = new CreditsScene(this);
  }

  startTrainingGroundScene() {
    this._setupTrainingGround();
    this.currentScene = new TrainingGroundScene(this, false);
  }

  startMultiplayerTrainingScene() {
    this._setupTrainingGround();
    this.currentScene = new TrainingGroundScene(this, true);
  }

  /**
   * Shared setup for both single-player and multiplayer training sessions.
   * Resets entity arrays, loads the level, and initialises training config.
   * Does NOT create a scene — callers do that so each can pass the right flag.
   */
  _setupTrainingGround() {
    this.game.audio.campFire.stop();
    this.game.audio.endAllSoundFX();
    this.camera.x = 0;
    this.camera.y = 0;
    this.level = this.trainingLevel;
    this.checkPoint = new CheckPoint(this.game, this.camera.width * cc.ZERLIN_POSITION_ON_SCREEN, 0);
    this._nextEntityId = 1;
    this.droids = [];
    this.lasers = [];
    this.powerups = [];
    this.otherEntities = [];
    this.activePowerups = [];
    this.boss = null;
    this.level.set();

    // Initialize training config only on first entry; preserve across respawns
    if (!this.enabledDroidTypes) {
      this.enabledDroidTypes = new Set();
      if (smc.TRAINING_DEFAULT_BASIC)      this.enabledDroidTypes.add('BasicDroid');
      if (smc.TRAINING_DEFAULT_SCATTER)    this.enabledDroidTypes.add('ScatterShotDroid');
      if (smc.TRAINING_DEFAULT_SLOW_BURST) this.enabledDroidTypes.add('SlowBurstDroid');
      if (smc.TRAINING_DEFAULT_FAST_BURST) this.enabledDroidTypes.add('FastBurstDroid');
      if (smc.TRAINING_DEFAULT_SNIPER)     this.enabledDroidTypes.add('SniperDroid');
      if (smc.TRAINING_DEFAULT_MULTISHOT)  this.enabledDroidTypes.add('MultishotDroid');
    }
    if (this.trainingTargetDroids === undefined) this.trainingTargetDroids = smc.TRAINING_DEFAULT_DROIDS;
    if (!this.trainingOrigLaserSpeeds) {
      this.trainingOrigLaserSpeeds = {
        basic:     Constants.DroidBasicConstants.BASIC_DROID_LASER_SPEED,
        leggy:     Constants.DroidBasicConstants.LEGGY_DROID_LASER_SPEED,
        slowburst: Constants.DroidBasicConstants.SLOWBURST_DROID_LASER_SPEED,
        fastburst: Constants.DroidBasicConstants.FASTBURST_DROID_LASER_SPEED,
        sniper:    Constants.DroidBasicConstants.SNIPER_DROID_LASER_SPEED
      };
    }
    if (this.trainingLaserMult === undefined) this.trainingLaserMult = smc.TRAINING_DEFAULT_LASER_MULT;
    this.setTrainingLaserSpeed(this.trainingLaserMult);

    this.addEntity(new HealthStatusBar(this.game, this, 25, 25));
    this.addEntity(new ForceStatusBar(this.game, this, 50, 50));
    this.Zerlin.maxHealth = 15;
    this.Zerlin.maxForce = 15;
    this.Zerlin.reset();
    this.Zerlin.setHealth();

    this.canPause = false;
    document.getElementById("trainingControls").style.display = "block";
    this.game.audio.playSoundFx(this.game.audio.lightsaber, 'lightsaberOn');
    this.game.audio.playSoundFx(this.game.audio.saberHum);
  }

  // ── Entity management ─────────────────────────────────────────────────────

  setCheckPoint(checkPoint) {
    this.checkPoint = checkPoint;
  }

  addEntity(entity) {
    this.otherEntities.push(entity);
  }

  addDroid(droid) {
    this.droids.push(droid);
  }

  addLaser(laser) {
    if (!laser.id) laser.id = this._nextEntityId++;
    this.lasers.push(laser);
  }

  addPowerup(powerup) {
    this.powerups.push(powerup);
  }

  addActivePowerup(powerup) {
    if (this.activePowerups.length == 0) {
      this.activePowerups.push(new PowerupStatusBar(this.game, this, 0, 0, powerup));
    } else {
      var powerupExists = false;
      var pStatusBar;
      for (var i = 0; i < this.activePowerups.length; i++) {
        var activePowerup = this.activePowerups[i].getPowerup();
        if (powerup.constructor.name === activePowerup.constructor.name) {
          powerupExists = true;
          pStatusBar = this.activePowerups[i];
        }
      }
      if (powerupExists) {
        pStatusBar.reset();
      } else {
        this.activePowerups.push(new PowerupStatusBar(this.game, this, 0, 0, powerup));
      }
    }
  }

  // ── Pause ─────────────────────────────────────────────────────────────────

  pause() {
    if (this.canPause) {
      this.paused = true;
      this.game.timer.disable();
    }
  }

  unpause() {
    this.paused = false;
    this.game.timer.enable();
  }

  // ── Multiplayer targeting ─────────────────────────────────────────────────

  /** Returns the alive player nearest to fromX. Used by droid targeting. */
  nearestPlayer(fromX) {
    var z1 = this.Zerlin;
    var scene = this.currentScene;
    if (scene && scene.multiplayerActive && scene.Zerlin2) {
      var z2 = scene.Zerlin2;
      if (!z2.alive) return z1;
      if (!z1.alive) return z2;
      return Math.abs(fromX - z1.x) <= Math.abs(fromX - z2.x) ? z1 : z2;
    }
    return z1;
  }

  // ── Training helpers (called from GameEngine.js UI controls) ─────────────

  setTrainingLaserSpeed(mult) {
    this.trainingLaserMult = mult;
    if (!this.trainingOrigLaserSpeeds) return;
    var o = this.trainingOrigLaserSpeeds;
    Constants.DroidBasicConstants.BASIC_DROID_LASER_SPEED     = Math.round(o.basic     * mult);
    Constants.DroidBasicConstants.LEGGY_DROID_LASER_SPEED      = Math.round(o.leggy     * mult);
    Constants.DroidBasicConstants.SLOWBURST_DROID_LASER_SPEED  = Math.round(o.slowburst * mult);
    Constants.DroidBasicConstants.FASTBURST_DROID_LASER_SPEED  = Math.round(o.fastburst * mult);
    Constants.DroidBasicConstants.SNIPER_DROID_LASER_SPEED     = Math.round(o.sniper    * mult);
  }

  restoreOriginalLaserSpeeds() {
    if (!this.trainingOrigLaserSpeeds) return;
    var o = this.trainingOrigLaserSpeeds;
    Constants.DroidBasicConstants.BASIC_DROID_LASER_SPEED     = o.basic;
    Constants.DroidBasicConstants.LEGGY_DROID_LASER_SPEED      = o.leggy;
    Constants.DroidBasicConstants.SLOWBURST_DROID_LASER_SPEED  = o.slowburst;
    Constants.DroidBasicConstants.FASTBURST_DROID_LASER_SPEED  = o.fastburst;
    Constants.DroidBasicConstants.SNIPER_DROID_LASER_SPEED     = o.sniper;
  }

  setDroidTypeEnabled(typeName, enabled) {
    if (!this.enabledDroidTypes) return;
    if (enabled) {
      this.enabledDroidTypes.add(typeName);
    } else {
      this.enabledDroidTypes.delete(typeName);
      // Remove any live droids of this type immediately
      if (this.droids) {
        for (let i = this.droids.length - 1; i >= 0; i--) {
          if (this.droids[i].constructor.name === typeName) {
            this.droids.splice(i, 1);
          }
        }
      }
    }
    // Re-filter the queued pool in the active training scene
    if (this.currentScene && this.currentScene.trainingDroidPool) {
      this.currentScene.trainingDroidPool = this.currentScene.trainingDroidPool.filter(
        d => this.enabledDroidTypes.has(d.constructor.name)
      );
    }
  }

  setTrainingBackground(index) {
    this.trainingBgIndex = index;
    this.trainingLevel = this.trainingLevels[index];
    this.startTrainingGroundScene();
  }

  toggleInfiniteHealth() {
    this.infiniteHealth = !this.infiniteHealth;
    this.Zerlin.infiniteHealth = this.infiniteHealth;
    if (this.currentScene && this.currentScene.Zerlin2) {
      this.currentScene.Zerlin2.infiniteHealth = this.infiniteHealth;
      this.currentScene.Zerlin2.setHealth();
    }
    this.Zerlin.setHealth();
  }

  // ── Misc ──────────────────────────────────────────────────────────────────

  saveProgress() {

  }
}
