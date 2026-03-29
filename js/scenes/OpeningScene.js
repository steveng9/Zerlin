/*
Zerlin
TCSS 491 - Computational Worlds
Joshua Atherton, Michael Josten, Steven Golob
*/

/**
 * The cinematic opening sequence (campfire → message → title → ship takeoff).
 * Transitions to CollectionScene when complete.
 */
class OpeningScene {
  constructor(sm) {
    this.sm = sm;
    this.game = sm.game;

    this.sequence = 1;
    this.openingSceneTimer = 0;
    this.seq4CameraPanTimer = 0;

    this.seq1EndTime = smc.OPENING_SEQUENCE_1_TIME;
    this.seq2EndTime = this.seq1EndTime + smc.OPENING_MESSAGE_TIME;
    this.seq3EndTime = this.seq2EndTime + smc.OPENING_TITLE_TIME;
    this.seq4EndTime = this.seq3EndTime + smc.OPENING_SEQUENCE_4_TIME;

    this.sceneEntities = [];
    this.sceneEntities.push(new ParallaxRotatingBackground(this.game, this.sm, 'img/levels/opening/opening stars.png', 1, 15000));
    this.sceneEntities.push(new ParallaxScrollBackground(this.game, this.sm, 'img/levels/opening/opening oasis 6.png', 1, 15000, 0, -50));
    this.sceneEntities.push(new ParallaxScrollBackground(this.game, this.sm, 'img/levels/opening/opening oasis 5.png', 1, 9500, 0, 30));
    this.sceneEntities.push(new ParallaxScrollBackground(this.game, this.sm, 'img/levels/opening/opening oasis 4.png', 1, 6000, 0, -20));
    this.sceneEntities.push(new ParallaxScrollBackground(this.game, this.sm, 'img/levels/opening/opening oasis 3.png', 1, 2400, 0, -20));
    this.sceneEntities.push(new ParallaxScrollBackground(this.game, this.sm, 'img/levels/opening/opening oasis 2.png', 1, 1300, 0, -265));
    this.sceneEntities.push(new ParallaxScrollBackground(this.game, this.sm, 'img/levels/opening/opening oasis 1.png', 1, 900, 0, -170));
    this.sceneEntities.push(new ParallaxAnimatedBackground(this.game, this.sm,
      new Animation(this.game.assetManager.getAsset('img/hero/zerlin at fire.png'), 0, 0, 600, 600, .125, 6, true, false, .5),
      1, 800, 470, 450));
    this.sceneEntities.push(new Overlay(this.game, true, smc.OPENING_OVERLAY_TIME));

    this.game.audio.playSoundFx(this.game.audio.campFire);

    this.playGame = false;
    document.getElementById("loginButton").addEventListener('click', () => {
      if (this.openingSceneTimer > smc.OPENING_SCENE_STOP_CAMERA_PAN) {
        this.playGame = true;
        document.getElementById("formOverlay").style.display = "none";
      }
    });
  }

  update() {
    if (!this.sm.canPause && this.game.keys['Enter']) {
      this.game.audio.campFire.stop();
      this.sm.startCollectionScene();
      document.getElementById("formOverlay").style.display = "none";
    }

    this.sm.musicMenu.update();
    this.openingSceneTimer += this.game.clockTick;

    // sequence 1: camera panning down on Zerlin sitting by the fire
    if (this.openingSceneTimer < smc.OPENING_SCENE_CAMERA_PAN_TIME) {
      this.sm.camera.y = -Math.pow(this.openingSceneTimer - smc.OPENING_SCENE_CAMERA_PAN_TIME, 2) * 280;
    } else if (!this.seq1FadingOut && this.openingSceneTimer > this.seq1EndTime - smc.OPENING_OVERLAY_TIME) {
      this.seq1FadingOut = true;
      this.sceneEntities.push(new Overlay(this.game, false, smc.OPENING_OVERLAY_TIME));

    // sequence 2: opening message
    } else if (this.sequence == 1 && this.openingSceneTimer > this.seq1EndTime) {
      this.game.audio.campFire.stop();
      this.sequence = 2;
      this.sceneEntities.pop();
      this.sceneEntities.push(new TextScreen(this.game, smc.OPENING_MESSAGE, "white", smc.OPENING_MESSAGE_TIME));
      this.sceneEntities.push(new Overlay(this.game, true, smc.OPENING_OVERLAY_TIME));
    } else if (!this.seq2FadingOut && this.openingSceneTimer > this.seq2EndTime - smc.OPENING_OVERLAY_TIME) {
      this.seq2FadingOut = true;
      this.sceneEntities.push(new Overlay(this.game, false, smc.OPENING_OVERLAY_TIME));

    // sequence 3: title
    } else if (this.sequence == 2 && this.openingSceneTimer > this.seq2EndTime) {
      this.sceneEntities.pop();
      this.sequence = 3;
      this.sceneEntities.push(new TextScreen(this.game, "", "white"));
      this.sceneEntities.push(new ParallaxAnimatedBackground(this.game, this.sm,
        new Animation(this.game.assetManager.getAsset('img/ui/title.png'), 0, 0, 1026, 342, .145, 66, false, false, .5),
        1, 200, (this.game.surfaceWidth - 1026 * .5) / 2, (this.game.surfaceHeight - 342 * .5) / 2));
      this.sceneEntities.push(new Overlay(this.game, true, smc.OPENING_OVERLAY_TIME * .8));
    } else if (!this.seq3FadingOut && this.openingSceneTimer > this.seq3EndTime - smc.OPENING_OVERLAY_TIME) {
      this.seq3FadingOut = true;
      this.sceneEntities.push(new Overlay(this.game, false, smc.OPENING_OVERLAY_TIME * .8));

    // sequence 4: Zerlin takes off in rocket
    } else if (this.sequence == 3 && this.openingSceneTimer > this.seq3EndTime) {
      this.sceneEntities.pop(); // overlay
      this.sceneEntities.pop(); // title
      this.sceneEntities.pop(); // title background
      this.sceneEntities.pop(); // Zerlin by fire
      this.sequence = 4;
      this.sm.camera.x = 1400;
      this.sceneEntities.push(new ParallaxAnimatedBackground(this.game, this.sm,
        new Animation(this.game.assetManager.getAsset('img/effects/ship take off.png'), 0, 0, 600, 600, .18, 38, false, false, 1.5),
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
        this.sm.camera.y = -Math.pow(this.seq4CameraPanTimer, 2) * 280;
      }

      if (!this.addedTwinkleStar && this.seq4CameraPanTimer > 4.7) {
        this.addedTwinkleStar = true;
        this.sceneEntities.push(new ParallaxAnimatedBackground(this.game, this.sm,
          new Animation(this.game.assetManager.getAsset('img/effects/twinkling star.png'), 0, 0, 64, 64, .05, 14, false, false, .9),
          1, 99999999, 964, 95));
      }

      if (!this.seq4FadingOut && this.openingSceneTimer > this.seq4EndTime - smc.OPENING_OVERLAY_TIME) {
        this.seq4FadingOut = true;
        this.sceneEntities.push(new Overlay(this.game, false, smc.OPENING_OVERLAY_TIME));
      }

      if (this.openingSceneTimer > this.seq4EndTime) {
        this.sm.startCollectionScene();
      }
    }

    for (let i = this.sceneEntities.length - 1; i >= 0; i--) {
      this.sceneEntities[i].update();
      if (this.sceneEntities[i].removeFromWorld) {
        this.sceneEntities.splice(i, 1);
      }
    }
  }

  draw() {
    for (let i = 0; i < this.sceneEntities.length; i++) {
      this.sceneEntities[i].draw();
    }
    this.sm.musicMenu.draw();
  }
}
