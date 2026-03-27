/*
Zerlin
TCSS 491 - Computational Worlds
Joshua Atherton, Michael Josten, Steven Golob
*/

const zc = Constants.ZerlinConstants;
var camConst = Constants.CameraConstants;
var kc = Constants.KeyConstants;

class Zerlin extends Entity {

  constructor(game, camera, sceneManager) {
    // NOTE: this.x is CENTER of Zerlin, not left side of image. this.y is feet.
    super(game, game.surfaceWidth * camConst.ZERLIN_POSITION_ON_SCREEN + zc.Z_SPAWN_X, 0, 0, 0);
    this.sceneManager = sceneManager;
    this.infiniteHealth = this.sceneManager.infiniteHealth;
    this.assetManager = game.assetManager;
    this.camera = camera;
    this.ctx = game.ctx;
    this.createAnimations();
    this.reset();
    this.maxHealth = this.infiniteHealth ? 999999 : zc.Z_MAX_HEALTH;
    this.maxForce = zc.Z_MAX_FORCE;

    /* Fields tracked by the status bar */
  }

  reset() {
    this.x = this.game.surfaceWidth * camConst.ZERLIN_POSITION_ON_SCREEN + zc.Z_SPAWN_X;
    if (!this.sceneManager.checkPoint.boundingBox.x == 0) {
      this.x = this.sceneManager.checkPoint.boundingBox.x + this.sceneManager.checkPoint.boundingBox.width/4;
    }
    this.y = 0;
    this.deltaX = 0;
    this.deltaY = 0;
    this.alive = true;
    this.direction = 0; // -1 = left, 0 = still, 1 = right
    this.somersaulting = false;
    this.crouching = false;
    this.falling = true;
    this.forceJumping = false;
    this.armSocketY = zc.Z_ARM_SOCKET_Y;
    this.faceRight();

    /* Zerlin Status' */
    this.currentHealth = this.maxHealth;
    this.currentForce = this.maxForce;

    this.scale = zc.Z_SCALE;
    this.lightsaber = new Lightsaber(this.game, this);
    this.deathAnimation.elapsedTime = 0;


    /* powerup status' of zerlin */
    this.invincible = false;
    this.iSeconds = Constants.PowerUpConstants.INVINCIBILITY_TIME; //invincibility seconds
    this.iColor = 'rgba(14, 61, 220, 1)';

    /* poisoned */
    this.poisoned = false;
    this.poisonedCounter = 0;
    this.poisonedMaxTime = Constants.DroidBossConstants.POISON_LASER_DURATION;
  }

  setHealth() {
    this.maxHealth = this.infiniteHealth ? 999999 : zc.Z_MAX_HEALTH;
    this.currentHealth = this.maxHealth;
    this.maxForce = zc.Z_MAX_FORCE;
    this.currentForce = this.maxForce;
  }

  update() {
    // check basic movement
    if (this.alive) {
      if(this.infiniteHealth) {
        if (this.y >= 700) {
          this.deltaY -= 120;
        }
      }

      if (this.poisoned) {
        this.currentHealth -= Constants.DroidBossConstants.POISION_LASER_DAMAGE_PER_TICK * this.game.clockTick;
        this.poisonedCounter += 1 * this.game.clockTick;
        // console.log(this.currentHealth, 'poisoned');
        if (this.poisonedCounter > this.poisonedMaxTime) {
          this.poisoned = false;
          this.poisonedCounter = 0;
          // console.log('not poisoned');
        }
      }

      // manage force regeneration

      if (this.currentForce < this.maxForce) {
        this.currentForce += zc.Z_FORCE_REGEN_PER_SECOND * this.game.clockTick * this.maxForce; // recharge is faster with higher capacity
      }

      //check basic status
      if (this.invincible) {
        this.iSeconds -= this.game.clockTick;
        if (this.iSeconds <= 0) {
          this.invincible = false;
          this.iSeconds = Constants.PowerUpConstants.INVINCIBILITY_TIME;
        }
      }

      if (this.tiny) {
        this.adjustTinyScale();
      }




      //move zerlin around
      if (this.game.mouse.x + this.camera.x < this.x && this.facingRight) {
        this.faceLeft();
      } else if (this.game.mouse.x + this.camera.x > this.x && !this.facingRight) {
        this.faceRight();
      } else if (!this.game.keys[kc.MOVE_RIGHT] && !this.game.keys[kc.MOVE_LEFT]) {
        this.direction = 0;
        if (!this.isInManeuver()) {
          this.deltaX = 0;
        }
      } else if (this.game.keys[kc.MOVE_RIGHT] && this.game.keys[kc.MOVE_LEFT]) {
        this.direction = 0;
        if (!this.isInManeuver()) {
          this.deltaX = 0;
        }
      } else if (this.game.keys[kc.MOVE_RIGHT] && !this.game.keys[kc.MOVE_LEFT]) { // TODO: change keys to constants
        this.direction = 1;
        if (!this.isInManeuver() || (this.slashing && this.falling)) {
          this.deltaX = zc.Z_WALKING_SPEED;
        }
      } else if (!this.game.keys[kc.MOVE_RIGHT] && this.game.keys[kc.MOVE_LEFT]) {
        this.direction = -1;
        if (!this.isInManeuver() || (this.slashing && this.falling)) {
          this.deltaX = -zc.Z_WALKING_SPEED;
        }
      }

      // check adding new maneuver
      if (!this.isInManeuver()) {
        if (this.game.keys[kc.ROLL] && this.direction !== 0 && !this.falling) {
          //check if zerlin has enough force power for the somersault
          if (this.currentForce - zc.Z_SOMERSAULT_FORCE_COST >= 0) {
            this.startSomersault();
          }

        } else if (this.game.keys[kc.JUMP_FORCE] && this.game.keys[kc.JUMP] && !this.falling) {
          //check if zerlin has enough force for force jump
          this.tile = null;
          this.falling = true;
          if (this.currentForce - zc.Z_FORCE_JUMP_FORCE_COST >= 0) {
            /** for testing sound */
            this.game.audio.playSoundFx(this.game.audio.hero, 'forceJump', 0.2);
            this.deltaY = zc.FORCE_JUMP_DELTA_Y;
            //make force jump cost force power
            this.currentForce -= zc.Z_FORCE_JUMP_FORCE_COST;
            // turn off saber — player is vulnerable until just before peak
            this.forceJumping = true;
            this.game.audio.saberHum.stop();
            this.lightsaber.hidden = true;
          }
          //otherwise do a regular jump
          else {
            this.deltaY = zc.JUMP_DELTA_Y;
          }

        } else if (this.game.keys[kc.JUMP] && !this.falling) {
          this.tile = null;
          this.falling = true;
          this.deltaY = zc.JUMP_DELTA_Y;
        } else if (this.game.keys[kc.SLASH] && !this.lightsaber.throwing) {
          this.startSlash();
        } else if (this.game.keys[kc.CROUCH] && !this.falling) {
          this.crouch();
        }
      }

      if (this.falling) {
        this.lastBottom = this.boundingbox.bottom;
        this.deltaY += zc.GRAVITATIONAL_ACCELERATION * this.game.clockTick;
        // re-ignite saber just before the peak of a force jump
        if (this.forceJumping && this.deltaY > zc.FORCE_JUMP_REIGNITE_THRESHOLD) {
          this.forceJumping = false;
          this.game.audio.playSoundFx(this.game.audio.lightsaber, 'lightsaberOn', 0.04);
          this.game.audio.playSoundFx(this.game.audio.saberHum);
          this.lightsaber.hidden = false;
        }
      }

      if (this.somersaulting) {
        this.deltaX = zc.Z_SOMERSAULT_SPEED * this.somersaultingDirection;
        if (this.isAnimationDone()) {
          this.finishSomersault();
        } else if (this.animation.elapsedTime < zc.Z_SOMERSAULT_FRAMES * zc.Z_SOMERSAULT_FRAME_SPEED / 2) {
          // don't fall for first half of roll
          this.deltaY = 0;
        }
      } else if (this.slashing) {
        //this.deltaX = 0;
        if (this.isAnimationDone()) {
          this.finishSlash();
        } else { // still in slash
          if (!this.falling) {
            this.deltaX = 0;
          }
          var animation = this.slashingDirection === 1 ? this.slashingAnimation : this.slashingLeftAnimation;
          if (animation.elapsedTime >= zc.Z_SLASH_FRAME_SPEED * zc.Z_SLASH_START_FRAME &&
            animation.elapsedTime < zc.Z_SLASH_FRAME_SPEED * (zc.Z_SLASH_END_FRAME + 1)) {
            if (this.slashingDirection === 1) {
              this.slashZone = {
                active: true,
                outerCircle: new BoundingCircle(this.x + zc.Z_SLASH_CENTER_X * this.scale, this.y - zc.Z_SLASH_CENTER_Y * this.scale, zc.Z_SLASH_RADIUS * this.scale),
                innerCircle: new BoundingCircle(this.x + zc.Z_SLASH_INNER_CENTER_X * this.scale, this.y - zc.Z_SLASH_INNER_CENTER_Y * this.scale, zc.Z_SLASH_INNER_RADIUS * this.scale)
              };
            } else {
              this.slashZone = {
                active: true,
                outerCircle: new BoundingCircle(this.x - zc.Z_SLASH_CENTER_X * this.scale, this.y - zc.Z_SLASH_CENTER_Y * this.scale, zc.Z_SLASH_RADIUS * this.scale),
                innerCircle: new BoundingCircle(this.x - zc.Z_SLASH_INNER_CENTER_X * this.scale, this.y - zc.Z_SLASH_INNER_CENTER_Y * this.scale, zc.Z_SLASH_INNER_RADIUS * this.scale)
              };
            }
          } else {
            this.slashZone.active = false;
          }
        }
      } else if (this.crouching) {
        if (!this.game.keys[kc.CROUCH]) {
          this.stopCrouch();
        }
      }
      if (this.tile) {
        this.deltaX += this.tile.deltaX;
        if (this.tile.falling) {
          // console.log("on falling tile");
          this.setXY(this.x, this.tile.boundingBox.top + zConst.Z_FEET_ABOVE_FRAME * zConst.Z_SCALE);
        }
      }
      this.x += this.game.clockTick * this.deltaX;
      this.y += this.game.clockTick * this.deltaY;

      this.boundingbox.translateCoordinates(this.game.clockTick * this.deltaX, this.game.clockTick * this.deltaY);

      this.lightsaber.update();
      if (this.currentHealth <= 0) {
        this.die();
      }
    } else { // dead
      if (this.falling) {
        this.lastBottom = this.boundingbox.bottom;
        this.deltaY += zc.GRAVITATIONAL_ACCELERATION * this.game.clockTick;
      }
      if (this.tile) {
        this.deltaX = this.tile.deltaX;
        if (this.tile.falling) { // console.log("on falling tile");
          this.setXY(this.x, this.tile.boundingBox.top + zConst.Z_FEET_ABOVE_FRAME * zConst.Z_SCALE);
        }
      }
      this.x += this.game.clockTick * this.deltaX;
      this.y += this.game.clockTick * this.deltaY;
      this.boundingbox.translateCoordinates(this.game.clockTick * this.deltaX, this.game.clockTick * this.deltaY);
    }
    super.update();
  }


  draw() {
    this.ctx.save();
    //draw invincibility
    if (this.invincible) {

      // var ctx = this.game.ctx;
      // ctx.save(); //move to bottom of draw method after uncommenting
      // ctx.globalAlpha = 0.25;
      // ctx.lineWidth = 2;
      // ctx.fillStyle = this.iColor;
      // ctx.beginPath();
      // ctx.ellipse(
      // 	this.boundingbox.x - this.game.camera.x + this.boundingbox.width / 2,
      // 	this.boundingbox.y + this.boundingbox.height / 2,
      // 	this.animation.frameWidth * 0.25 + this.boundingbox.width * 0.25,
      // 	(this.animation.frameHeight + this.boundingbox.height) * 0.25,
      // 	0, 0, Math.PI * 2);
      // ctx.fill();
      // ctx.restore();
      this.game.ctx.globalAlpha = 0.65;
    }

    if (!this.alive) {
      this.drawX = this.x - zc.Z_ARM_SOCKET_X * this.scale;
      this.animation = this.deathAnimation;
    } else if (this.somersaulting) {
      this.drawX = this.x - this.scale * (zc.Z_SOMERSAULT_WIDTH / 2);
      if (this.somersaultingDirection === -1) {
        this.animation = this.somersaultingLeftAnimation;
      } else if (this.somersaultingDirection === 1) {
        this.animation = this.somersaultingAnimation;
      }
    } else if (this.slashing) {
      if (this.slashingDirection === 1) {
        this.drawX = this.x - zc.Z_ARM_SOCKET_X_SLASH_FRAME * this.scale;
        this.animation = this.slashingAnimation;
      } else if (this.slashingDirection === -1) {
        this.drawX = this.x - (zc.Z_SLASH_WIDTH - zc.Z_ARM_SOCKET_X_SLASH_FRAME) * this.scale;
        this.animation = this.slashingLeftAnimation;
      }
    } else if (this.falling) {
      if (this.forceJumping && this.deltaY < 0) {
        // force jump ascent — use the jump sprite (arm built in, saber hidden)
        var jumpScale = this.scale * zc.Z_JUMP_SCALE_FACTOR;
        this.animation = this.forceJumpAscentAnimation;
        this.drawX = this.facingRight
          ? this.x - zc.Z_JUMP_ARM_SOCKET_X * jumpScale
          : this.x - (zc.Z_JUMP_IMAGE_WIDTH - zc.Z_JUMP_ARM_SOCKET_X) * jumpScale;
      } else if (this.facingRight) {
        this.animation = this.deltaY < 0 ? this.fallingUpAnimation : this.fallingDownAnimation;
        this.drawX = this.x - zc.Z_ARM_SOCKET_X * this.scale;
      } else { // facing left
        this.animation = this.deltaY < 0 ? this.fallingUpLeftAnimation : this.fallingDownLeftAnimation;
        this.drawX = this.x - (zc.Z_WIDTH - zc.Z_ARM_SOCKET_X) * this.scale;
      }
    } else if (this.crouching) {
      if (this.facingRight) {
        this.animation = this.crouchAnimation;
        this.drawX = this.x - zc.Z_ARM_SOCKET_X * this.scale;
      } else { // facing left
        this.animation = this.crouchLeftAnimation;
        this.drawX = this.x - (zc.Z_WIDTH - zc.Z_ARM_SOCKET_X) * this.scale;
      }
    } else if (this.facingRight) {
      this.drawX = this.x - zc.Z_ARM_SOCKET_X * this.scale;
      if (this.direction === -1) {
        this.animation = this.moveLeftFaceRightAnimation;
      } else if (this.direction === 0) {
        this.animation = this.standFaceRightAnimation;
      } else if (this.direction === 1) {
        this.animation = this.moveRightFaceRightAnimation;
      }
    } else { // facing left
      this.drawX = this.x - (zc.Z_WIDTH - zc.Z_ARM_SOCKET_X) * this.scale;
      if (this.direction === -1) {
        this.animation = this.moveLeftFaceLeftAnimation;
      } else if (this.direction === 0) {
        this.animation = this.standFaceLeftAnimation;
      } else if (this.direction === 1) {
        this.animation = this.moveRightFaceLeftAnimation;
      }
    }

    var activeScale = (this.forceJumping && this.deltaY < 0 && !this.slashing) ? this.scale * zc.Z_JUMP_SCALE_FACTOR : this.scale;
    this.animation.scale = activeScale;
    if (this.slashing) {
      var orig = this.animation.spriteSheet;
      this.animation.spriteSheet = this.game.getRecoloredSprite(orig);
      this.animation.drawFrame(this.game.clockTick, this.ctx, this.drawX - this.camera.x, this.y - this.animation.frameHeight * activeScale);
      this.animation.spriteSheet = orig;
    } else if (this.forceJumping && this.deltaY < 0 && !this.facingRight) {
      // mirror jump.png horizontally for left-facing (no left sprite exists)
      var dX = this.drawX - this.camera.x;
      var dY = this.y - this.animation.frameHeight * activeScale;
      var dW = this.animation.frameWidth * activeScale;
      this.ctx.save();
      this.ctx.translate(dX + dW, dY);
      this.ctx.scale(-1, 1);
      this.animation.drawFrame(this.game.clockTick, this.ctx, 0, 0);
      this.ctx.restore();
    } else {
      this.animation.drawFrame(this.game.clockTick, this.ctx, this.drawX - this.camera.x, this.y - this.animation.frameHeight * activeScale);
    }
    this.lightsaber.draw();

    if (zc.DRAW_COLLISION_BOUNDRIES) {
      this.ctx.strokeStyle = "black";
      // if (!this.boundingbox.hidden) {
      this.ctx.strokeRect(this.boundingbox.x - this.camera.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
      // }
      if (this.slashing && this.slashZone.active) {
        this.ctx.beginPath();
        this.ctx.arc(this.slashZone.outerCircle.x - this.camera.x, this.slashZone.outerCircle.y, this.slashZone.outerCircle.radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.arc(this.slashZone.innerCircle.x - this.camera.x, this.slashZone.innerCircle.y, this.slashZone.innerCircle.radius, 0, Math.PI * 2);
        this.ctx.stroke();
      }
    }
    this.ctx.restore();


  }

  enableInvincibility() {
    this.iSeconds = Constants.PowerUpConstants.INVINCIBILITY_TIME;
    this.invincible = true;
  }

  shrink() {
    this.startShrinkScale = this.scale;
    this.tiny = true;
    this.tinyTimer = 0;
  }

  adjustTinyScale() {
    this.updateBoundingBox();
    this.tinyTimer += this.game.clockTick;
    if (this.tinyTimer <= puc.SHRINKING_TIME) {
      this.scale -= (this.startShrinkScale - puc.TINY_SCALE) / puc.SHRINKING_TIME * this.game.clockTick;
    } else if (this.tinyTimer > puc.SHRINKING_TIME && this.tinyTimer <= puc.TINY_MODE_TIME - puc.SHRINKING_TIME) {
      this.scale = puc.TINY_SCALE;
    } else if (this.tinyTimer > puc.TINY_MODE_TIME - puc.SHRINKING_TIME && this.tinyTimer <= puc.TINY_MODE_TIME) {
      this.scale += (zc.Z_SCALE - puc.TINY_SCALE) / puc.SHRINKING_TIME * this.game.clockTick;
    } else if (this.tinyTimer > puc.TINY_MODE_TIME) {
      this.tiny = false;
      this.scale = zc.Z_SCALE;
    }
  }

  die() {
    this.alive = false;
    this.timeOfDeath = this.game.sceneManager.levelSceneTimer;
    this.lightsaber.hidden = true;
    if (this.lightsaber.throwing) {
      this.lightsaber.catch();
    }
    this.boundingbox = new BoundingBox(this.x + 90 * this.scale, this.y - 120 * this.scale, 50 * this.scale, 108 * this.scale);
    this.boundingbox.hidden = true;
  }

  setXY(x, y) {
    this.x = x;
    this.y = y;
    // update boundingBox
    if (this.alive) {
      if (this.facingRight) {
        this.faceRight();
      } else {
        this.faceLeft();
      }
    }
  }



  isTileBelow(tile) {
    return (this.boundingbox.left < tile.boundingBox.right) &&
      (this.boundingbox.right > tile.boundingBox.left) &&
      (this.boundingbox.bottom + 20 > tile.boundingBox.top) &&
      (this.boundingbox.bottom - 20 < tile.boundingBox.top);
  }

  isInManeuver() {
    return this.somersaulting || this.slashing;
  }

  /*
   * check if animation is done (can't call animation.isDone() because it does not have latest clockTick yet in update())
   */
  isAnimationDone() {
    return (this.animation.elapsedTime + this.game.clockTick) >= this.animation.totalTime;
  }

  startSomersault() {
    this.currentForce -= zc.Z_SOMERSAULT_FORCE_COST;
    this.game.audio.playSoundFx(this.game.audio.lightsaber, 'lightsaberOff', 0.04);
    this.game.audio.saberHum.stop();
    this.somersaulting = true;
    this.deltaX = zc.Z_SOMERSAULT_SPEED * this.direction;
    this.somersaultingDirection = this.direction;
    this.lightsaber.hidden = true;

    // TODO: new bounding box for somersault, left and right
    this.boundingbox.hidden = true;
  }

  finishSomersault() {
    this.game.audio.playSoundFx(this.game.audio.lightsaber, 'lightsaberOn', 0.04);
    this.game.audio.playSoundFx(this.game.audio.saberHum);
    this.animation.elapsedTime = 0;
    this.deltaX = 0;
    this.somersaulting = false;
    this.lightsaber.hidden = false;
    this.boundingbox.hidden = false;
  }

  crouch() {
    this.crouching = true;
    this.deltaX = 0;
    this.armSocketY = zc.Z_CROUCH_ARM_SOCKET_Y;
    if (this.facingRight) {
      this.faceRight();
    } else {
      this.faceLeft();
    }
  }

  stopCrouch() {
    this.crouching = false;
    this.armSocketY = zc.Z_ARM_SOCKET_Y;
    if (this.facingRight) {
      this.faceRight();
    } else {
      this.faceLeft();
    }
  }

  startSlash() {
    this.game.audio.playSoundFx(this.game.audio.lightsaber, 'lightsaberSwing');
    this.slashing = true;
    this.deltaX = 0;
    this.lightsaber.hidden = true;
    this.slashingDirection = this.facingRight ? 1 : -1;
    this.slashZone = {};
    // TODO: new bounding box for slash, left and right
    this.boundingbox = new BoundingBox(this.boundingbox.x, this.y - (zc.Z_HEIGHT - 73) * this.scale, this.boundingbox.width, this.boundingbox.height);
  }

  finishSlash() {
    this.animation.elapsedTime = 0;
    this.slashing = false;
    this.lightsaber.hidden = false;
  }


  faceRight() {
    this.facingRight = true;
    if (this.crouching) {
      this.boundingbox = new BoundingBox(this.x - (15 * this.scale), this.y - (zc.Z_HEIGHT - 120) * this.scale, (zc.Z_WIDTH - 39) * this.scale, (zc.Z_HEIGHT - 132) * this.scale);
    } else {
      this.boundingbox = new BoundingBox(this.x - (15 * this.scale), this.y - (zc.Z_HEIGHT - 73) * this.scale, (zc.Z_WIDTH - 39) * this.scale, (zc.Z_HEIGHT - 85) * this.scale);
    }
  }

  faceLeft() {
    this.facingRight = false;
    if (this.crouching) {
      this.boundingbox = new BoundingBox(this.x - (zc.Z_WIDTH - 55) * this.scale, this.y - (zc.Z_HEIGHT - 120) * this.scale, (zc.Z_WIDTH - 39) * this.scale, (zc.Z_HEIGHT - 132) * this.scale);
    } else {
      this.boundingbox = new BoundingBox(this.x - (zc.Z_WIDTH - 55) * this.scale, this.y - (zc.Z_HEIGHT - 73) * this.scale, (zc.Z_WIDTH - 39) * this.scale, (zc.Z_HEIGHT - 85) * this.scale);
    }
  }

  updateBoundingBox() {
    if (this.facingRight) {
      if (this.crouching) {
        this.boundingbox = new BoundingBox(this.x - (15 * this.scale), this.y - (zc.Z_HEIGHT - 120) * this.scale, (zc.Z_WIDTH - 39) * this.scale, (zc.Z_HEIGHT - 132) * this.scale);
      } else {
        this.boundingbox = new BoundingBox(this.x - (15 * this.scale), this.y - (zc.Z_HEIGHT - 73) * this.scale, (zc.Z_WIDTH - 39) * this.scale, (zc.Z_HEIGHT - 85) * this.scale);
      }
    } else {
      if (this.crouching) {
        this.boundingbox = new BoundingBox(this.x - (zc.Z_WIDTH - 55) * this.scale, this.y - (zc.Z_HEIGHT - 120) * this.scale, (zc.Z_WIDTH - 39) * this.scale, (zc.Z_HEIGHT - 132) * this.scale);
      } else {
        this.boundingbox = new BoundingBox(this.x - (zc.Z_WIDTH - 55) * this.scale, this.y - (zc.Z_HEIGHT - 73) * this.scale, (zc.Z_WIDTH - 39) * this.scale, (zc.Z_HEIGHT - 85) * this.scale);
      }
    }
  }


  createAnimations() {
    this.standFaceRightAnimation = new Animation(this.assetManager.getAsset("img/Zerlin standing.png"),
      0, 0,
      zc.Z_WIDTH,
      zc.Z_HEIGHT,
      zc.Z_STANDING_FRAME_SPEED,
      zc.Z_STANDING_FRAMES,
      true, false,
      zc.Z_SCALE);
    this.standFaceLeftAnimation = new Animation(this.assetManager.getAsset("img/Zerlin standing left.png"),
      0, 0,
      zc.Z_WIDTH,
      zc.Z_HEIGHT,
      zc.Z_STANDING_FRAME_SPEED,
      zc.Z_STANDING_FRAMES,
      true, false,
      zc.Z_SCALE);
    this.moveRightFaceRightAnimation = new Animation(this.assetManager.getAsset("img/Zerlin bobbing walking.png"),
      0, 0,
      zc.Z_WIDTH,
      zc.Z_HEIGHT,
      zc.Z_WALKING_FRAME_SPEED,
      zc.Z_WALKING_FRAMES,
      true, false,
      zc.Z_SCALE);
    this.moveRightFaceLeftAnimation = new Animation(this.assetManager.getAsset("img/Zerlin left backwards bobbing walking.png"),
      0, 0,
      zc.Z_WIDTH,
      zc.Z_HEIGHT,
      zc.Z_WALKING_FRAME_SPEED,
      zc.Z_WALKING_FRAMES,
      true, false,
      zc.Z_SCALE);
    this.moveLeftFaceRightAnimation = new Animation(this.assetManager.getAsset("img/Zerlin backwards bobbing walking.png"),
      0, 0,
      zc.Z_WIDTH,
      zc.Z_HEIGHT,
      zc.Z_WALKING_FRAME_SPEED,
      zc.Z_WALKING_FRAMES,
      true, false,
      zc.Z_SCALE);
    this.moveLeftFaceLeftAnimation = new Animation(this.assetManager.getAsset("img/Zerlin left bobbing walking.png"),
      0, 0,
      zc.Z_WIDTH,
      zc.Z_HEIGHT,
      zc.Z_WALKING_FRAME_SPEED,
      zc.Z_WALKING_FRAMES,
      true, false,
      zc.Z_SCALE);
    this.forceJumpAscentAnimation = new Animation(this.assetManager.getAsset("img/jump.png"),
      0, 0,
      zc.Z_JUMP_IMAGE_WIDTH,
      zc.Z_JUMP_IMAGE_HEIGHT,
      1, 1,
      true, false,
      zc.Z_SCALE);
    this.fallingUpAnimation = new Animation(this.assetManager.getAsset("img/Zerlin falling up.png"),
      0, 0,
      zc.Z_WIDTH,
      zc.Z_HEIGHT,
      zc.Z_FALLING_FRAME_SPEED,
      zc.Z_FALLING_UP_FRAMES,
      true, false,
      zc.Z_SCALE);
    this.fallingDownAnimation = new Animation(this.assetManager.getAsset("img/Zerlin falling down.png"),
      0, 0,
      zc.Z_WIDTH,
      zc.Z_HEIGHT,
      zc.Z_FALLING_FRAME_SPEED,
      zc.Z_FALLING_DOWN_FRAMES,
      true, false,
      zc.Z_SCALE);
    this.fallingUpLeftAnimation = new Animation(this.assetManager.getAsset("img/Zerlin falling up left.png"),
      0, 0,
      zc.Z_WIDTH,
      zc.Z_HEIGHT,
      zc.Z_FALLING_FRAME_SPEED,
      zc.Z_FALLING_UP_FRAMES,
      true, false,
      zc.Z_SCALE);
    this.fallingDownLeftAnimation = new Animation(this.assetManager.getAsset("img/Zerlin falling down left.png"),
      0, 0,
      zc.Z_WIDTH,
      zc.Z_HEIGHT,
      zc.Z_FALLING_FRAME_SPEED,
      zc.Z_FALLING_DOWN_FRAMES,
      true, false,
      zc.Z_SCALE);
    this.somersaultingAnimation = new Animation(this.assetManager.getAsset("img/Zerlin somersault.png"),
      0, 0,
      zc.Z_SOMERSAULT_WIDTH,
      zc.Z_SOMERSAULT_HEIGHT,
      zc.Z_SOMERSAULT_FRAME_SPEED,
      zc.Z_SOMERSAULT_FRAMES,
      false, false,
      zc.Z_SCALE);
    this.somersaultingLeftAnimation = new Animation(this.assetManager.getAsset("img/Zerlin left somersault.png"),
      0, 0,
      zc.Z_SOMERSAULT_WIDTH,
      zc.Z_SOMERSAULT_HEIGHT,
      zc.Z_SOMERSAULT_FRAME_SPEED,
      zc.Z_SOMERSAULT_FRAMES,
      false, false,
      zc.Z_SCALE);
    this.slashingAnimation = new Animation(this.assetManager.getAsset("img/Zerlin slash.png"),
      0, 0,
      zc.Z_SLASH_WIDTH,
      zc.Z_SLASH_HEIGHT,
      zc.Z_SLASH_FRAME_SPEED,
      zc.Z_SLASH_FRAMES,
      false, false,
      zc.Z_SCALE);
    this.slashingLeftAnimation = new Animation(this.assetManager.getAsset("img/Zerlin slash left.png"),
      0, 0,
      zc.Z_SLASH_WIDTH,
      zc.Z_SLASH_HEIGHT,
      zc.Z_SLASH_FRAME_SPEED,
      zc.Z_SLASH_FRAMES,
      false, false,
      zc.Z_SCALE);
    this.crouchAnimation = new Animation(this.assetManager.getAsset("img/Zerlin crouch.png"),
      0, 0,
      zc.Z_WIDTH,
      zc.Z_HEIGHT,
      1,
      1,
      true, false,
      zc.Z_SCALE);
    this.crouchLeftAnimation = new Animation(this.assetManager.getAsset("img/Zerlin crouch left.png"),
      0, 0,
      zc.Z_WIDTH,
      zc.Z_HEIGHT,
      1,
      1,
      true, false,
      zc.Z_SCALE);
    // constructor(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse, scale) {
    this.deathAnimation = new Animation(this.assetManager.getAsset("img/Zerlin death.png"),
      0, 0,
      zc.Z_DEATH_WIDTH,
      zc.Z_HEIGHT,
      .14,
      zc.Z_DEATH_FRAMES,
      false, false,
      zc.Z_SCALE);
  }
}




// ── Player 2 ─────────────────────────────────────────────────────────────────
// Identical physics/abilities to Zerlin, but input comes from the network
// (game.network.lastReceivedInput) rather than local keyboard/mouse.
class Zerlin2 extends Zerlin {
  constructor(game, camera, sceneManager) {
    super(game, camera, sceneManager);
    // reset() is called inside super(); our override below re-positions to P2 spawn
  }

  reset() {
    super.reset();
    // Spawn 250px to the right of P1's spawn
    this.x = this.game.surfaceWidth * camConst.ZERLIN_POSITION_ON_SCREEN + zc.Z_SPAWN_X + 250;
    this.faceRight();
  }

  update() {
    // Temporarily redirect all input reads to the last received network state.
    // This covers both Zerlin.update() and Lightsaber.update() since they both
    // read game.keys / game.mouse / game.click directly.
    var savedKeys  = this.game.keys;
    var savedMouse = this.game.mouse;
    var savedClick = this.game.click;

    var inp = this.game.network.lastReceivedInput;
    this.game.keys  = inp.keys  || {};
    this.game.mouse = { x: inp.mouseX != null ? inp.mouseX : savedMouse.x,
                        y: inp.mouseY != null ? inp.mouseY : savedMouse.y };
    this.game.click = inp.click || false;

    super.update();

    this.game.keys  = savedKeys;
    this.game.mouse = savedMouse;
    this.game.click = savedClick;
  }
}

class Lightsaber extends Entity {

  constructor(game, Zerlin) {
    super(game,
      0, 0, // will be set in faceRightUpSaber()
      0, 0);
    this.assetManager = game.assetManager;
    this.ctx = game.ctx;
    this.angle = 0;
    this.Zerlin = Zerlin;
    this.camera = Zerlin.camera;
    this.hidden = false;
    this.inClickPosition = false;
    this.deflectingBeam = false;
    this.deflectingBeamSoundOn = false;
    this.splitLasers = false;
    this.splitShotTimer = puc.SPLIT_SHOT_TIME;
    this.throwArmLength = (zc.THROW_ARM_IMAGE_FINGER_X - zc.LS_THROW_RIGHT_X_AXIS) * zc.Z_SCALE;
    this.homingLasers = false;
    this.lightning = [];
    this.orb = null;
    this.bounceOffset = 0;
    this.setUpSaberImages();
    this.faceRightUpSaber();
    this.updateCollisionLine();
  }

  update() {
    this.x = this.Zerlin.x;
    this.y = this.Zerlin.y - (zc.Z_HEIGHT - this.Zerlin.armSocketY) * this.Zerlin.scale;

    this.throwArmLength = (zc.THROW_ARM_IMAGE_FINGER_X - zc.LS_THROW_RIGHT_X_AXIS) * this.Zerlin.scale;

    if (this.splitLasers) {
      this.splitShotTimer -= this.game.clockTick;
      if (this.splitShotTimer <= 0) {
        this.splitLasers = false;
        this.splitShotTimer = puc.SPLIT_SHOT_TIME;
      }
    }

    if (this.homingLasers) {
      this.homingLaserTimer -= this.game.clockTick;
      if (this.homingLaserTimer <= 0) {
        this.homingLasers = false;
      }
    }


    // rotate
    if (this.game.mouse) {
      this.angle = Math.atan2(this.game.mouse.y - this.y, this.game.mouse.x + this.camera.x - this.x);
      // decay saber bounce offset back to zero
      if (this.bounceOffset !== 0) {
        var decay = Constants.ZerlinConstants.SABER_BOUNCE_DECAY_RATE * this.game.clockTick;
        if (Math.abs(this.bounceOffset) <= decay) {
          this.bounceOffset = 0;
        } else {
          this.bounceOffset -= Math.sign(this.bounceOffset) * decay;
        }
      }
        //  handle attacks
        if (this.game.keys['leftClick'] && this.game.keys['ShiftLeft']) {
          if (this.orb === null) {
            this.orb = new LightningOrb(this);
          }
          this.holdingShiftClick = true;
          this.holdingClick = false;
          this.shocking = true;
          this.setSaberThrow();
          } else {
            if (!this.game.keys['ShiftLeft'] && !this.throwing) { // keep throwing arm if holding shift after lightning
              this.setSaberRegular();
              this.orb = null;
              
          // change sprite on any of these conditions
          if (!this.throwing && this.game.click && !this.Zerlin.isInManeuver()) {
            if (this.Zerlin.currentForce >= zc.Z_SABER_THROW_FORCE_COST) {
              this.throw();
            }
          }


        }

        if (this.holdingShiftClick && !this.game.keys['leftClick']) { // just released click from shift click
          if (!this.Zerlin.isInManeuver()) {
            this.shock();
          }
          this.orb = null;
        }
        else if (this.game.keys['leftClick']) {
          this.holdingClick = true;
        } else {
          if (this.holdingClick && !this.throwing && !this.Zerlin.isInManeuver()) { // just released left click
            if (this.Zerlin.currentForce >= zc.Z_SABER_THROW_FORCE_COST) {
              this.throw();
            }
          }
          this.holdingClick = false;
        }
        this.holdingShiftClick = false;

      }


      if (this.holdingShiftClick) {
        if (this.game.mouse.x + this.camera.x < this.Zerlin.x && this.facingRight) {
          this.faceLeftThrowing();
        } else if (this.game.mouse.x + this.camera.x > this.Zerlin.x && !this.facingRight) {
          this.faceRightThrowing();
        }
      } else {
        if (this.game.mouse.x + this.camera.x < this.Zerlin.x && this.facingRight) {
          this.saberUp = !this.saberUp;
          if (this.throwing) {
            this.faceLeftThrowing();
          }
          else if (this.inClickPosition) {
            this.faceLeftUpSaber();
          } else {
            this.faceLeftDownSaber();
          }
        } else if (this.game.mouse.x + this.camera.x > this.Zerlin.x && !this.facingRight) {
          this.saberUp = !this.saberUp;
          if (this.throwing) {
            this.faceRightThrowing();
          }
          else if (this.inClickPosition) {
            this.faceRightDownSaber();
          } else {
            this.faceRightUpSaber();
          }
        } else if (!this.throwing && this.game.rightClickDown && !this.inClickPosition) {
          this.inClickPosition = true;
          if (this.game.mouse.x + this.camera.x < this.Zerlin.x) {
            this.faceLeftUpSaber();
          } else {
            this.faceRightDownSaber();
          }
        } else if (!this.throwing && !this.game.rightClickDown && this.inClickPosition) {
          this.inClickPosition = false;
          if (this.game.mouse.x + this.camera.x < this.Zerlin.x) {
            this.faceLeftDownSaber();
          } else {
            this.faceRightUpSaber();
          }
        }
      }
    }


    if (this.deflectingBeam && !this.deflectingBeamSoundOn) {
      //this.game.audio.playSoundFx(this.game.audio.deflectBeam);
      this.game.audio.playSound(this.game.audio.deflectBeam);
      this.deflectingBeamSoundOn = true;
    } else if (!this.deflectingBeam && this.deflectingBeamSoundOn) {
      this.game.audio.deflectBeam.stop();
      this.deflectingBeamSoundOn = false;
    }

    this.updateCollisionLine();

    super.update();
    if (this.airbornSaber) {
      this.airbornSaber.update();
    }

    if (this.orb) {
      this.orb.update();
    }
    for (let i = this.lightning.length - 1; i >= 0; i--) {
      this.lightning[i].update();
      if (this.lightning[i].removeFromWorld) {
        this.lightning.splice(i, 1);
      }
    }
    // if (this.glow) {
    //   this.glow.radius -= this.game.clockTick * 10;
    //   if (this.glow.radius <= 0) {
    //     this.glow = null;
    //   }
    // }
  }

  draw() {

    for (let i = 0; i < this.lightning.length; i++) {
      this.lightning[i].draw();
    }
    // if (this.glow) {
    //   this.game.ctx.beginPath();
    //   this.game.ctx.fillStyle = "#00ae69";
    //   this.game.ctx.arc(this.glow.x - this.camera.x,
    //     this.glow.y, this.glow.radius * 1.3, 0, Math.PI * 2, false);
    //   this.game.ctx.fill();
    //   this.game.ctx.closePath();
    // }
    if (this.orb) {
      this.orb.draw();
    }
    if (!this.hidden) {
      this.ctx.save();
      this.ctx.translate(this.x - this.camera.x, this.y);
      this.ctx.rotate(this.angle + this.bounceOffset);
      this.ctx.drawImage(this.game.getRecoloredSprite(this.image),
        0,
        0,
        this.width,
        this.height,
        -(this.armSocketX * this.Zerlin.scale),
        -(this.armSocketY * this.Zerlin.scale),
        this.Zerlin.scale * this.width,
        this.Zerlin.scale * this.height);
      this.ctx.restore();
    }
    if (zc.DRAW_COLLISION_BOUNDRIES) {
      this.ctx.save();
      this.ctx.strokeStyle = "black";
      this.ctx.beginPath();
      this.ctx.moveTo(this.bladeCollar.x - this.camera.x, this.bladeCollar.y);
      this.ctx.lineTo(this.bladeTip.x - this.camera.x, this.bladeTip.y);
      this.ctx.stroke();
      this.ctx.closePath();
      this.ctx.restore();
    }
    super.draw();
    if (this.airbornSaber) {
      this.airbornSaber.draw();
    }
    // if (this.glow) {
    //     // this.game.ctx.beginPath();
    //     // this.game.ctx.fillStyle = "#00ae69";
    //     // this.game.ctx.arc(this.glow.x - this.camera.x,
    //     //   this.glow.y, this.glow.radius * 1.3, 0, Math.PI * 2, false);
    //     // this.game.ctx.fill();
    //     // this.game.ctx.closePath();
    //     this.game.ctx.beginPath();
    //     this.game.ctx.fillStyle = "white";
    //     this.game.ctx.arc(this.glow.x + this.x - this.camera.x,
    //       this.glow.y + this.y, this.glow.radius, 0, Math.PI * 2, false);
    //     this.game.ctx.fill();
    //     this.game.ctx.closePath();
    //     this.game.ctx.restore();
    // }
  }

  spark(point) {
    this.sceneManager.otherEntities.push(new Spark(this.game, this.sceneManager, point));
    this.sceneManager.otherEntities.push(new Spark(this.game, this.sceneManager, point));
    this.sceneManager.otherEntities.push(new Spark(this.game, this.sceneManager, point));
    // this.glow = new BoundingCircle(point.x - this.x, point.y - this.y, zc.SABER_GLOW_RADIUS);
    // this.glow.angle = Math.atan2(this.glow.y, this.glow.y) - this.angle;
  }

  setSaberRegular() {
    if (this.facingRight) {
      if (this.inClickPosition) {
        this.faceRightDownSaber();
      } else {
        this.faceRightUpSaber();
      }
    } else {
      if (this.inClickPosition) {
        this.faceLeftUpSaber();
      } else {
        this.faceLeftDownSaber();
      }
    }
  }

  setSaberThrow() {
    if (this.facingRight) {
      this.faceRightThrowing();
    } else {
      this.faceLeftThrowing();
    }
  }

  enableSplitLasers() {
    this.splitShotTimer = puc.SPLIT_SHOT_TIME;
    this.splitLasers = true;
  }

  saberSlope() {
    return (this.bladeCollar.y - this.bladeTip.y) / (this.bladeCollar.x - this.bladeTip.x);
  }

  enableHomingLasers() {
    this.homingLasers = true;
    this.homingLaserTimer = puc.HOMING_LASER_TIME;
  }

  getSaberAngle() {
    // return this.angle + Math.PI / 2;
    return Math.atan2(this.bladeCollar.y - this.bladeTip.y, this.bladeCollar.x - this.bladeTip.x);
  }

  updateCollisionLine() {
    var cosine = Math.cos(this.angle);
    var sine = Math.sin(this.angle);

    var collarXrotated = this.collarXfromSocket * cosine - this.collarYfromSocket * sine;
    var collarYrotated = this.collarYfromSocket * cosine + this.collarXfromSocket * sine;

    var tipXrotated = this.tipXfromSocket * cosine - this.tipYfromSocket * sine;
    var tipYrotated = this.tipYfromSocket * cosine + this.tipXfromSocket * sine;

    this.prevBladeCollar = this.bladeCollar;
    this.prevBladeTip = this.bladeTip;
    this.bladeCollar = {
      x: collarXrotated * this.Zerlin.scale + this.x,
      y: collarYrotated * this.Zerlin.scale + this.y
    };
    this.bladeTip = {
      x: tipXrotated * this.Zerlin.scale + this.x,
      y: tipYrotated * this.Zerlin.scale + this.y
    };
  }

  throw() {
    this.Zerlin.currentForce -= zc.Z_SABER_THROW_FORCE_COST;
    this.throwing = true;
    this.airbornSaber = new AirbornSaber(this.game, this, Math.cos(this.angle) * zc.SABER_THROW_INITIAL_SPEED, Math.sin(this.angle) * zc.SABER_THROW_INITIAL_SPEED);
    this.setSaberThrow();
  }

  catch() {
    this.throwing = false;
    this.airbornSaber = null;
    this.setSaberRegular();
  }

  shock() {
    while (this.orb && this.orb.powerTimer > 0 && this.Zerlin.currentForce >= zc.Z_LIGHTNING_FORCE_COST) {
      this.Zerlin.currentForce -= zc.Z_LIGHTNING_FORCE_COST;
      this.orb.powerTimer -= 1;
      this.lightning.push(new LightningBolt(this.game, this.x + Math.cos(this.angle) * this.throwArmLength, this.y + Math.sin(this.angle) * this.throwArmLength, this.game.mouse, 1));
    }
    this.orb = null;
  }

  faceRightUpSaber() {
    this.image = this.faceRightUpSaberImage;
    this.width = zc.LS_UP_IMAGE_WIDTH;
    this.height = zc.LS_UP_IMAGE_HEIGHT;
    this.armSocketX = zc.LS_RIGHT_X_AXIS;
    this.armSocketY = zc.LS_UP_Y_AXIS;

    this.collarXfromSocket = zc.LS_UP_COLLAR_X - zc.LS_RIGHT_X_AXIS;
    this.collarYfromSocket = zc.LS_UP_COLLAR_Y - zc.LS_UP_Y_AXIS;
    this.tipXfromSocket = zc.LS_UP_TIP_X - zc.LS_RIGHT_X_AXIS;
    this.tipYfromSocket = zc.LS_UP_TIP_Y - zc.LS_UP_Y_AXIS;

    this.shocking = false;
    this.facingRight = true;
    this.saberUp = true;
  }

  faceLeftUpSaber() {
    this.image = this.faceLeftUpSaberImage;
    this.width = zc.LS_UP_IMAGE_WIDTH;
    this.height = zc.LS_UP_IMAGE_HEIGHT;
    this.armSocketX = zc.LS_LEFT_X_AXIS;
    this.armSocketY = this.height - zc.LS_UP_Y_AXIS;

    this.collarXfromSocket = zc.LS_UP_COLLAR_X - zc.LS_LEFT_X_AXIS;
    this.collarYfromSocket = zc.LS_UP_Y_AXIS - zc.LS_UP_COLLAR_Y;
    this.tipXfromSocket = zc.LS_UP_TIP_X - zc.LS_RIGHT_X_AXIS;
    this.tipYfromSocket = zc.LS_UP_Y_AXIS - zc.LS_UP_TIP_Y;

    this.shocking = false;
    this.facingRight = false;
    this.saberUp = true;
  }

  faceRightDownSaber() {
    this.image = this.faceRightDownSaberImage;
    this.width = zc.LS_DOWN_IMAGE_WIDTH;
    this.height = zc.LS_DOWN_IMAGE_HEIGHT;
    this.armSocketX = zc.LS_RIGHT_X_AXIS;
    this.armSocketY = zc.LS_DOWN_Y_AXIS;

    this.collarXfromSocket = zc.LS_DOWN_COLLAR_X - zc.LS_RIGHT_X_AXIS;
    this.collarYfromSocket = zc.LS_DOWN_COLLAR_Y - zc.LS_DOWN_Y_AXIS;
    this.tipXfromSocket = zc.LS_DOWN_TIP_X - zc.LS_RIGHT_X_AXIS;
    this.tipYfromSocket = zc.LS_DOWN_TIP_Y - zc.LS_DOWN_Y_AXIS;

    this.shocking = false;
    this.facingRight = true;
    this.saberUp = false;
  }

  faceLeftDownSaber() {
    this.image = this.faceLeftDownSaberImage;
    this.width = zc.LS_DOWN_IMAGE_WIDTH;
    this.height = zc.LS_DOWN_IMAGE_HEIGHT;
    this.armSocketX = zc.LS_LEFT_X_AXIS;
    this.armSocketY = this.height - zc.LS_DOWN_Y_AXIS;

    this.collarXfromSocket = zc.LS_DOWN_COLLAR_X - zc.LS_LEFT_X_AXIS;
    this.collarYfromSocket = zc.LS_DOWN_Y_AXIS - zc.LS_DOWN_COLLAR_Y;
    this.tipXfromSocket = zc.LS_DOWN_TIP_X - zc.LS_LEFT_X_AXIS;
    this.tipYfromSocket = zc.LS_DOWN_Y_AXIS - zc.LS_DOWN_TIP_Y;

    this.shocking = false;
    this.facingRight = false;
    this.saberUp = false;
  }

  faceLeftThrowing() {
    this.image = this.faceLeftThrowImage;
    this.width = zc.LS_THROW_IMAGE_WIDTH;
    this.height = zc.LS_THROW_IMAGE_HEIGHT;
    this.armSocketX = zc.LS_THROW_RIGHT_X_AXIS;
    this.armSocketY = this.height - zc.LS_THROW_RIGHT_Y_AXIS;

    this.facingRight = false;
  }

  faceRightThrowing() {
    this.image = this.faceRightThrowImage;
    this.width = zc.LS_THROW_IMAGE_WIDTH;
    this.height = zc.LS_THROW_IMAGE_HEIGHT;
    this.armSocketX = zc.LS_THROW_RIGHT_X_AXIS;
    this.armSocketY = zc.LS_THROW_RIGHT_Y_AXIS;

    this.facingRight = true;
  }

  setUpSaberImages() {
    this.faceRightUpSaberImage = this.assetManager.getAsset("img/saber up.png");
    this.faceLeftUpSaberImage = this.assetManager.getAsset("img/saber up left.png");
    this.faceRightDownSaberImage = this.assetManager.getAsset("img/saber down.png");
    this.faceLeftDownSaberImage = this.assetManager.getAsset("img/saber down left.png");
    this.faceRightThrowImage = this.assetManager.getAsset("img/throwing arm.png");
    this.faceLeftThrowImage = this.assetManager.getAsset("img/throwing arm left.png");
  }
}




class AirbornSaber extends Entity {

  constructor(game, arm, deltaX, deltaY) {
    super(game, arm.x, arm.y, deltaX, deltaY);
    this.arm = arm;
    this.throwTimer = 0;
    this.camera = this.arm.camera;
    this.width = zc.LS_AIRBORN_WIDTH * this.arm.Zerlin.scale;
    this.height = zc.LS_AIRBORN_HEIGHT * this.arm.Zerlin.scale;
    this.radius = this.width / 2;
    this.animation = new Animation(this.game.assetManager.getAsset("img/airborn saber.png"), 0, 0,
      zc.LS_AIRBORN_WIDTH, zc.LS_AIRBORN_HEIGHT, zc.LS_AIRBORN_FRAME_DURATION, zc.LS_AIRBORN_FRAMES, true, false, this.arm.Zerlin.scale);
    this.maxDistanceFromArm = 0;
  }


  update() {
    this.throwTimer += this.game.clockTick;

    this.angleFromArm = Math.atan2(this.arm.y - this.y, this.arm.x - this.x);
    this.distanceFromArm = distance(this, this.arm);
    if (!this.reachedPinnacle) {
      this.accelerationX = zc.SABER_THROW_ACCELERATION * Math.cos(this.angleFromArm);
      this.accelerationY = zc.SABER_THROW_ACCELERATION * Math.sin(this.angleFromArm);
      this.deltaX += this.accelerationX * this.game.clockTick;
      this.deltaY += this.accelerationY * this.game.clockTick;
      this.checkIfReachedPinnacle();
    } else {
      this.deltaX = 300 * Math.cos(this.angleFromArm) * zc.SABER_THROW_ACCELERATION / this.distanceFromArm;
      this.deltaY = 300 * Math.sin(this.angleFromArm) * zc.SABER_THROW_ACCELERATION / this.distanceFromArm;
    }

    this.x += this.deltaX * this.game.clockTick;
    this.y += this.deltaY * this.game.clockTick;
  }

  draw() {
    var orig = this.animation.spriteSheet;
    this.animation.spriteSheet = this.game.getRecoloredSprite(orig);
    this.animation.scale = this.arm.Zerlin.scale;
    this.animation.drawFrame(this.game.clockTick, this.game.ctx, this.x - this.width / 2 - this.camera.x, this.y - this.height / 2);
    this.animation.spriteSheet = orig;
  }

  checkIfReachedPinnacle() {
    if (this.distanceFromArm > this.maxDistanceFromArm) {
      this.maxDistanceFromArm = this.distanceFromArm;
    } else if (this.throwTimer > .5) {
      this.reachedPinnacle = true;
    }
  }
}
