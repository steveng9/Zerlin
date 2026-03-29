/*
Zerlin
TCSS 491 - Computational Worlds
Joshua Atherton, Michael Josten, Steven Golob
*/

/**
 * Between-level attribute allocation screen. Transitions to LevelTransitionScene
 * when the player has spent all tokens and clicks Continue.
 */
class CollectionScene {
  constructor(sm) {
    this.sm = sm;
    this.game = sm.game;

    this.timer = 0;
    this.startedFinalOverlay = false;
    this.overlayTimer = 0;

    this.sceneEntities = [];
    this.collectionScreen = new AttributeCollectionScreen(this.game, this.sm, 5);
    this.sceneEntities.push(this.collectionScreen);
    this.sceneEntities.push(new Overlay(this.game, true, smc.LEVEL_TRANSITION_OVERLAY_TIME));
  }

  update() {
    this.sm.musicMenu.update();
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
      this.sm.startLevelTransitionScene();
    }
  }

  draw() {
    for (let i = 0; i < this.sceneEntities.length; i++) {
      this.sceneEntities[i].draw();
    }
    this.sm.musicMenu.draw();
  }
}
