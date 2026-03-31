/*
Zerlin
TCSS 491 - Computational Worlds
Joshua Atherton, Michael Josten, Steven Golob
*/

/**
 * Main campaign gameplay scene. Runs the entity update loop, handles boss
 * lifecycle, detects win/death conditions, and transitions to the next scene.
 *
 * Scene-local state lives here. Shared state (Zerlin, camera, entity arrays,
 * level, collisionManager, etc.) is accessed via this.sm.
 */
class LevelScene {
  constructor(sm) {
    this.sm = sm;
    this.game = sm.game;

    this.levelSceneTimer = 0;
    this.wonLevel = false;
    this.timeSinceBossDeath = 0;
    this.startedFinalOverlay = false;
    this.startNewScene = false;
    this.stopLevelTime = 0;
    this.initiallyPaused = false;
    this.bossMusicSwitched = false;
    this.bossHealthBar = null;

    this.sceneEntities = [];
    if (sm.levelNumber == 3) {
      this.sceneEntities.push(new ParallaxSnowBackground(this.game, this.sm, 300));
      this.sceneEntities.push(new ParallaxSnowBackground(this.game, this.sm, 200));
      this.sceneEntities.push(new ParallaxSnowBackground(this.game, this.sm, 100));
    }
  }

  update() {
    this.levelSceneTimer += this.game.clockTick;
    this.sm.musicMenu.update();

    if (!this.sm.paused) {
      if (this.sm.boss && !this.bossHealthBar) {
        this.bossHealthBar = new BossHealthStatusBar(
          this.game,
          this.game.surfaceWidth * 0.25,
          680,
          this.sm.boss);
      }
      this.sm.Zerlin.update();
      this.sm.camera.update();
      this.sm.level.update();

      for (var i = this.sm.droids.length - 1; i >= 0; i--) {
        this.sm.droids[i].update();
        if (this.sm.droids[i].removeFromWorld) {
          this.sm.droids.splice(i, 1);
        }
      }
      for (var i = this.sm.lasers.length - 1; i >= 0; i--) {
        this.sm.lasers[i].update();
        if (this.sm.lasers[i].removeFromWorld) {
          this.sm.lasers.splice(i, 1);
        }
      }
      for (var i = this.sm.powerups.length - 1; i >= 0; i--) {
        this.sm.powerups[i].update();
        if (this.sm.powerups[i].removeFromWorld) {
          this.sm.powerups.splice(i, 1);
        }
      }
      for (var i = this.sm.activePowerups.length - 1; i >= 0; i--) {
        this.sm.activePowerups[i].update(i);
        if (this.sm.activePowerups[i].removeFromWorld) {
          this.sm.activePowerups.splice(i, 1);
        }
      }
      for (var i = this.sm.otherEntities.length - 1; i >= 0; i--) {
        this.sm.otherEntities[i].update();
        if (this.sm.otherEntities[i].removeFromWorld) {
          this.sm.otherEntities.splice(i, 1);
        }
      }

      if (this.sm.boss) {
        this.sm.boss.update();
        if (!this.bossMusicSwitched) {
          this.game.audio.playBossSong();
          this.bossMusicSwitched = true;
        }
      }
      if (this.bossHealthBar) {
        this.bossHealthBar.update();
      }

      this.sm.collisionManager.handleCollisions();

      for (let i = this.sceneEntities.length - 1; i >= 0; i--) {
        this.sceneEntities[i].update();
        if (this.sceneEntities[i].removeFromWorld) {
          this.sceneEntities.splice(i, 1);
        }
      }
    }

    if (!this.initiallyPaused && this.levelSceneTimer > smc.PAUSE_TIME_AFTER_START_LEVEL) {
      this.initiallyPaused = true;
      this.sm.canPause = true;
      this.sm.pause();
    }

    if (this.sm.boss && !this.sm.boss.alive || (this.sm.boss == null && this.sm.level.unspawnedBoss == null
          && this.sm.droids.length == 0 && this.sm.Zerlin.x >= this.sm.level.getLengthAtI(5)) && !this.wonLevel) {
      console.log("level won");
      this.sm.canPause = false;
      this.wonLevel = true;
      this.sm.boss = null;
      this.sm.saveProgress();
      this.startedFinalOverlay = true;
      this.timeSinceBossDeath = 0;
      this.sceneEntities.push(new Overlay(this.game, false, smc.LEVEL_COMPLETE_OVERLAY_TIME));
      for (var i = this.sm.droids.length - 1; i >= 0; i--) {
        this.sm.droids[i].explode();
      }
    }
    if (this.wonLevel) {
      this.sm.newLevel = true;
      this.timeSinceBossDeath += this.game.clockTick;
      if (this.timeSinceBossDeath > smc.LEVEL_COMPLETE_OVERLAY_TIME) {
        this.sm.levelNumber++;
        if (this.sm.levelNumber > smc.NUM_LEVELS) {
          this.sm.startCreditsScene();
        } else {
          this.sm.startCollectionScene();
        }
      }
    }
    if (!this.startedFinalOverlay && !this.sm.Zerlin.alive) {
      this.sm.canPause = false;
      if (this.levelSceneTimer > this.sm.Zerlin.timeOfDeath + this.sm.Zerlin.deathAnimation.totalTime) {
        this.startedFinalOverlay = true;
        this.sceneEntities.push(new Overlay(this.game, false, smc.LEVEL_TRANSITION_OVERLAY_TIME));
        this.sceneEntities.push(new GameOverTextScreen(this.game));
        this.stopLevelTime = this.levelSceneTimer + 6;
        this.startNewScene = true;
      }
    }

    if ((this.levelSceneTimer > this.stopLevelTime && this.startNewScene)
     || (!this.sm.Zerlin.alive && this.game.keys['Enter'])) {
      this.game.audio.endAllSoundFX();
      this.sm.startLevelTransitionScene();
      this.startNewScene = false;
    }
  }

  draw() {
    this.sm.camera.draw();
    this.sm.level.draw();
    this.sm.level.drawEntityShadows([this.sm.Zerlin], this.sm.droids);
    this.sm.Zerlin.draw();
    for (var i = 0; i < this.sm.droids.length; i++) {
      this.sm.droids[i].draw();
    }
    for (var i = 0; i < this.sm.lasers.length; i++) {
      this.sm.lasers[i].draw();
    }
    if (this.sm.boss) {
      this.sm.boss.draw();
    }
    if (this.bossHealthBar) {
      this.bossHealthBar.draw();
    }
    for (var i = 0; i < this.sm.powerups.length; i++) {
      this.sm.powerups[i].draw();
    }
    for (var i = 0; i < this.sm.activePowerups.length; i++) {
      this.sm.activePowerups[i].draw();
    }
    for (var i = 0; i < this.sm.otherEntities.length; i++) {
      this.sm.otherEntities[i].draw();
    }
    for (let i = 0; i < this.sceneEntities.length; i++) {
      this.sceneEntities[i].draw();
    }

    if (this.sm.paused) {
      this.sm.pauseScreen.draw();
    }
    this.sm.musicMenu.draw();
  }
}
