/*
Zerlin
TCSS 491 - Computational Worlds
Joshua Atherton, Michael Josten, Steven Golob
*/

/*
* Checkpoint is an entity which will modify Zerlins spawn location so that on death, he spawns at that
* location. The checkpoint will be reset on level transition.
*/

const cpc = Constants.CheckPointConstants;

class CheckPoint extends Entity {
    constructor(game, x, y) {
        // y value is where it rests on platform
        super(game, x, y - 186);
        this.animation = new Animation(game.assetManager.getAsset("img/checkpoint.png"), 0, 0, 64, 188, .1, 8, true, false, 1);
        this.boundingBox = new BoundingBox(this.x, this.y, this.animation.frameWidth, this.animation.frameHeight);
    }

    update() {
        super.update()
    }

    draw() {
        var camera = this.game.sceneManager.camera;
        if (camera.isInView(this, this.boundingBox.width, this.boundingBox.height)) {
            this.animation.drawFrame(this.game.clockTick, this.game.ctx, this.x - camera.x, this.y);
            super.draw();
        }
    }

    playSound() {
        this.game.audio.playSoundFx(this.game.audio.item, 'itemPowerup');
    }
}