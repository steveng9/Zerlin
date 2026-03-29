/*
Zerlin
TCSS 491 - Computational Worlds
Joshua Atherton, Michael Josten, Steven Golob
*/

/**
 * End-of-game credits screen shown after the final level is completed.
 */
class CreditsScene {
  constructor(sm) {
    this.sm = sm;
    this.game = sm.game;

    this.creditsTimer = 0;
    this.startedFinalOverlay = false;
    this.startedOverlay = false;
    this.startedSecondCreditMessage = false;

    this.sceneEntities = [];
    this.sceneEntities.push(new TextScreen(this.game, smc.CREDITS_1));
    this.sceneEntities.push(new Overlay(this.game, true, smc.LEVEL_TRANSITION_OVERLAY_TIME));
  }

  update() {
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

  draw() {
    for (let i = 0; i < this.sceneEntities.length; i++) {
      this.sceneEntities[i].draw();
    }
  }
}
