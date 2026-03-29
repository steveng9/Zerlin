/*
Zerlin
TCSS 491 - Computational Worlds
Joshua Atherton, Michael Josten, Steven Golob
*/

/*
 * UI entities used across multiple scenes: pause overlay, text screens,
 * fade overlay, and the between-level attribute collection screen.
 *
 * Loaded after SceneManager.js so the shared `smc` constant is already
 * declared in the global scope and can be used directly here.
 */


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
    var image = this.game.assetManager.getAsset('img/hero/jump.png');
    ctx.drawImage(image, 50, 10, 35, 35 * image.height/image.width);
    ctx.textAlign = "left";
    ctx.font = "22px " + smc.GAME_FONT;
    ctx.fillText("Regular Jump: W", 100, 40);
    ctx.fillText("Force Jump: Shift + W", 100, 70)

    //draw roll control
    image = this.game.assetManager.getAsset('img/hero/roll.png');
    ctx.drawImage(image, 40, 125, 50, 50 * image.height/image.width);
    ctx.fillText("Left Roll: A + S", 100, 140);
    ctx.fillText("Right Roll: D + S", 100, 170);

    //draw slash control
    image = this.game.assetManager.getAsset('img/hero/slash.png');
    ctx.drawImage(image, 40, 200, 50, 50 * image.height/image.width);
    ctx.fillText("Slash: Spacebar", 100, 250);

    //draw crouch control
    image = this.game.assetManager.getAsset('img/hero/crouch.png');
    ctx.drawImage(image, 40, 300, 40, 40 * image.height/image.width);
    ctx.fillText("Crouch: X", 100, 340);

    //draw flip lightsaber control
    image = this.game.assetManager.getAsset('img/hero/flip_saber.png');
    ctx.drawImage(image, 35, 390, 50, 50 * image.height/image.width);
    ctx.fillText("Flip Saber: Right Click", 100, 410);

    //draw throw saber control
    image = this.game.assetManager.getAsset('img/hero/saber_throw.png');
    ctx.drawImage(image, 35, 470, 50, 50 * image.height/image.width);
    ctx.fillText("Throw Saber: Left Click", 100, 495);

    //draw lightning control
    image = this.game.assetManager.getAsset('img/hero/lightning.png');
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
    var spritesheet = this.game.assetManager.getAsset('img/ui/powerup_health.png');
    var animation = new Animation(spritesheet, 0, 0, 32, 32, 0.1, 5, true, false, 3);
    animation.drawFrame(this.game.clockTick, ctx, 700, 10);
    ctx.fillText("Health: Fully Heals Zerlin", 800, 60);

    //draw the force powerup
    spritesheet = this.game.assetManager.getAsset('img/ui/powerup_force.png');
    animation = new Animation(spritesheet, 0, 0, 32, 32, 0.1, 9, true, false, 3);
    animation.drawFrame(this.game.clockTick, ctx, 700, 110);
    ctx.fillText("Force: Fully Recover Force Power", 800, 160);

    //draw the invincibility powerup
    spritesheet = this.game.assetManager.getAsset('img/ui/powerup_invincibility.png');
    animation = new Animation(spritesheet, 0, 0, 32, 32, 0.1, 9, true, false, 2.5);
    animation.drawFrame(this.game.clockTick, ctx, 705, 210);
    ctx.fillText("Invincibility", 800, 255);

    //draw the split shot powerup
    spritesheet = this.game.assetManager.getAsset('img/ui/powerup_coin.png');
    animation = new Animation(spritesheet, 0, 0, 126, 126, 0.1, 8, true, false, 0.5)
    animation.drawFrame(this.game.clockTick, ctx, 715, 310);
    ctx.fillText("Split-Shot: Increase Deflected Lasers", 800, 345)

    //draw the tiny mode powerup
    spritesheet = this.game.assetManager.getAsset('img/ui/powerup_coin_T.png');
    animation = new Animation(spritesheet, 0, 0, 126, 126, 0.1, 8, true, false, 0.5)
    animation.drawFrame(this.game.clockTick, ctx, 715, 400);
    ctx.fillText("Tiny Mode", 800, 435);

    //draw the homing shot powerup
    spritesheet = this.game.assetManager.getAsset('img/ui/powerup_laser.png');
    animation = new Animation(spritesheet,  0, 0, 165, 159, 0.15, 12, true, false, 0.35);
    animation.drawFrame(this.game.clockTick, ctx, 715, 500);
    ctx.fillText("Homing Deflection:", 800, 525);
    ctx.fillText("Deflected Lasers Seek Nearby Droids", 800, 550);

    //draw the checkpoint
    spritesheet = this.game.assetManager.getAsset('img/ui/checkpoint.png');
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

    this.forceHandImg = this.game.assetManager.getAsset('img/hero/force hand.png');
    this.healthHeartImg = this.game.assetManager.getAsset('img/ui/health heart.png');
    this.plusMinusImg = this.game.assetManager.getAsset('img/ui/plus minus.png');
    this.tokenImg = this.game.assetManager.getAsset('img/ui/token.png');
  }

  update() {
    this.timer += this.game.clockTick;

    if (this.game.keys['leftClick']) {
      var clickPoint = this.game.mouse;

      if (this.plusForce(clickPoint)) {
        if (this.tokens > 0) {
          this.game.audio.playSoundFx(this.game.audio.plus);
          this.SceneManager.Zerlin.maxForce += smc.TOKEN_VALUE;
          this.tokens--;
        }
      } else if (this.minusForce(clickPoint)) {
        if (this.SceneManager.Zerlin.maxForce >= smc.TOKEN_VALUE) {
          this.game.audio.playSoundFx(this.game.audio.minus);
          this.SceneManager.Zerlin.maxForce -= smc.TOKEN_VALUE;
          this.tokens++;
        }
      } else if (this.plusHealth(clickPoint)) {
        if (this.tokens > 0) {
          this.game.audio.playSoundFx(this.game.audio.plus);
          this.SceneManager.Zerlin.maxHealth += smc.TOKEN_VALUE;
          this.tokens--;
        }
      } else if (this.minusHealth(clickPoint)) {
        if (this.SceneManager.Zerlin.maxHealth >= smc.TOKEN_VALUE + 1) {
          this.game.audio.playSoundFx(this.game.audio.minus);
          this.SceneManager.Zerlin.maxHealth -= smc.TOKEN_VALUE;
          this.tokens++;
        }
      } else if (this.pressContinue(clickPoint)) {
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
