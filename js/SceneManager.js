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
 * Manage scene transitions between levels and cinematics.
 */
class SceneManager2 {

  constructor(game) {
    this.game = game;
    this.camera = new Camera(this, 0, 0, this.game.ctx.canvas.width, this.game.ctx.canvas.height);
    this.checkPoint = new CheckPoint(this.game, 0, 0);
    this.sceneEntities = [];
    this.infiniteHealth = true;
    this.Zerlin = new Zerlin(this.game, this.camera, this);
    this.boss = null;
    this.collisionManager = new CollisionManager(this.game, this);
    /* Edit this to change levels */
    this.levelNumber = 1;
    this.newLevel = true;
    this.canPause = false;
    this.pauseScreen = new PauseScreen(this.game);
    this.musicMenu = new MusicMenu(this.game, 1050, 50, [
      this.game.assetManager.getAsset('img/music_menu.png'),
      this.game.assetManager.getAsset('img/music_menu_xmusic.png'),
      this.game.assetManager.getAsset('img/music_menu_xfx.png')
    ]);
  }

  init() {
    this.buildLevels();
    document.getElementById("formOverlay").style.display = "none";
    this.startTrainingGroundScene();
  }

  buildLevels() {
    var LEVEL_ONE_BACKGROUNDS = [
      new ParallaxScrollBackground(this.game, this, 'img/backgroundTrees4.png', 1, 5200),
      new ParallaxFloatingBackground(this.game, this, 'img/backgroundStars3.png', 1, 5000, 0),
      new ParallaxGodLightBackground(this.game, this, 'img/god light new 3.png', 4500),
      new ParallaxScrollBackground(this.game, this, 'img/backgroundTrees3.png', 1, 2500),
      new ParallaxBirdBackground(this.game, this, 'img/dagobah bat.png', .17, false, 200, 500),
      new ParallaxBirdBackground(this.game, this, 'img/dagobah bat left.png', .45, true, 1300, 500),
      new ParallaxBirdBackground(this.game, this, 'img/dagobah bat.png', .3, false, 2300, 500),
      new ParallaxGodLightBackground(this.game, this, 'img/god light new 2.png', 1900),
      new ParallaxFloatingBackground(this.game, this, 'img/backgroundStars1.png', 1, 1650, Math.PI/2),
      new ParallaxScrollBackground(this.game, this, 'img/backgroundTrees2.png', 1, 1000),
      new ParallaxGodLightBackground(this.game, this, 'img/god light new 1.png', 800),
      new ParallaxFloatingBackground(this.game, this, 'img/backgroundStars2.png', 1, 800, Math.PI*1.2),
      new ParallaxScrollBackground(this.game, this, 'img/backgroundTrees1.png', 1, 600),
    ];
    var LEVEL_ONE_TILES = {
      centerTile: 'img/forest_center_tile.png',
      leftTile: 'img/forest_left_tile.png',
      rightTile: 'img/forest_right_tile.png',
      leftRightTile: 'img/forest_both_rounded_tile.png'
    };

    var CITY_LEVEL_BACKGROUNDS = [
      new ParallaxScrollBackground(this.game, this, 'img/city_background.png', 1, 5200),
      new ParallaxFloatingBackground(this.game, this, 'img/city_clouds2.png', 1, 8000, Math.PI*.67),
      new ParallaxScrollBackground(this.game, this, 'img/city_buildings_back.png', 1, 2500),
      new ParallaxHoverHighwayBackground(this.game, this, 'img/highway layer 2.png', 4000, false),
      new ParallaxHoverHighwayBackground(this.game, this, 'img/highway layer 2 right.png', 4000, true),
      new ParallaxScrollBackground(this.game, this, 'img/city_buildings_middle.png', 1, 1400),
      new ParallaxHoverHighwayBackground(this.game, this, 'img/highway layer 1.png', 1000, false),
      new ParallaxHoverHighwayBackground(this.game, this, 'img/highway layer 1 right.png', 1000, true),
      new ParallaxScrollBackground(this.game, this, 'img/city_buildings_foreground.png', 1, 1000),
      new ParallaxHoverHighwayBackground(this.game, this, 'img/highway layer 3.png', 350, false),
      new ParallaxHoverHighwayBackground(this.game, this, 'img/highway layer 3 right.png', 350, true),
      new ParallaxFloatingBackground(this.game, this, 'img/city_clouds_left.png', 1, 1000, 0),
      new ParallaxFloatingBackground(this.game, this, 'img/city_clouds_center.png', 1, 800, Math.PI*1.33)
    ];
    var CITY_LEVEL_TILES = {
      centerTile: 'img/city_tile_center.png',
      leftTile: 'img/city_tile_left.png',
      rightTile: 'img/city_tile_right.png',
      leftRightTile: 'img/city_tile_left_right.png'
    };

    var LEVEL_THREE_BACKGROUNDS = [
      new ParallaxScrollBackground(this.game, this, 'img/snow level 0.png', 1, 6000),
      new ParallaxScrollBackground(this.game, this, 'img/snow level 1.png', 1, 4500),
      new ParallaxScrollBackground(this.game, this, 'img/snow level 2.png', 1, 3000),
      new ParallaxScrollBackground(this.game, this, 'img/snow level 3.png', 1, 1500),
      new ParallaxSnowBackground(this.game, this, 2300),
      new ParallaxSnowBackground(this.game, this, 2200),
      new ParallaxSnowBackground(this.game, this, 2100),
      new ParallaxSnowBackground(this.game, this, 1800),
      new ParallaxScrollBackground(this.game, this, 'img/snow level 4.png', 1, 1000),
      new ParallaxSnowBackground(this.game, this, 1500),
      new ParallaxSnowBackground(this.game, this, 1300),
      new ParallaxSnowBackground(this.game, this, 1100),
      new ParallaxSnowBackground(this.game, this, 1000),
      new ParallaxScrollBackground(this.game, this, 'img/snow level 5.png', 1, 500),
      new ParallaxSnowBackground(this.game, this, 800),
      new ParallaxSnowBackground(this.game, this, 700),
      new ParallaxScrollBackground(this.game, this, 'img/snow level 6.png', 1, 250),
      new ParallaxSnowBackground(this.game, this, 600),
      new ParallaxSnowBackground(this.game, this, 500),
      new ParallaxSnowBackground(this.game, this, 400)
    ];
    var LEVEL_THREE_TILES = {
      centerTile: 'img/ice_tile_center.png',
      leftTile: 'img/ice_tile_left.png',
      rightTile: 'img/ice_tile_right.png',
      leftRightTile: 'img/ice_tile_left_right.png'
    };

    this.levels = [];
    this.level = null;
    this.levelBackgrounds = [];
    //this.levels.push(new Level(this.game, this, lvlConst.BOSS_TEST_LAYOUT, LEVEL_ONE_BACKGROUNDS, LEVEL_ONE_TILES));
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

  setCheckPoint(checkPoint) {
    this.checkPoint = checkPoint;
  }
  addEntity(entity) {
    // console.log('added entity');
    this.otherEntities.push(entity);
  }

  addDroid(droid) {
    // console.log('added droid');
    this.droids.push(droid);
    // this.otherEntities.push(droid);
  }

  addLaser(laser) {
    // console.log('added laser');
    this.lasers.push(laser);
    // this.otherEntities.push(laser);
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

  pause() { // todo: pause music as well
    if (this.canPause) {
      // this.game.audio.endAllSoundFX();
      this.paused = true;
      this.game.timer.disable();
    }
  }

  unpause() {
    // if (!this.game.audio.soundFxMuted) {
    // 	this.game.audio.unMuteSoundFX();
    // }
    this.paused = false;
    this.game.timer.enable();
  }

  //________________________________________________________
  startOpeningScene() {
    this.restoreOriginalLaserSpeeds();
    document.getElementById("trainingControls").style.display = "none";
    // empty this.sceneEntities array
    // load sceneEntities for openeing scene animation
    this.sequence = 1;
    this.update = this.openingSceneUpdate;
    this.draw = this.openingSceneDraw;
    this.sceneEntities = [];
    this.sceneEntities.push(new ParallaxRotatingBackground(this.game, this, 'img/opening stars.png', 1, 15000));
    this.sceneEntities.push(new ParallaxScrollBackground(this.game, this, 'img/opening oasis 6.png', 1, 15000, 0, -50));
    this.sceneEntities.push(new ParallaxScrollBackground(this.game, this, 'img/opening oasis 5.png', 1, 9500, 0, 30));
    this.sceneEntities.push(new ParallaxScrollBackground(this.game, this, 'img/opening oasis 4.png', 1, 6000, 0, -20));
    this.sceneEntities.push(new ParallaxScrollBackground(this.game, this, 'img/opening oasis 3.png', 1, 2400, 0, -20));
    this.sceneEntities.push(new ParallaxScrollBackground(this.game, this, 'img/opening oasis 2.png', 1, 1300, 0, -265));
    this.sceneEntities.push(new ParallaxScrollBackground(this.game, this, 'img/opening oasis 1.png', 1, 900, 0, -170));
    //constructor(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse, scale) {
    this.sceneEntities.push(new ParallaxAnimatedBackground(this.game, this,
      new Animation(this.game.assetManager.getAsset('img/zerlin at fire.png'), 0, 0, 600, 600, .125, 6, true, false, .5),
      1, 800, 470, 450));
    this.sceneEntities.push(new Overlay(this.game, true, smc.OPENING_OVERLAY_TIME));
    this.game.audio.playSoundFx(this.game.audio.campFire);

    this.seq1EndTime = smc.OPENING_SEQUENCE_1_TIME;
    this.seq2EndTime = this.seq1EndTime + smc.OPENING_MESSAGE_TIME;
    this.seq3EndTime = this.seq2EndTime + smc.OPENING_TITLE_TIME;
    this.seq4EndTime = this.seq3EndTime + smc.OPENING_SEQUENCE_4_TIME;
    this.openingSceneTimer = 0;


    // start opening scene music

    //link up html buttons to try to login or register a user
    this.playGame = false; //for now use button to start the game
    document.getElementById("loginButton").addEventListener('click', () => {
      // }

      //user can't skip opening camera pan down
      if (this.openingSceneTimer > smc.OPENING_SCENE_STOP_CAMERA_PAN) {
        this.playGame = true;
        document.getElementById("formOverlay").style.display = "none";
      }
    });
  }

  openingSceneUpdate() {
    if (!this.canPause && this.game.keys['Enter']) {
      this.game.audio.campFire.stop();
      this.startCollectionScene(); //for going strait into the lvl
      document.getElementById("formOverlay").style.display = "none";
    }

    this.musicMenu.update();

    this.openingSceneTimer += this.game.clockTick;

    // sequence 1: Camera panning down on Zerlin sitting by the fire
    if (this.openingSceneTimer < smc.OPENING_SCENE_CAMERA_PAN_TIME) {
      this.camera.y = -Math.pow(this.openingSceneTimer - smc.OPENING_SCENE_CAMERA_PAN_TIME, 2) * 280;
    } else if (!this.seq1FadingOut && this.openingSceneTimer > this.seq1EndTime - smc.OPENING_OVERLAY_TIME) {
      this.seq1FadingOut = true;
      this.sceneEntities.push(new Overlay(this.game, false, smc.OPENING_OVERLAY_TIME));

    // sequence 2: opening message
    } else if (this.sequence == 1 && this.openingSceneTimer > this.seq1EndTime) {
      this.game.audio.campFire.stop();
      this.sequence = 2;
      this.sceneEntities.pop(); // remove previous overlay
      this.sceneEntities.push(new TextScreen(this.game, smc.OPENING_MESSAGE, "white", smc.OPENING_MESSAGE_TIME));
      this.sceneEntities.push(new Overlay(this.game, true, smc.OPENING_OVERLAY_TIME));
    } else if (!this.seq2FadingOut && this.openingSceneTimer > this.seq2EndTime - smc.OPENING_OVERLAY_TIME) {
      this.seq2FadingOut = true;
      this.sceneEntities.push(new Overlay(this.game, false, smc.OPENING_OVERLAY_TIME));

    // sequence 3: Title
    } else if (this.sequence == 2 && this.openingSceneTimer > this.seq2EndTime) {
      this.sceneEntities.pop(); // remove previous overlay
      this.sequence = 3;
      this.sceneEntities.push(new TextScreen(this.game, "", "white"));
      this.sceneEntities.push(new ParallaxAnimatedBackground(this.game, this,
        new Animation(this.game.assetManager.getAsset('img/title.png'), 0, 0, 1026, 342, .145, 66, false, false, .5),
        1, 200, (this.game.surfaceWidth - 1026 * .5) / 2, (this.game.surfaceHeight - 342 * .5) / 2));
      this.sceneEntities.push(new Overlay(this.game, true, smc.OPENING_OVERLAY_TIME * .8));
    } else if (!this.seq3FadingOut && this.openingSceneTimer > this.seq3EndTime - smc.OPENING_OVERLAY_TIME) {
      this.seq3FadingOut = true;
      this.sceneEntities.push(new Overlay(this.game, false, smc.OPENING_OVERLAY_TIME * .8));

    // sequence 4: Zerlin takes off in rocket
    } else if (this.sequence == 3 && this.openingSceneTimer > this.seq3EndTime) {
      this.sceneEntities.pop(); // remove previous overlay
      this.sceneEntities.pop(); // remove title
      this.sceneEntities.pop(); // remove title background
      this.sceneEntities.pop(); // remove Zerlin by fire
      this.sequence = 4;
      // this.sceneEntities.pop(); // remove previous title animation
      this.camera.x = 1400;
      this.sceneEntities.push(new ParallaxAnimatedBackground(this.game, this,
        new Animation(this.game.assetManager.getAsset('img/ship take off.png'), 0, 0, 600, 600, .18, 38, false, false, 1.5),
        1, 800, 470, -150));
      this.sceneEntities.push(new Overlay(this.game, true, smc.OPENING_OVERLAY_TIME));
    } else if (this.sequence == 4) {

      if (!this.playTakeOffSound && this.openingSceneTimer > this.seq3EndTime + .5) {
        this.playTakeOffSound = true;
        this.game.audio.playSoundFx(this.game.audio.shipTakeOff);
      }

      this.seq4CameraPanTimer += this.game.clockTick;
      if (!this.startSeq4CameraPan && this.openingSceneTimer > this.seq4EndTime - smc.OPENING_SCENE_CAMERA_PAN_TIME) {
        this.startSeq4CameraPan = true;
        this.seq4CameraPanTimer = 0;
      } else if (this.startSeq4CameraPan && this.openingSceneTimer <= this.seq4EndTime) {
        this.camera.y = -Math.pow(this.seq4CameraPanTimer, 2) * 280;
      }

      if (!this.addedTwinkleStar && this.seq4CameraPanTimer > 4.7) {
        this.addedTwinkleStar = true;
        this.sceneEntities.push(new ParallaxAnimatedBackground(this.game, this,
          new Animation(this.game.assetManager.getAsset('img/twinkling star.png'), 0, 0, 64, 64, .05, 14, false, false, .9),
          1, 99999999, 964, 95));
      }

      if (!this.seq4FadingOut && this.openingSceneTimer > this.seq4EndTime - smc.OPENING_OVERLAY_TIME) {
        this.seq4FadingOut = true;
        this.sceneEntities.push(new Overlay(this.game, false, smc.OPENING_OVERLAY_TIME));
      }

      // transition to level
      if (this.openingSceneTimer > this.seq4EndTime) {
        this.startCollectionScene();
      }
    }


    for (let i = this.sceneEntities.length - 1; i >= 0; i--) {
      this.sceneEntities[i].update();
      if (this.sceneEntities[i].removeFromWorld) {
        this.sceneEntities.splice(i, 1);
      }
    }
  }

  openingSceneDraw() {
    for (let i = 0; i < this.sceneEntities.length; i++) {
      this.sceneEntities[i].draw();
    }
    this.musicMenu.draw();

    // click to continue message
    // this.game.ctx.fillStyle = "#777777";
    // this.game.ctx.textAlign = "center";
    // this.game.ctx.font = '20px ' + smc.GAME_FONT;
    // this.game.ctx.fillText("click to continue (but seriously, watch the opening scene)", this.game.surfaceWidth / 2, 600);
  }

  //________________________________________________________
  startLevelTransitionScene() {
    this.game.keys['Enter'] = false;
    this.levelTransitionTimer = 0;
    this.update = this.levelTransitionUpdate;
    this.draw = this.levelTransitionDraw;
    this.canPause = false;

    this.initiallyPaused = false;
    this.sceneEntities = [];

    switch (this.levelNumber) {
      case (1):
        this.sceneEntities.push(new TextScreen(this.game, smc.LEVEL_ONE_TEXT));
        break;
      case (2):
        this.sceneEntities.push(new TextScreen(this.game, smc.LEVEL_TWO_MESSAGE));
        break;
      case (3):
        this.sceneEntities.push(new TextScreen(this.game, smc.LEVEL_THREE_MESSAGE));
        break;
    }

    // this.sceneEntities.push(new TextScreen(this.game, smc.LEVEL_ONE_TEXT));
    this.sceneEntities.push(new Overlay(this.game, true, smc.LEVEL_TRANSITION_OVERLAY_TIME));
    this.startedFinalOverlay = false;
    this.overlayTimer = 0;
  }

  levelTransitionUpdate() {
    if (!this.startedFinalOverlay && this.game.keys['Enter']) {
      this.startedFinalOverlay = true;
      this.sceneEntities.push(new Overlay(this.game, false, smc.LEVEL_TRANSITION_OVERLAY_TIME));
      this.overlayTimer = smc.LEVEL_TRANSITION_OVERLAY_TIME;
    }
    this.musicMenu.update();
    this.overlayTimer -= this.game.clockTick;

    for (let i = this.sceneEntities.length - 1; i >= 0; i--) {
      this.sceneEntities[i].update();
      if (this.sceneEntities[i].removeFromWorld) {
        this.sceneEntities.splice(i, 1);
      }
    }
    if (this.startedFinalOverlay && this.overlayTimer <= 0) {
      this.startLevelScene();
    }
  }

  levelTransitionDraw() {
    for (let i = 0; i < this.sceneEntities.length; i++) {
      this.sceneEntities[i].draw();
    }
    this.musicMenu.draw();

    // click to continue message
    if (!this.startedFinalOverlay) {
      this.game.ctx.fillStyle = "#777777";
      this.game.ctx.textAlign = "center";
      this.game.ctx.font = '20px ' + smc.GAME_FONT;
      this.game.ctx.fillText("press enter to continue", this.game.surfaceWidth / 2, 600);
    }
  }


  //________________________________________________________
  startLevelScene() {
    this.restoreOriginalLaserSpeeds();
    document.getElementById("trainingControls").style.display = "none";
    // empty this.sceneEntities array
    this.levelSceneTimer = 0;
    this.update = this.levelUpdate;
    this.draw = this.levelDraw;
    this.camera.x = 0;
    this.camera.y = 0;

    // load game engine with tiles for current level
    this.level = this.levels[this.levelNumber - 1];
    if (this.newLevel) {
      this.checkPoint = new CheckPoint(this.game, this.camera.width * cc.ZERLIN_POSITION_ON_SCREEN, 0);
    }
    this.newLevel = false; //if this is set to true when the next level is loaded, then reset the checkpoint.
    this.droids = [];
    this.lasers = [];
    this.powerups = [];
    this.otherEntities = [];
    this.activePowerups = [];
    this.boss = null;
    this.bossMusicSwitched = false;
    this.bossHealthBar = null;
    this.level.set();
    this.addEntity(new HealthStatusBar(this.game, this, 25, 25)); //put these in scene manager??
    this.addEntity(new ForceStatusBar(this.game, this, 50, 50));
    this.Zerlin.reset();
    this.wonLevel = false;

    this.initiallyPaused = false;
    this.canPause = false;
    this.sceneEntities = [];
    if (this.levelNumber == 3) {
      this.sceneEntities.push(new ParallaxSnowBackground(this.game, this, 300));
      this.sceneEntities.push(new ParallaxSnowBackground(this.game, this, 200));
      this.sceneEntities.push(new ParallaxSnowBackground(this.game, this, 100));
    }
    this.startedFinalOverlay = false;
    this.startNewScene = false;

    this.game.audio.playSoundFx(this.game.audio.lightsaber, 'lightsaberOn');
    this.game.audio.playSoundFx(this.game.audio.saberHum);
  }

  levelUpdate() {
    this.levelSceneTimer += this.game.clockTick;
    this.musicMenu.update();

    // this.musicMenu.update();
    // if (this.boss && !this.game.audio.bossSongPlaying) {
    //   this.game.audio.playBossSong();
    // }


    if (!this.paused) {
      if (this.boss && !this.bossHealthBar) {
        this.bossHealthBar = new BossHealthStatusBar(
          this.game,
          this.game.surfaceWidth * 0.25,
          680,
          this.boss);
      }
      this.Zerlin.update();
      this.camera.update();
      this.level.update();

      for (var i = this.droids.length - 1; i >= 0; i--) {
        this.droids[i].update();
        if (this.droids[i].removeFromWorld) {
          this.droids.splice(i, 1);
        }
      }
      for (var i = this.lasers.length - 1; i >= 0; i--) {
        this.lasers[i].update();
        if (this.lasers[i].removeFromWorld) {
          this.lasers.splice(i, 1);
        }
      }
      for (var i = this.powerups.length - 1; i >= 0; i--) {
        this.powerups[i].update();
        if (this.powerups[i].removeFromWorld) {
          this.powerups.splice(i, 1);
        }
      }
      for (var i = this.activePowerups.length - 1; i >= 0; i--) {
        this.activePowerups[i].update(i);
        if (this.activePowerups[i].removeFromWorld) {
          this.activePowerups.splice(i, 1);
        }
      }
      for (var i = this.otherEntities.length - 1; i >= 0; i--) {
        this.otherEntities[i].update();
        if (this.otherEntities[i].removeFromWorld) {
          this.otherEntities.splice(i, 1);
        }
      }

      //if the boss has been spawned update him and his health bar
      if (this.boss) {
        this.boss.update();
        if (!this.bossMusicSwitched) {
          this.game.audio.playBossSong();
          this.bossMusicSwitched = true;
        }
      }
      if (this.bossHealthBar) {
        this.bossHealthBar.update();
      }

      this.collisionManager.handleCollisions();

      for (let i = this.sceneEntities.length - 1; i >= 0; i--) {
        this.sceneEntities[i].update();
        if (this.sceneEntities[i].removeFromWorld) {
          this.sceneEntities.splice(i, 1);
        }
      }
    }

    if (!this.initiallyPaused && this.levelSceneTimer > smc.PAUSE_TIME_AFTER_START_LEVEL) {
      this.initiallyPaused = true;
      this.canPause = true;
      this.pause();
    }


    if (this.boss && !this.boss.alive || (this.boss == null && this.level.unspawnedBoss == null
          && this.droids.length == 0 && this.Zerlin.x >= this.level.getLengthAtI(5)) && !this.wonLevel) {
            //also need to check if zerlin is near the end of the level when there is no boss.
      console.log("level won");
      this.canPause = false;
  		this.wonLevel = true;
  		this.boss = null;
  		this.saveProgress();
  		this.startedFinalOverlay = true;
  		this.timeSinceBossDeath = 0;
  		this.sceneEntities.push(new Overlay(this.game, false, smc.LEVEL_COMPLETE_OVERLAY_TIME));
  		for (var i = this.droids.length - 1; i >= 0; i--) {
  			this.droids[i].explode();
  		}
  	}
  	if (this.wonLevel) {
      this.newLevel = true;
  		this.timeSinceBossDeath += this.game.clockTick;
  		if (this.timeSinceBossDeath > smc.LEVEL_COMPLETE_OVERLAY_TIME) {
  			this.levelNumber++;
  			if (this.levelNumber > smc.NUM_LEVELS) {
  				this.startCreditsScene();
  			} else {
  				this.startCollectionScene();
  			}
  		}
  	}
    if (!this.startedFinalOverlay && !this.Zerlin.alive) {
      this.canPause = false;
      if (this.levelSceneTimer > this.Zerlin.timeOfDeath + this.Zerlin.deathAnimation.totalTime) {
        this.startedFinalOverlay = true;
        this.sceneEntities.push(new Overlay(this.game, false, smc.LEVEL_TRANSITION_OVERLAY_TIME));
        this.sceneEntities.push(new GameOverTextScreen(this.game));
        this.stopLevelTime = this.levelSceneTimer + 6;
        //could play death song or something
        // this.game.audio.playBackgroundSong();
        this.startNewScene = true;
      }
    }

    if ((this.levelSceneTimer > this.stopLevelTime && this.startNewScene)
     || (!this.Zerlin.alive && this.game.keys['Enter'])) {
      this.game.audio.endAllSoundFX();
      this.startLevelTransitionScene();
      this.startNewScene = false;
    }
  }

  levelDraw() {
    this.camera.draw();
    this.level.draw();
    this.Zerlin.draw();
    for (var i = 0; i < this.droids.length; i++) {
      this.droids[i].draw(this.ctx);
    }
    for (var i = 0; i < this.lasers.length; i++) {
      this.lasers[i].draw(this.ctx);
    }
    if (this.boss) { // draw the boss and health bar if spawned
      this.boss.draw();
    }
    if (this.bossHealthBar) {
      this.bossHealthBar.draw();
    }
    for (var i = 0; i < this.powerups.length; i++) {
      this.powerups[i].draw(this.ctx);
    }
    for (var i = 0; i < this.activePowerups.length; i++) {
      this.activePowerups[i].draw();
    }
    for (var i = 0; i < this.otherEntities.length; i++) {
      this.otherEntities[i].draw(this.ctx);
    }
    for (let i = 0; i < this.sceneEntities.length; i++) {
      this.sceneEntities[i].draw();
    }

    if (this.paused) {
      this.pauseScreen.draw();
    }
    this.musicMenu.draw();
  }

  //________________________________________________________
  startCollectionScene() {
    this.update = this.collectionUpdate;
    this.draw = this.collectionDraw;
    this.sceneEntities = [];
    this.canPause = false;

    this.timer = 0;
    this.collectionScreen = new AttributeCollectionScreen(this.game, this, 5);
    this.sceneEntities.push(this.collectionScreen);
    this.sceneEntities.push(new Overlay(this.game, true, smc.LEVEL_TRANSITION_OVERLAY_TIME));
    this.startedFinalOverlay = false;
    this.overlayTimer = 0;


  }

  collectionUpdate() {
    this.musicMenu.update();
    this.timer += this.game.clockTick;
    this.overlayTimer -= this.game.clockTick;
    for (let i = this.sceneEntities.length - 1; i >= 0; i--) {
      this.sceneEntities[i].update();
      if (this.sceneEntities[i].removeFromWorld) {
        this.sceneEntities.splice(i, 1);
      }
    }

    if (this.collectionScreen.continue && !this.startedFinalOverlay) {
      this.startedFinalOverlay = true;
      this.sceneEntities.push(new Overlay(this.game, false, smc.LEVEL_TRANSITION_OVERLAY_TIME));
      this.overlayTimer = smc.LEVEL_TRANSITION_OVERLAY_TIME;
    }
    if (this.startedFinalOverlay && this.overlayTimer <= 0) {
      this.startLevelTransitionScene();
    }
  }

  collectionDraw() {
    for (let i = 0; i < this.sceneEntities.length; i++) {
      this.sceneEntities[i].draw();
    }
    this.musicMenu.draw();
  }


  //________________________________________________________
	startCreditsScene() {
		this.creditsTimer = 0;
		this.update = this.creditsUpdate;
		this.draw = this.creditsDraw;
		this.canPause = false;

		this.initiallyPaused = false;
		this.sceneEntities = [];
		this.sceneEntities.push(new TextScreen(this.game, smc.CREDITS_1));
		this.sceneEntities.push(new Overlay(this.game, true, smc.LEVEL_TRANSITION_OVERLAY_TIME));
		this.startedFinalOverlay = false;
	}

	creditsUpdate() {
		this.creditsTimer += this.game.clockTick;
		for (let i = this.sceneEntities.length - 1; i >= 0; i--) {
			this.sceneEntities[i].update();
			if (this.sceneEntities[i].removeFromWorld) {
				this.sceneEntities.splice(i, 1);
			}
		}

    if (!this.startedOverlay && this.creditsTimer > smc.CREDITS_MESSAGE_1_TIME - smc.LEVEL_TRANSITION_OVERLAY_TIME) {
      this.startedOverlay = true;
      this.sceneEntities.push(new Overlay(this.game, false, smc.LEVEL_TRANSITION_OVERLAY_TIME));
    } else if (!this.startedSecondCreditMessage && this.creditsTimer >= smc.CREDITS_MESSAGE_1_TIME) {
      this.startedSecondCreditMessage = true;
      this.sceneEntities.push(new TextScreen(this.game, smc.CREDITS_2));
      this.sceneEntities.push(new Overlay(this.game, true, smc.LEVEL_TRANSITION_OVERLAY_TIME));
    }
	}

	creditsDraw() {
		for (let i = 0; i < this.sceneEntities.length; i++) {
			this.sceneEntities[i].draw();
		}
	}


  //________________________________________________________
  startMultiplayerTrainingScene() {
    this.startTrainingGroundScene();  // set up P1, level, droids, etc.
    this.multiplayerActive = true;

    // Create P2
    this.Zerlin2 = new Zerlin2(this.game, this.camera, this);
    this.Zerlin2.maxHealth = 15;
    this.Zerlin2.maxForce  = 15;
    this.Zerlin2.setHealth();

    // P2 status bars — mirrored to top-right of screen
    var barLength = this.game.surfaceWidth * Constants.StatusBarConstants.STATUS_BAR_LENGTH;
    var p2BarX = this.game.surfaceWidth - barLength - 25;
    this.addEntity(new HealthStatusBarP2(this.game, this, p2BarX, 25));
    this.addEntity(new ForceStatusBarP2(this.game, this, p2BarX, 50));

    // Networking
    this.pendingSnapshot = null;
    this.networkSnapshotTimer = 0;
    if (!this.game.network.isHost) {
      // Client: stash incoming snapshots for application at start of next update
      this.game.network.onStateReceived = (snap) => { this.pendingSnapshot = snap; };
    }
  }

  startTrainingGroundScene() {
    this.multiplayerActive = false;
    this.Zerlin2 = null;
    this.game.audio.campFire.stop();
    this.game.audio.endAllSoundFX();
    this.levelSceneTimer = 0;
    this.update = this.trainingGroundUpdate;
    this.draw = this.trainingGroundDraw;
    this.camera.x = 0;
    this.camera.y = 0;

    this.level = this.trainingLevel;
    this.checkPoint = new CheckPoint(this.game, this.camera.width * cc.ZERLIN_POSITION_ON_SCREEN, 0);
    this.droids = [];
    this.lasers = [];
    this.powerups = [];
    this.otherEntities = [];
    this.activePowerups = [];
    this.boss = null;
    this.bossMusicSwitched = false;
    this.bossHealthBar = null;
    this.level.set();
    // Preserve the user's checkbox selections across respawns; only initialize on first entry
    if (!this.enabledDroidTypes) {
      this.enabledDroidTypes = new Set();
      if (smc.TRAINING_DEFAULT_BASIC)      this.enabledDroidTypes.add('BasicDroid');
      if (smc.TRAINING_DEFAULT_SCATTER)    this.enabledDroidTypes.add('ScatterShotDroid');
      if (smc.TRAINING_DEFAULT_SLOW_BURST) this.enabledDroidTypes.add('SlowBurstDroid');
      if (smc.TRAINING_DEFAULT_FAST_BURST) this.enabledDroidTypes.add('FastBurstDroid');
      if (smc.TRAINING_DEFAULT_SNIPER)     this.enabledDroidTypes.add('SniperDroid');
      if (smc.TRAINING_DEFAULT_MULTISHOT)  this.enabledDroidTypes.add('MultishotDroid');
    }

    // Drain all droids from level into our controlled pool; powerups spawn normally
    this.trainingDroidPool = this.level.unspawnedDroids.filter(d => this.enabledDroidTypes.has(d.constructor.name));
    this.level.unspawnedDroids = [];

    this.addEntity(new HealthStatusBar(this.game, this, 25, 25));
    this.addEntity(new ForceStatusBar(this.game, this, 50, 50));
    this.Zerlin.maxHealth = 15;
    this.Zerlin.maxForce = 15;
    this.Zerlin.reset();
    this.Zerlin.setHealth(); // apply god mode if active

    this.trainingKills = 0;
    this.trainingSpawnTimer = 0;
    this.cameraShakeTimer = 0;
    this.cameraShakeIntensity = 0;
    this.trainingPrevHealth = this.Zerlin.currentHealth;
    if (this.trainingTargetDroids === undefined) this.trainingTargetDroids = smc.TRAINING_DEFAULT_DROIDS;

    // Store original laser speeds once
    if (!this.trainingOrigLaserSpeeds) {
      this.trainingOrigLaserSpeeds = {
        basic:     Constants.DroidBasicConstants.BASIC_DROID_LASER_SPEED,
        leggy:     Constants.DroidBasicConstants.LEGGY_DROID_LASER_SPEED,
        slowburst: Constants.DroidBasicConstants.SLOWBURST_DROID_LASER_SPEED,
        fastburst: Constants.DroidBasicConstants.FASTBURST_DROID_LASER_SPEED,
        sniper:    Constants.DroidBasicConstants.SNIPER_DROID_LASER_SPEED
      };
    }
    // Apply current slider multiplier
    if (this.trainingLaserMult === undefined) this.trainingLaserMult = smc.TRAINING_DEFAULT_LASER_MULT;
    this.setTrainingLaserSpeed(this.trainingLaserMult);

    this.initiallyPaused = false;
    this.canPause = false;
    this.sceneEntities = [];
    if (this.trainingBgIndex === 2) { // Hoth — add falling snow
      this.sceneEntities.push(new ParallaxSnowBackground(this.game, this, 300));
      this.sceneEntities.push(new ParallaxSnowBackground(this.game, this, 200));
      this.sceneEntities.push(new ParallaxSnowBackground(this.game, this, 100));
    }
    this.startedFinalOverlay = false;
    this.startNewScene = false;

    document.getElementById("trainingControls").style.display = "block";

    this.game.audio.playSoundFx(this.game.audio.lightsaber, 'lightsaberOn');
    this.game.audio.playSoundFx(this.game.audio.saberHum);
  }

  trainingGroundUpdate() {
    this.levelSceneTimer += this.game.clockTick;
    this.musicMenu.update();

    if (!this.paused) {
      // Client: apply authoritative positions from host BEFORE running local sim
      if (this.multiplayerActive && this.Zerlin2 && !this.game.network.isHost && this.pendingSnapshot) {
        this._applyPlayerFromSnapshot(this.Zerlin,  this.pendingSnapshot.p1);
        this._applyPlayerFromSnapshot(this.Zerlin2, this.pendingSnapshot.p2);
        this.pendingSnapshot = null;
      }

      // Client: Zerlin is P1's character driven purely by snapshot.
      // Skip full update() to prevent local gravity/input from overriding the
      // snapshot position. Just keep the lightsaber position in sync for rendering.
      if (this.multiplayerActive && this.Zerlin2 && !this.game.network.isHost) {
        var _ls = this.Zerlin.lightsaber;
        if (_ls) {
          var _zc = Constants.ZerlinConstants;
          _ls.x = this.Zerlin.x;
          _ls.y = this.Zerlin.y - (_zc.Z_HEIGHT - this.Zerlin.armSocketY) * this.Zerlin.scale;
          if (_ls.airbornSaber) _ls.airbornSaber.update();
        }
      } else {
        this.Zerlin.update();
      }

      if (this.multiplayerActive && this.Zerlin2) this.Zerlin2.update();
      this.camera.update();
      // Call level.update() for tile physics and powerup spawning; droids managed by pool
      this.level.update();

      // Staggered droid spawning — refill pool silently when exhausted
      if (this.trainingDroidPool.length === 0 && this.enabledDroidTypes.size > 0) {
        this.level.set();
        this.trainingDroidPool = this.level.unspawnedDroids.filter(d => this.enabledDroidTypes.has(d.constructor.name));
        this.level.unspawnedDroids = [];
      }
      this.trainingSpawnTimer -= this.game.clockTick;
      if (this.trainingSpawnTimer <= 0
          && this.droids.length < this.trainingTargetDroids
          && this.trainingDroidPool.length > 0) {
        this.trainingSpawnTimer = 0.5;
        this.droids.push(this.trainingDroidPool.pop());
      }

      for (var i = this.droids.length - 1; i >= 0; i--) {
        this.droids[i].update();
        if (this.droids[i].removeFromWorld) {
          this.trainingKills++;
          this.droids.splice(i, 1);
        }
      }
      for (var i = this.lasers.length - 1; i >= 0; i--) {
        this.lasers[i].update();
        if (this.lasers[i].removeFromWorld) {
          this.lasers.splice(i, 1);
        }
      }
      for (var i = this.powerups.length - 1; i >= 0; i--) {
        this.powerups[i].update();
        if (this.powerups[i].removeFromWorld) {
          this.powerups.splice(i, 1);
        }
      }
      for (var i = this.activePowerups.length - 1; i >= 0; i--) {
        this.activePowerups[i].update(i);
        if (this.activePowerups[i].removeFromWorld) {
          this.activePowerups.splice(i, 1);
        }
      }
      for (var i = this.otherEntities.length - 1; i >= 0; i--) {
        this.otherEntities[i].update();
        if (this.otherEntities[i].removeFromWorld) {
          this.otherEntities.splice(i, 1);
        }
      }

      this.collisionManager.handleCollisions();

      // Camera shake on hit
      var zc = Constants.ZerlinConstants;
      if (this.Zerlin.currentHealth < this.trainingPrevHealth) {
        this.cameraShakeTimer = zc.HIT_SHAKE_DURATION;
        this.cameraShakeIntensity = zc.HIT_SHAKE_INTENSITY;
      }
      this.trainingPrevHealth = this.Zerlin.currentHealth;
      if (this.cameraShakeTimer > 0) {
        this.cameraShakeTimer -= this.game.clockTick;
        if (this.cameraShakeTimer < 0) this.cameraShakeTimer = 0;
      }

      for (let i = this.sceneEntities.length - 1; i >= 0; i--) {
        this.sceneEntities[i].update();
        if (this.sceneEntities[i].removeFromWorld) {
          this.sceneEntities.splice(i, 1);
        }
      }

      // ── Networking ──────────────────────────────────────────────────
      if (this.multiplayerActive && this.Zerlin2) {
        if (this.game.network.isHost) {
          // Host: send authoritative player state to client at 20 Hz
          this.networkSnapshotTimer -= this.game.clockTick;
          if (this.networkSnapshotTimer <= 0) {
            this.networkSnapshotTimer = 1 / 20;
            this.game.network.sendGameState(this._buildPlayerSnapshot());
          }
        } else {
          // Client: send local input to host every frame
          this.game.network.sendInput({
            keys:           this.game.keys,
            mouseX:         this.game.mouse ? this.game.mouse.x : 0,
            mouseY:         this.game.mouse ? this.game.mouse.y : 0,
            click:          !!this.game.click,
            rightClickDown: this.game.rightClickDown || false,
          });
        }
      }
    }

    if (!this.initiallyPaused && this.levelSceneTimer > smc.PAUSE_TIME_AFTER_START_LEVEL) {
      this.initiallyPaused = true;
      this.canPause = true;
    }

    // P2 independent respawn (no full scene reset — just reset that player)
    if (this.multiplayerActive && this.Zerlin2 && !this.Zerlin2.alive) {
      if (this.levelSceneTimer > this.Zerlin2.timeOfDeath + this.Zerlin2.deathAnimation.totalTime + 1.5) {
        this.Zerlin2.reset();
        this.Zerlin2.setHealth();
      }
    }

    // On P1 death: wait for death animation then restart training ground quickly
    if (!this.startedFinalOverlay && !this.Zerlin.alive) {
      this.canPause = false;
      if (this.levelSceneTimer > this.Zerlin.timeOfDeath + this.Zerlin.deathAnimation.totalTime) {
        this.startedFinalOverlay = true;
        this.stopLevelTime = this.levelSceneTimer + 1.5;
        this.startNewScene = true;
      }
    }

    if ((this.levelSceneTimer > this.stopLevelTime && this.startNewScene)
     || (!this.Zerlin.alive && this.game.keys['Enter'])) {
      this.game.audio.endAllSoundFX();
      this.startTrainingGroundScene();
      this.startNewScene = false;
    }
  }

  trainingGroundDraw() {
    // Apply camera shake offset if active
    var shakeX = 0, shakeY = 0;
    if (this.cameraShakeTimer > 0) {
      var zc = Constants.ZerlinConstants;
      var ratio = this.cameraShakeTimer / zc.HIT_SHAKE_DURATION;
      var magnitude = this.cameraShakeIntensity * ratio;
      shakeX = (Math.random() * 2 - 1) * magnitude;
      shakeY = (Math.random() * 2 - 1) * magnitude;
      this.game.ctx.save();
      this.game.ctx.translate(shakeX, shakeY);
    }

    this.camera.draw();
    this.level.draw();
    this.Zerlin.draw();
    if (this.multiplayerActive && this.Zerlin2) this.Zerlin2.draw();
    for (var i = 0; i < this.droids.length; i++) {
      this.droids[i].draw(this.ctx);
    }
    for (var i = 0; i < this.lasers.length; i++) {
      this.lasers[i].draw(this.ctx);
    }
    for (var i = 0; i < this.powerups.length; i++) {
      this.powerups[i].draw(this.ctx);
    }
    for (var i = 0; i < this.activePowerups.length; i++) {
      this.activePowerups[i].draw();
    }
    for (var i = 0; i < this.otherEntities.length; i++) {
      this.otherEntities[i].draw(this.ctx);
    }
    for (let i = 0; i < this.sceneEntities.length; i++) {
      this.sceneEntities[i].draw();
    }
    if (this.paused) {
      this.pauseScreen.draw();
    }
    this.musicMenu.draw();

    // Restore from camera shake (HUD drawn at fixed position)
    if (this.cameraShakeTimer > 0) {
      this.game.ctx.restore();
    }

    // Training HUD
    this.game.ctx.textAlign = "left";
    this.game.ctx.font = '22px ' + smc.GAME_FONT;
    this.game.ctx.fillStyle = "rgba(255, 220, 0, 0.9)";
    this.game.ctx.fillText(
      "TRAINING GROUND  |  Kills: " + this.trainingKills +
      "  |  Active: " + this.droids.length,
      25, 680);
  }

  // ── Multiplayer snapshot helpers ─────────────────────────────────────────

  _buildPlayerSnapshot() {
    return {
      p1:    this._serializePlayer(this.Zerlin),
      p2:    this._serializePlayer(this.Zerlin2),
      kills: this.trainingKills,
    };
  }

  _serializePlayer(z) {
    return {
      x: z.x, y: z.y,
      deltaX: z.deltaX, deltaY: z.deltaY,
      health: z.currentHealth,
      force:  z.currentForce,
      facingRight: z.facingRight,
      alive:     z.alive,
      direction: z.direction,
      falling:   z.falling,
      saberAngle: z.lightsaber ? z.lightsaber.angle : 0,
    };
  }

  _applyPlayerFromSnapshot(zerlin, state) {
    if (!state) return;
    zerlin.x      = state.x;
    zerlin.y      = state.y;
    zerlin.deltaX = state.deltaX;
    zerlin.deltaY = state.deltaY;
    zerlin.currentHealth = state.health;
    zerlin.currentForce  = state.force;
    zerlin.direction = state.direction;
    zerlin.falling   = state.falling;
    if (zerlin.lightsaber) zerlin.lightsaber.angle = state.saberAngle;
    // Sync facing direction (also recomputes bounding box)
    if (state.facingRight !== zerlin.facingRight) {
      state.facingRight ? zerlin.faceRight() : zerlin.faceLeft();
    } else {
      zerlin.updateBoundingBox();
    }
  }

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
      for (let i = this.droids.length - 1; i >= 0; i--) {
        if (this.droids[i].constructor.name === typeName) {
          this.droids.splice(i, 1);
        }
      }
    }
    // Re-filter the queued pool to match the new enabled set
    this.trainingDroidPool = this.trainingDroidPool.filter(d => this.enabledDroidTypes.has(d.constructor.name));
  }

  setTrainingBackground(index) {
    this.trainingBgIndex = index;
    this.trainingLevel = this.trainingLevels[index];
    this.startTrainingGroundScene();
  }

  //________________________________________________________
  saveProgress() {

  }

  toggleInfiniteHealth() {
    if (this.infiniteHealth) {
      this.infiniteHealth = false;
      this.Zerlin.infiniteHealth = false;
    } else {
      this.infiniteHealth = true;
      this.Zerlin.infiniteHealth = true;
    }
    this.Zerlin.setHealth();
  }
}




class PauseScreen {
  constructor(game) {
    this.game = game;
    this.overlay = new Overlay(game, true, 1);
    this.overlay.opacity = .5;
  }

  update() {

  }

  draw() {
    var ctx = this.game.ctx;
    this.overlay.draw();
    ctx.save();
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "70px " + smc.GAME_FONT;
    ctx.fillText("Paused", this.game.surfaceWidth / 2, 200);

    //draw each powerup on the right
    //draw each control on the left

    //draw jump control
    var image = this.game.assetManager.getAsset('img/jump.png');
    ctx.drawImage(image, 50, 10, 35, 35 * image.height/image.width);
    ctx.textAlign = "left";
    ctx.font = "22px " + smc.GAME_FONT;
    ctx.fillText("Regular Jump: W", 100, 40);
    ctx.fillText("Force Jump: Shift + W", 100, 70)

    //draw roll control
    image = this.game.assetManager.getAsset('img/roll.png');
    ctx.drawImage(image, 40, 125, 50, 50 * image.height/image.width);
    ctx.fillText("Left Roll: A + S", 100, 140);
    ctx.fillText("Right Roll: D + S", 100, 170);

    //draw slash control
    image = this.game.assetManager.getAsset('img/slash.png');
    ctx.drawImage(image, 40, 200, 50, 50 * image.height/image.width);
    ctx.fillText("Slash: Spacebar", 100, 250);

    //draw crouch control
    image = this.game.assetManager.getAsset('img/crouch.png');
    ctx.drawImage(image, 40, 300, 40, 40 * image.height/image.width);
    ctx.fillText("Crouch: X", 100, 340);

    //draw flip lightsaber control
    image = this.game.assetManager.getAsset('img/flip_saber.png');
    ctx.drawImage(image, 35, 390, 50, 50 * image.height/image.width);
    ctx.fillText("Flip Saber: Right Click", 100, 410);

    //draw throw saber control
    image = this.game.assetManager.getAsset('img/saber_throw.png');
    ctx.drawImage(image, 35, 470, 50, 50 * image.height/image.width);
    ctx.fillText("Throw Saber: Left Click", 100, 495);

    //draw lightning control
    image = this.game.assetManager.getAsset('img/lightning.png');
    ctx.drawImage(image, 35, 530, 50, 50 * image.height/image.width);
    ctx.fillText("Force Lightning: Shift + LeftClick", 100, 550);
    ctx.fillText("(Hold to Charge)", 100, 570);

    /* Middle Column */
    var middleWidth = this.game.surfaceWidth/2;
    ctx.textAlign = "center";
    //draw pause and skip scene control
    ctx.fillText("Pause/Unpause: Enter", middleWidth, 250);
    ctx.fillText("Skip Scene: Enter", middleWidth, 300);

    /****** Draw Powerup Description ******/
    ctx.textAlign = "left";

    //draw the Health powerup
    var spritesheet = this.game.assetManager.getAsset('img/powerup_health.png');
    var animation = new Animation(spritesheet, 0, 0, 32, 32, 0.1, 5, true, false, 3);
    animation.drawFrame(this.game.clockTick, ctx, 700, 10);
    ctx.fillText("Health: Fully Heals Zerlin", 800, 60);

    //draw the force powerup
    spritesheet = this.game.assetManager.getAsset('img/powerup_force.png');
    animation = new Animation(spritesheet, 0, 0, 32, 32, 0.1, 9, true, false, 3);
    animation.drawFrame(this.game.clockTick, ctx, 700, 110);
    ctx.fillText("Force: Fully Recover Force Power", 800, 160);

    //draw the invincibility powerup
    spritesheet = this.game.assetManager.getAsset('img/powerup_invincibility.png');
    animation = new Animation(spritesheet, 0, 0, 32, 32, 0.1, 9, true, false, 2.5);
    animation.drawFrame(this.game.clockTick, ctx, 705, 210);
    ctx.fillText("Invincibility", 800, 255);

    //draw the split shot powerup
    spritesheet = this.game.assetManager.getAsset('img/powerup_coin.png');
    animation = new Animation(spritesheet, 0, 0, 126, 126, 0.1, 8, true, false, 0.5)
    animation.drawFrame(this.game.clockTick, ctx, 715, 310);
    ctx.fillText("Split-Shot: Increase Deflected Lasers", 800, 345)

    //draw the tiny mode powerup
    spritesheet = this.game.assetManager.getAsset('img/powerup_coin_T.png');
    animation = new Animation(spritesheet, 0, 0, 126, 126, 0.1, 8, true, false, 0.5)
    animation.drawFrame(this.game.clockTick, ctx, 715, 400);
    ctx.fillText("Tiny Mode", 800, 435);

    //draw the homing shot powerup
    spritesheet = this.game.assetManager.getAsset('img/powerup_laser.png');
    animation = new Animation(spritesheet,  0, 0, 165, 159, 0.15, 12, true, false, 0.35);
    animation.drawFrame(this.game.clockTick, ctx, 715, 500);
    ctx.fillText("Homing Deflection:", 800, 525);
    ctx.fillText("Deflected Lasers Seek Nearby Droids", 800, 550);

    //draw the checkpoint
    spritesheet = this.game.assetManager.getAsset('img/checkpoint.png');
    animation = new Animation(spritesheet, 0, 0, 64, 188, .1, 8, true, false, 0.5);
    animation.drawFrame(this.game.clockTick, ctx, 730, 580);
    ctx.fillText("Checkpoint", 800, 635);

    ctx.restore();
  }
}



class TextScreen {
  constructor(game, message, color, duration) {
    this.game = game;
    this.message = message;
    this.duration = duration? duration : 10000 /* arbitrarily long */;
    this.font = '30px';
    this.linePieces = message.split("\n");
    this.lines = this.linePieces.length;
    this.color = color ? color : "white";
    this.timer = 0;
  }

  update() {
    this.timer += this.game.clockTick;
    if (this.timer > this.duration) {
      this.removeFromWorld = true;
    }
  }

  draw() {
    this.game.ctx.fillStyle = "black";
    this.game.ctx.fillRect(0, 0, this.game.surfaceWidth, this.game.surfaceHeight);

    this.game.ctx.fillStyle = this.color;
    this.game.ctx.textAlign = "center";
    this.game.ctx.font = this.font + ' ' + smc.GAME_FONT;
    for (let i = 0; i < this.lines; i++) {
      this.game.ctx.fillText(this.linePieces[i], this.game.surfaceWidth / 2, (i + 1) * (this.game.surfaceHeight / 2) / (this.lines + 1) + (this.game.surfaceHeight / 4));
    }
  }
}


class GameOverTextScreen extends TextScreen {
  constructor(game) {
    super(game, "GAME OVER", "red");
    this.font = '80px';
    this.opacity = 0;
    this.deltaOpacity = 1;
  }

  update() {
    super.update();
    this.opacity += this.game.clockTick * this.deltaOpacity;
  }

  draw() {
    this.game.ctx.globalAlpha = this.opacity;
    super.draw();
    this.game.ctx.globalAlpha = 1;
  }
}


class Overlay {

	constructor(game, lighten, timeToFinish) {
		this.game = game;
		this.opacity = lighten ? 1 : 0;
		this.deltaOpacity = 1 / timeToFinish;
		this.lighten = lighten;
		this.timeToFinish = timeToFinish;
		this.timer = 0;
	}

	update() {
		this.timer += this.game.clockTick;
		if (this.lighten) {
			this.opacity -= this.game.clockTick * this.deltaOpacity;
		} else {
			this.opacity += this.game.clockTick * this.deltaOpacity;
		}

		if (this.lighten && this.opacity <= 0) {
			this.removeFromWorld = true;
		}
	}

	draw() {
		this.game.ctx.fillStyle = 'rgb(0,0,0)';
		this.game.ctx.globalAlpha = this.opacity;
		this.game.ctx.fillRect(0, 0, this.game.surfaceWidth, this.game.surfaceHeight);
		this.game.ctx.globalAlpha = 1;
	}

}

class AttributeCollectionScreen {
  constructor(game, SceneManager, tokensOffered) {
    this.game = game;
    this.SceneManager = SceneManager;
    this.tokens = tokensOffered;
    this.timer = 0;

    this.forceHandImg = this.game.assetManager.getAsset('img/force hand.png');
    this.healthHeartImg = this.game.assetManager.getAsset('img/health heart.png');
    this.plusMinusImg = this.game.assetManager.getAsset('img/plus minus.png');
    this.tokenImg = this.game.assetManager.getAsset('img/token.png');
  }

  update() {
    this.timer += this.game.clockTick;

    if (this.game.keys['leftClick']) {
      var clickPoint = this.game.mouse;

      if (this.plusForce(clickPoint)) {
        // console.log("+ F");
        if (this.tokens > 0) {
          this.game.audio.playSoundFx(this.game.audio.plus);
          this.SceneManager.Zerlin.maxForce += smc.TOKEN_VALUE;
          this.tokens--;
        }
      } else if (this.minusForce(clickPoint)) {
        // console.log("- F");
        if (this.SceneManager.Zerlin.maxForce >= smc.TOKEN_VALUE) {
          this.game.audio.playSoundFx(this.game.audio.minus);
          this.SceneManager.Zerlin.maxForce -= smc.TOKEN_VALUE;
          this.tokens++;
        }
      } else if (this.plusHealth(clickPoint)) {
        // console.log("+ H");
        if (this.tokens > 0) {
          this.game.audio.playSoundFx(this.game.audio.plus);
          this.SceneManager.Zerlin.maxHealth += smc.TOKEN_VALUE;
          this.tokens--;
        }
      } else if (this.minusHealth(clickPoint)) {
        // console.log("- H");
        if (this.SceneManager.Zerlin.maxHealth >= smc.TOKEN_VALUE + 1) {
          this.game.audio.playSoundFx(this.game.audio.minus);
          this.SceneManager.Zerlin.maxHealth -= smc.TOKEN_VALUE;
          this.tokens++;
        }
      } else if (this.pressContinue(clickPoint)) {
        // console.log("cont");
        if (this.enableContinue) {
          this.game.audio.playSoundFx(this.game.audio.continue);
          this.continue = true;
        }
      }
      this.game.keys['leftClick'] = false;
    }

    this.enableContinue = this.tokens === 0;
  }

  draw() {
    this.game.ctx.fillStyle = "black";
    this.game.ctx.fillRect(0, 0, this.game.surfaceWidth, this.game.surfaceHeight);

    var oneThirdWidth = this.game.surfaceWidth / 3;
    
    //health
    this.game.ctx.drawImage(this.healthHeartImg, 0, 0, 64, 64, oneThirdWidth - 50, 450, 100, 100);
    this.game.ctx.drawImage(this.plusMinusImg, 0, 0, 74, 30, oneThirdWidth - 75, 550, 150, 60);

    var healthHeight = this.SceneManager.Zerlin.maxHealth * 3;
    this.game.ctx.fillStyle = "#ff0000";
    this.game.ctx.fillRect(oneThirdWidth - 30, 430, 60, -healthHeight - 10);
    this.game.ctx.fillStyle = "#ff8888";
    this.game.ctx.fillRect(oneThirdWidth - 23, 430, 46, -healthHeight - 5);
    this.game.ctx.fillStyle = "#ffffff";
    this.game.ctx.fillRect(oneThirdWidth - 16, 430, 32, -healthHeight);

    //force
    this.game.ctx.drawImage(this.forceHandImg, 0, 0, 64, 64, 2 * oneThirdWidth - 50, 450, 100, 100);
    this.game.ctx.drawImage(this.plusMinusImg, 0, 0, 74, 30, 2 * oneThirdWidth - 75, 550, 150, 60);

    var forceHeight = this.SceneManager.Zerlin.maxForce * 3;
    this.game.ctx.fillStyle = "#0000ff";
    this.game.ctx.fillRect(2 * oneThirdWidth - 30, 430, 60, -forceHeight - 10);
    this.game.ctx.fillStyle = "#8888ff";
    this.game.ctx.fillRect(2 * oneThirdWidth - 23, 430, 46, -forceHeight - 5);
    this.game.ctx.fillStyle = "#ffffff";
    this.game.ctx.fillRect(2 * oneThirdWidth - 16, 430, 32, -forceHeight);

    // tokens
    this.game.ctx.fillStyle = "yellow";
    this.game.ctx.font =  '40px ' + smc.GAME_FONT;
    this.game.ctx.fillText("Tokens Available (spend them wisely):", 250, 75);
    this.game.ctx.fillStyle = "yellow";
    for (let i = 0; i < this.tokens; i++) {
      this.game.ctx.drawImage(this.tokenImg, 0, 0, 64, 64, (i * 40) + 250, 100 + 7 * Math.sin(2 * (this.timer + i*.7)) , 40, 40);
    }

    // continue box
    this.game.ctx.fillStyle = this.continue? "#777777" : "#ffffff";
    this.game.ctx.fillRect(this.game.surfaceWidth/2 - 50, 625, 100, 50);

    this.game.ctx.fillStyle = this.enableContinue? "#000000" : "#aaaaaa";
    this.game.ctx.textAlign = "center";
    this.game.ctx.font =  '25px ' + smc.GAME_FONT;
    this.game.ctx.fillText("continue", this.game.surfaceWidth/2, 650);

  }

  plusForce(point) {
    return point.x >= 2 * this.game.surfaceWidth / 3 
        && point.x <= 2 * this.game.surfaceWidth / 3 + 75
        && point.y >= 550
        && point.y <= 610;
  }

  minusForce(point) {
    return point.x >= 2 * this.game.surfaceWidth / 3 - 75
        && point.x < 2 * this.game.surfaceWidth / 3
        && point.y >= 550
        && point.y <= 610;
  }

  plusHealth(point) {
    return point.x >= this.game.surfaceWidth / 3 
        && point.x <= this.game.surfaceWidth / 3 + 75
        && point.y >= 550
        && point.y <= 610;
  }

  minusHealth(point) {
    return point.x >= this.game.surfaceWidth / 3 - 75
        && point.x < this.game.surfaceWidth / 3
        && point.y >= 550
        && point.y <= 610;
  }

  pressContinue(point) {
    return point.x >= this.game.surfaceWidth/2 - 50 
        && point.x <= this.game.surfaceWidth/2 + 50
        && point.y >= 625
        && point.y <= 675;
  }
}
