/*
Zerlin
TCSS 491 - Computational Worlds
Joshua Atherton, Michael Josten, Steven Golob
*/

const puc = Constants.PowerUpConstants;

/*
 * All powerups will extend from this class,
 *
 */
class AbstractPowerUp extends Entity {
  constructor(game, x, y) {
    super(game, x, y, 0, 0);
    this.startY = y;
    this.animation = null;
    this.randomYIntercept = Math.random() * Math.PI * 2;
    this.aliveTime = 0;

    this.time = 0; //active time of powerup
    this.smallScale = 0; //scale of powerup to be placed in powerupStatusBar.
    
  }
  update() {
    super.update();
    this.aliveTime += this.game.clockTick;
    this.y = this.startY + puc.FLOATING_MAGNITUDE * Math.sin(3 * (this.aliveTime + this.randomYIntercept));
    this.boundCircle.y = this.y + this.radius;
  }

  

  draw() {
    var camera = this.sceneManager.camera;
    var dimension = this.boundCircle.radius * 2;
    // only draw if in camera's view
    if (camera.isInView(this, dimension, dimension)) {
      //debug: draw the bounding circle around the droid
      if (puc.DRAW_OUTLINES) {
        this.game.ctx.beginPath();
        this.game.ctx.strokeStyle = "green";
        this.game.ctx.arc(this.boundCircle.x - camera.x,
          this.boundCircle.y, this.boundCircle.radius, 0, Math.PI * 2, false);
        this.game.ctx.stroke();
        this.game.ctx.closePath();
        this.game.ctx.closePath();
        this.game.ctx.restore();
      }
      //child droid can choose which animation is the current one
      // check that animation is not null before drawing.
      if (this.animation) {
        this.animation.drawFrame(this.game.clockTick, this.game.ctx, this.x - camera.x, this.y);
      }
      super.draw();
    }
  }
  
  effect() {
    throw new Error("Can't instantiate AbstractPowerUp");
  }
  deactivate() {

  }
  playSound() {
    this.game.audio.playSoundFx(this.game.audio.item, 'itemPowerup');
  }
}
//Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse, scale)

/*
 * This power up will heal zerlin on pickup
 * will look like a red plus sign
 */
class HealthPowerUp extends AbstractPowerUp {
  constructor(game, spritesheet, x, y) {
    super(game, x, y);
    this.animation = new Animation(spritesheet, 0, 0, 32, 32, 0.1, 5, true, false, puc.HEALTH_SCALE);

    /* bounding circle fields */
    this.radius = (this.animation.frameWidth / 2) * this.animation.scale;
    this.boundCircle = new BoundingCircle(this.x + this.radius, this.y + this.radius, this.radius);


  }
  //heal zerlin to max hp or a certain amount.
  effect() {
    var zerlin = this.sceneManager.Zerlin;
    zerlin.currentHealth += puc.RECOVER_HEALTH_AMOUNT;
    //can't heal past max health
    if (zerlin.currentHealth > zerlin.maxHealth) {
      zerlin.currentHealth = zerlin.maxHealth;
    }
  }
  playSound() {
    //pretty quite, make louder in soundEngine
    this.game.audio.playSoundFx(this.game.audio.item, 'pickupHeartItem');

  }
}

/*
 * Force powerup will recover zerlins force power on pickup.
 */
class ForcePowerUp extends AbstractPowerUp {
  constructor(game, spritesheet, x, y) {
    super(game, x, y);
    this.animation = new Animation(spritesheet, 0, 0, 32, 32, 0.1, 9, true, false, puc.FORCE_SCALE);

    /* bounding circle */
    this.radius = (this.animation.frameWidth / 2) * this.animation.scale;
    this.boundCircle = new BoundingCircle(this.x + this.radius, this.y + this.radius, this.radius);
  }

  //recover zerlin's force power to max or a certain amount
  effect() {
    var zerlin = this.sceneManager.Zerlin;
    zerlin.currentForce += puc.RECOVER_FORCE_AMOUNT;
    if (zerlin.currentForce > zerlin.maxForce) {
      zerlin.currentForce = zerlin.maxForce;
    }

  }
}

/*
 * This power up will make zerlin invincible to a certain amount of time
 * perhaps could have some sort of visual effect to show zerlin is
 * invincible, like a white outline, may need to draw another sprite sheet.
 * circle bounding box that has some alpha to make the force field transparent.
 */
//Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse, scale)

class InvincibilityPowerUp extends AbstractPowerUp {
  constructor(game, spritesheet, x, y) {
    super(game, x, y);
    this.animation = new Animation(spritesheet, 0, 0, 32, 32, 0.1, 9, true, false, puc.INVINCIBILITY_SCALE);

    /* bounding circle */
    this.radius = (this.animation.frameWidth / 2) * this.animation.scale;
    this.boundCircle = {
      radius: this.radius,
      x: this.x + this.radius,
      y: this.y + this.radius
    };

    this.time = puc.INVINCIBILITY_TIME;
    this.smallScale = 1.5;
  }

  effect() {
    //this.sceneManager.Zerlin.invincible = true;
    this.sceneManager.Zerlin.enableInvincibility();
  }
}

/*
 * This power up will make the deflected laser automatically
 * go to the nearest droid
 */
class HomingLaserPowerUp extends AbstractPowerUp {
  constructor(game, x, y) {
    super(game, x, y);
    this.animation = new Animation(this.game.assetManager.getAsset('img/ui/powerup_laser.png'), 0, 0, 165, 159, 0.15, 12, true, false, puc.LASER_IMAGE_SCALE);

    /* bounding circle */
    this.radius = (this.animation.frameWidth / 2) * this.animation.scale;
    this.boundCircle = {
      radius: this.radius,
      x: this.x + this.radius,
      y: this.y + this.radius
    };
    this.time = puc.HOMING_LASER_TIME;
    this.smallScale = puc.HOMING_LASER_STATUS_BAR_SCALE;
  }

  effect() {
    this.game.sceneManager.Zerlin.lightsaber.enableHomingLasers();
  }
}


class SplitLaserPowerUp extends AbstractPowerUp {
  constructor(game, x, y) {
    super(game, x, y);
    this.animation = new Animation(this.game.assetManager.getAsset('img/ui/powerup_coin.png'), 0, 0, 126, 126, 0.1, 8, true, false, puc.COIN_IMAGE_SCALE);

    /* bounding circle */
    this.radius = (this.animation.frameWidth / 2) * this.animation.scale;
    this.boundCircle = {
      radius: this.radius,
      x: this.x + this.radius,
      y: this.y + this.radius
    };

    this.time = puc.SPLIT_SHOT_TIME;
    this.smallScale = 0.30;
  }

  effect() {
    //this.game.sceneManager.Zerlin.lightsaber.splitLasers = true;
    this.sceneManager.Zerlin.lightsaber.enableSplitLasers();
  }
}



class TinyModePowerUp extends AbstractPowerUp {
  constructor(game, x, y) {
    super(game, x, y);
    this.animation = new Animation(this.game.assetManager.getAsset('img/ui/powerup_coin_T.png'), 0, 0, 126, 126, 0.1, 8, true, false, puc.COIN_IMAGE_SCALE);

    /* bounding circle */
    this.radius = (this.animation.frameWidth / 2) * this.animation.scale;
    this.boundCircle = {
      radius: this.radius,
      x: this.x + this.radius,
      y: this.y + this.radius
    };
    this.time = puc.TINY_MODE_TIME;
    this.smallScale = 0.30;
  }

  effect() {
    this.game.sceneManager.Zerlin.shrink();
  }
}

//MultiplyLaserDeflectionPowerUp
//will create multiple lasers that will go at different angles for each
//laser deflected

//SlowTimePowerUp
//will slow down time for a certain amount of time.

//ForcePowerUp
//recharge force power
