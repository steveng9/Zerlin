/*
Zerlin
TCSS 491 - Computational Worlds
Joshua Atherton, Michael Josten, Steven Golob
*/

/**
 * Interstitial scene displayed between levels. Shows a level-title message
 * and waits for the player to press Enter before loading the level.
 */
class LevelTransitionScene {
  constructor(sm) {
    this.sm = sm;
    this.game = sm.game;

    this.game.keys['Enter'] = false;
    this.levelTransitionTimer = 0;
    this.startedFinalOverlay = false;
    this.overlayTimer = 0;

    this.sceneEntities = [];
    switch (sm.levelNumber) {
      case 1:
        this.sceneEntities.push(new TextScreen(this.game, smc.LEVEL_ONE_TEXT));
        break;
      case 2:
        this.sceneEntities.push(new TextScreen(this.game, smc.LEVEL_TWO_MESSAGE));
        break;
      case 3:
        this.sceneEntities.push(new TextScreen(this.game, smc.LEVEL_THREE_MESSAGE));
        break;
    }
    this.sceneEntities.push(new Overlay(this.game, true, smc.LEVEL_TRANSITION_OVERLAY_TIME));
  }

  update() {
    if (!this.startedFinalOverlay && this.game.keys['Enter']) {
      this.startedFinalOverlay = true;
      this.sceneEntities.push(new Overlay(this.game, false, smc.LEVEL_TRANSITION_OVERLAY_TIME));
      this.overlayTimer = smc.LEVEL_TRANSITION_OVERLAY_TIME;
    }
    this.sm.musicMenu.update();
    this.overlayTimer -= this.game.clockTick;

    for (let i = this.sceneEntities.length - 1; i >= 0; i--) {
      this.sceneEntities[i].update();
      if (this.sceneEntities[i].removeFromWorld) {
        this.sceneEntities.splice(i, 1);
      }
    }
    if (this.startedFinalOverlay && this.overlayTimer <= 0) {
      this.sm.startLevelScene();
    }
  }

  draw() {
    for (let i = 0; i < this.sceneEntities.length; i++) {
      this.sceneEntities[i].draw();
    }
    this.sm.musicMenu.draw();

    if (!this.startedFinalOverlay) {
      this.game.ctx.fillStyle = "#777777";
      this.game.ctx.textAlign = "center";
      this.game.ctx.font = '20px ' + smc.GAME_FONT;
      this.game.ctx.fillText("press enter to continue", this.game.surfaceWidth / 2, 600);
    }
  }
}
