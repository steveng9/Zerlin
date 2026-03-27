/*
Zerlin
TCSS 491 - Computational Worlds
Joshua Atherton, Michael Josten, Steven Golob
*/

/*
 * This file contains all the droids that extend from the basic droid
 */

//Basic Droid Constants

var camConst = Constants.CameraConstants;
const dbc = Constants.DroidBasicConstants;




/*
 * Basic droid that will shoot 1 laser every interval
 */
class BasicDroid extends AbstractDroid {
  constructor(game, spritesheet, startX, startY, frames, frameSpeed, frameWidth, frameHeight, scale, radius) {
    super(game, startX, startY, 0, 0); //debug

    /* animation fields */
    //Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse, scale)
    this.idleAnimation = new Animation(spritesheet, 0, 0, frameWidth, frameHeight, frameSpeed, frames, true, false, scale);
    this.animation = this.idleAnimation;

    this.shootInterval = dbc.BASIC_DROID_SHOOT_INTERVAL;

    this.radius = radius * scale;
    this.boundCircle = new BoundingCircle(
      this.x + this.animation.frameWidth / 2 * scale,
      this.y + this.animation.frameHeight / 2 * scale,
      this.radius * dbc.BASIC_DROID_BOUND_CIRCLE_SCALE);


    /* shooting fields */
    this.fire = false;
    this.secondsBeforeFire = this.shootInterval;

    /* movement fields */
    var targetOrbitalX = (this.game.surfaceWidth / 2) + dbc.BASIC_DROID_ORBITAL_X_OFFSET;
    var targetOrbitalY = (this.game.surfaceHeight / 2) + dbc.BASIC_DROID_ORBITAL_Y_OFFSET;
    this.targetOrbitalPointLeft = {
      x: targetOrbitalX,
      y: targetOrbitalY
    };

    targetOrbitalX = (this.game.surfaceWidth / 2) + dbc.BASIC_DROID_ORBITAL_X_OFFSET;
    this.targetOrbitalPointRight = {
      x: targetOrbitalX,
      y: targetOrbitalY
    };
  }
  /*
   * every update, the basic droid will move around zerlin entity about 50 to 100 pixels above him.
   * The droid will shoot every interval at the main character (as of now, at the mouse)
   * The droid will set removeFromWorld to true when it collides with lightsaber
   */
  update() {
    //update coordinates so the droid will orbit the center of the canvas
    if (!this.sceneManager) {
      this.sceneManager = this.game.sceneManager;
    }
    this.calcMovement();

    /* droid shooting */
    this.secondsBeforeFire -= this.game.clockTick;
    //will shoot at every interval
    if (this.secondsBeforeFire <= 0 && (!this.fire)) {
      this.secondsBeforeFire = this.shootInterval;
      this.fire = true;
      this.shoot();
    }

    super.update();
  }
  draw() {
    super.draw();
  }

  /**
   * Method that will shoot a laser randomly in an area from target point
   * to target point + max argument
   */
  shoot() {
    var targetX = this.sceneManager.Zerlin.x;
    var targetY = this.sceneManager.Zerlin.boundingbox.y + this.sceneManager.Zerlin.boundingbox.height / 2;
    var randTargetX = targetX + (this.sceneManager.Zerlin.boundingbox.width * (Math.random() - .5));
    var randTargetY = targetY + (this.sceneManager.Zerlin.boundingbox.height * (Math.random() - .5));
    var droidLaser = new DroidLaser(this.game,
      this.boundCircle.x,
      this.boundCircle.y,
      dbc.BASIC_DROID_LASER_SPEED,
      randTargetX,
      randTargetY,
      dbc.BASIC_DROID_LASER_LENGTH,
      dbc.BASIC_DROID_LASER_WIDTH,
      "#339933",
      "#00ff00");
    this.sceneManager.addLaser(droidLaser);
    this.fire = false;
    this.game.audio.playSoundFx(this.game.audio.enemy, 'retroBlasterShot');
  }

  /*
   * calculate movement so that it will try to fly around the location of the
   * target.
   */
  calcMovement() {
    this.targetOrbitalPointLeft.x = this.sceneManager.Zerlin.x - dbc.BASIC_DROID_ORBITAL_X_OFFSET;
    //add 200 so that the droids uses up all the canvas becuase when targeting Zerlin,
    //doesn't use all of the canvas
    this.targetOrbitalPointRight.x = this.sceneManager.Zerlin.x + dbc.BASIC_DROID_ORBITAL_X_OFFSET + 200;

    //if the droid is to the left of targetRight and right of targetLeft
    if (this.x <= this.targetOrbitalPointRight.x && this.x >= this.targetOrbitalPointLeft.x) {
      //if the droid is moving right, then increase x velocity
      if (this.deltaX >= 0) {
        if (this.deltaX < dbc.BASIC_DROID_X_MOVEMENT_SPEED)
          this.deltaX += dbc.BASIC_DROID_X_ACCELERATION * this.game.clockTick;
      }
      //if the droid is moving left, then decrease x velocity
      if (this.deltaX < 0) {
        if (this.deltaX >= (-dbc.BASIC_DROID_X_MOVEMENT_SPEED))
          this.deltaX -= dbc.BASIC_DROID_X_ACCELERATION * this.game.clockTick;
      }
    }

    //if the droid is to the left of targetLeft, then increase X velocity
    if (this.x < this.targetOrbitalPointLeft.x) {
      if (this.deltaX < dbc.BASIC_DROID_X_MOVEMENT_SPEED)
        this.deltaX += dbc.BASIC_DROID_X_ACCELERATION * this.game.clockTick;
    }
    //if the droid is to the right of targetRight, then decrease X velocity
    if (this.x > this.targetOrbitalPointRight.x) {
      if (this.deltaX >= (-dbc.BASIC_DROID_X_MOVEMENT_SPEED))
        this.deltaX -= dbc.BASIC_DROID_X_ACCELERATION * this.game.clockTick;
    }


    //if droid is above the target point, then increase deltaY(down)
    if (this.y < this.targetOrbitalPointRight.y) {
      if (this.deltaY <= dbc.BASIC_DROID_Y_MOVEMENT_SPEED)
        this.deltaY += dbc.BASIC_DROID_Y_ACCELERATION * this.game.clockTick;
    }
    //if the droid is below the target point, then decrease the deltaY(up)
    else if (this.y >= this.targetOrbitalPointRight.y) {
      if (this.deltaY >= (-dbc.BASIC_DROID_Y_MOVEMENT_SPEED))
        this.deltaY -= dbc.BASIC_DROID_Y_ACCELERATION * this.game.clockTick;
    }

    //after calculating change in x and y then increment x and y by delta x and delta y
    // this.x += this.game.clockTick * (Math.random() * this.deltaX);
    // this.y += this.game.clockTick * (Math.random() * this.deltaY);
    this.x += this.game.clockTick * this.deltaX;
    this.y += this.game.clockTick * this.deltaY;

    this.boundCircle.translateCoordinates(this.game.clockTick * this.deltaX, this.game.clockTick * this.deltaY);
  }
}


/*
 * Long legged droid that will shoot a set of scattered burst lasers every interval
 */
class ScatterShotDroid extends BasicDroid {
  // constructor(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse, scale) {
  constructor(game, spritesheet, startX, startY, frames, frameSpeed) {
    super(game, spritesheet, startX, startY, frames, frameSpeed, 160, 160, .5, 65);
    this.shootInterval = dbc.LEGGY_DROID_SHOOT_INTERVAL;
  }

  shoot() {
    var targetAngle = Math.atan2(this.sceneManager.Zerlin.boundingbox.y + this.sceneManager.Zerlin.boundingbox.height / 2 - this.boundCircle.y,
      this.sceneManager.Zerlin.x - this.boundCircle.x);
    var distanceToTarget = 100; // arbitrary number to set laser's path, value not important

    var laserAngleOffset = dbc.SPRAY_LASER_WIDTH_RADIANS / 2;
    for (let i = 0; i < dbc.SPRAY_LASER_COUNT; i++) {
      let laser = new DroidLaser(this.game, this.boundCircle.x, this.boundCircle.y,
        dbc.LEGGY_DROID_LASER_SPEED,
        Math.cos(targetAngle + laserAngleOffset) * distanceToTarget + this.boundCircle.x,
        Math.sin(targetAngle + laserAngleOffset) * distanceToTarget + this.boundCircle.y,
        dbc.LEGGY_DROID_LASER_LENGTH, dbc.LEGGY_DROID_LASER_WIDTH, "red", "orange");
      this.sceneManager.addLaser(laser);
      laserAngleOffset -= dbc.SPRAY_LASER_WIDTH_RADIANS / (dbc.SPRAY_LASER_COUNT - 1);
    }
    this.game.audio.playSoundFx(this.game.audio.enemy, 'bowcasterShoot');
    this.fire = false;
  }
}

class SlowBurstDroid extends BasicDroid {
  constructor(game, spritesheet, startX, startY, frames, frameSpeed) {
    super(game, spritesheet, startX, startY, frames, frameSpeed, 160, 160, .5, 65);
    this.shootInterval = dbc.SLOWBURST_DROID_SHOOT_INTERVAL;
    this.totalShootIntervalsPerCycle = dbc.SLOWBURST_DROID_SHOOTS_PER_CYCLE;
    this.shootIntervalCount = 0;
  }

  shoot() {
    this.shootIntervalCount++;
    if (this.shootIntervalCount <= dbc.SLOWBURST_DROID_BURSTS) {
      let laser = new DroidLaser(this.game, this.boundCircle.x, this.boundCircle.y,
        dbc.SLOWBURST_DROID_LASER_SPEED,
        this.sceneManager.Zerlin.x,
        this.sceneManager.Zerlin.boundingbox.y + this.sceneManager.Zerlin.boundingbox.height / 2,
        dbc.BASIC_DROID_LASER_LENGTH, dbc.BASIC_DROID_LASER_WIDTH, "#339933", "#00ff00");
      this.sceneManager.addLaser(laser);
      this.game.audio.playSoundFx(this.game.audio.enemy, 'retroBlasterShot');
    } else if (this.shootIntervalCount > dbc.SLOWBURST_DROID_SHOOTS_PER_CYCLE) {
      this.shootIntervalCount = 0;
    }
    this.fire = false;
  }
}

class FastBurstDroid extends BasicDroid {
  constructor(game, spritesheet, startX, startY, frames, frameSpeed) {
    super(game, spritesheet, startX, startY, frames, frameSpeed, 160, 160, .5, 65);
    this.shootInterval = dbc.FASTBURST_DROID_SHOOT_INTERVAL;
    this.totalShootIntervalsPerCycle = dbc.FASTBURST_DROID_SHOOTS_PER_CYCLE;
    this.shootIntervalCount = 0;
  }

  shoot() {
    this.shootIntervalCount++;
    if (this.shootIntervalCount <= dbc.FASTBURST_DROID_BURSTS) {
      let laser = new DroidLaser(this.game, this.boundCircle.x, this.boundCircle.y,
        dbc.FASTBURST_DROID_LASER_SPEED,
        this.sceneManager.Zerlin.x,
        this.sceneManager.Zerlin.boundingbox.y + this.sceneManager.Zerlin.boundingbox.height / 2,
        dbc.LEGGY_DROID_LASER_LENGTH, dbc.LEGGY_DROID_LASER_WIDTH, "#006699", "#00ccff");
      this.sceneManager.addLaser(laser);
      this.game.audio.playSoundFx(this.game.audio.enemy, 'retroBlasterShot');
    } else if (this.shootIntervalCount > dbc.FASTBURST_DROID_SHOOTS_PER_CYCLE) {
      this.shootIntervalCount = 0;
    }
    this.fire = false;
  }
}

class SniperDroid extends BasicDroid {
  constructor(game, spritesheet, startX, startY, frames, frameSpeed) {
    super(game, spritesheet, startX, startY, frames, frameSpeed, 160, 160, .5, 65);
    this.shootInterval = dbc.SNIPER_DROID_SHOOT_INTERVAL;
  }

  shoot() {
    let laser = new DroidLaser(this.game, this.boundCircle.x, this.boundCircle.y,
      dbc.SNIPER_DROID_LASER_SPEED,
      this.sceneManager.Zerlin.x,
      this.sceneManager.Zerlin.boundingbox.y + this.sceneManager.Zerlin.boundingbox.height / 2,
      dbc.SNIPER_DROID_LASER_LENGTH, dbc.SNIPER_DROID_LASER_WIDTH, "#cccc00", "#ffff00");
    this.sceneManager.addLaser(laser);
    this.game.audio.playSoundFx(this.game.audio.enemy, 'bowcasterShoot');
    this.fire = false;
  }
}

class MultishotDroid extends BasicDroid {
  constructor(game, spritesheet, startX, startY, frames, frameSpeed) {
    super(game, spritesheet, startX, startY, frames, frameSpeed, 160, 160, .5, 65);
    this.shootInterval = dbc.MULTISHOT_DROID_SHOOT_INTERVAL;
  }

  shoot() {
    var angleToZerlin = Math.atan2(this.sceneManager.Zerlin.y - 150 - this.boundCircle.y, this.sceneManager.Zerlin.x - this.boundCircle.x);
    var xTarget = this.sceneManager.Zerlin.x;
    var yTarget = this.sceneManager.Zerlin.boundingbox.y + this.sceneManager.Zerlin.boundingbox.height / 2;
    var xOffset = Math.cos(angleToZerlin + Math.PI / 2) * dbc.MULTISHOT_WIDTH / 2;
    var yOffset = Math.sin(angleToZerlin + Math.PI / 2) * dbc.MULTISHOT_WIDTH / 2;

    let laser1 = new DroidLaser(this.game, this.boundCircle.x + xOffset, this.boundCircle.y + yOffset,
      dbc.BASIC_DROID_LASER_SPEED,
      xTarget + xOffset,
      yTarget + yOffset,
      dbc.BASIC_DROID_LASER_LENGTH, dbc.BASIC_DROID_LASER_WIDTH, "#333399", "#4966ff");

    let laser2 = new DroidLaser(this.game, this.boundCircle.x + xOffset * .55, this.boundCircle.y + yOffset * .55,
      dbc.BASIC_DROID_LASER_SPEED,
      xTarget + xOffset * .55,
      yTarget + yOffset * .55,
      dbc.BASIC_DROID_LASER_LENGTH, dbc.BASIC_DROID_LASER_WIDTH, "#333399", "#4966ff");

    let laser3 = new DroidLaser(this.game, this.boundCircle.x - xOffset * .55, this.boundCircle.y - yOffset * .55,
      dbc.BASIC_DROID_LASER_SPEED,
      xTarget - xOffset * .55,
      yTarget - yOffset * .55,
      dbc.BASIC_DROID_LASER_LENGTH, dbc.BASIC_DROID_LASER_WIDTH, "#333399", "#4966ff");

    let laser4 = new DroidLaser(this.game, this.boundCircle.x - xOffset, this.boundCircle.y - yOffset,
      dbc.BASIC_DROID_LASER_SPEED,
      xTarget - xOffset,
      yTarget - yOffset,
      dbc.BASIC_DROID_LASER_LENGTH, dbc.BASIC_DROID_LASER_WIDTH, "#333399", "#4966ff");

    this.sceneManager.addLaser(laser1);
    this.sceneManager.addLaser(laser2);
    this.sceneManager.addLaser(laser3);
    this.sceneManager.addLaser(laser4);
    this.game.audio.playSoundFx(this.game.audio.enemy, 'retroBlasterShot');
    this.fire = false;
  }
}














// class BeamDroid extends BasicDroid {

//     constructor(game, spritesheet, startX, startY) {
//         super(game, spritesheet, startX, startY);
//         this.beamAngle = Math.atan2(550 /* approximate Zerlin's height before he is instantiated */,
//                                     this.game.camera.width * camConst.ZERLIN_POSITION_ON_SCREEN);
//         this.beamAngleDelta = 0;

//         /* shooting fields */
//         this.shooting = false;
//         this.secondsBeforeFire = dbc.BEAM_DROID_SHOOT_INTERVAL;
//     }

//     update() {
//         super.calcMovement();

//         /* bounding circle movement */
//         this.boundCircle.x = this.x + this.radius;
//         this.boundCircle.y = this.y + this.radius;

//         /* droid shooting */
//         this.secondsBeforeFire -= this.game.clockTick;
//         this.setBeamAngle();
//         if (this.secondsBeforeFire <= 0 && !this.shooting) {
//             this.shoot();
//         }

//         if (this.shooting) {
//             this.shootingTime -= this.game.clockTick;
//             if (this.shootingTime <= 0) {
//                 this.shooting = false;
//                 this.beam.removeFromWorld = true;
//                 this.beam.isSizzling = false;
//                 if (this.game.beams.length <= 1) {
//                     this.game.audio.beam.stop();
//                 }
//                 this.beam = null;
//             }
//         }
//     }

//     setBeamAngle() {
//         var angleToZerlin = Math.atan2(this.game.Zerlin.y - 150 - this.boundCircle.y, this.game.Zerlin.x - this.boundCircle.x);
//         var angleDiff = this.shaveRadians(angleToZerlin - this.beamAngle);
//         if (angleDiff > Math.PI) {
//             // rotate beam clockwise
//             this.beamAngleDelta -= dbc.BEAM_ANGLE_ACCELERATION_RADIANS * this.game.clockTick;
//         } else {
//             // rotate beam counterclockwise
//             this.beamAngleDelta += dbc.BEAM_ANGLE_ACCELERATION_RADIANS * this.game.clockTick;
//         }
//         this.beamAngleDelta *= .97; // zero in on target by reducing speed of beam rotation
//         this.beamAngle += this.beamAngleDelta * this.game.clockTick;
//     }

//     /*
//      * Converts an angle to inside range [0, Math.PI * 2).
//      */
//     shaveRadians(angle) {
//         var newAngle = angle;
//         while (newAngle >= Math.PI * 2) {
//             newAngle -= Math.PI * 2;
//         }
//         while (newAngle < 0) {
//             newAngle += Math.PI * 2;
//         }
//         return newAngle;
//     }

//     shoot() {
//         this.beam = new Beam(this);
//         this.game.beams.push(this.beam);
//         this.secondsBeforeFire = dbc.BEAM_DROID_SHOOT_INTERVAL;
//         this.shooting = true;
//         this.shootingTime = dbc.BEAM_DROID_SHOOT_DURATION;
//         this.game.audio.beam.play();
//     }

//     explode() {
//         super.explode();
//         if (this.beam) {
//             this.beam.removeFromWorld = true;
//             this.beam.isSizzling = false;
//             if (this.game.beams.length <= 1) { // don't stop sound if another beam is still shooting
//                 this.game.audio.beam.stop();
//             }
//         }
//     }
// }

// class Beam {
//     constructor(shootingDroid) {
//         this.game = shootingDroid.game;
//         this.shootingDroid = shootingDroid;
//         this.segments = [];
//         this.segments.push({x: shootingDroid.boundCircle.x, y: shootingDroid.boundCircle.y, angle: 0});
//         this.isSizzling = false;
//         this.sizzlingSoundOn = false;
//     }

//     update() {
//         this.segments[0].x = this.shootingDroid.boundCircle.x;
//         this.segments[0].y = this.shootingDroid.boundCircle.y;
//         this.segments[0].angle = this.shootingDroid.beamAngle;
//         // collision manager detects end of beam segements and adds new ones if deflected.

//         if (this.isSizzling && !this.sizzlingSoundOn) {
//             this.game.audio.sizzle.play();
//             this.sizzlingSoundOn = true;
//         } else if (!this.isSizzling && this.sizzlingSoundOn) {
//             this.game.audio.sizzle.stop();
//             this.sizzlingSoundOn = false;
//         }
//     }

//     draw() {
//         var cameraX = this.game.camera.x; // just draw beams without checking camera?
//         var ctx = this.game.ctx;
//         ctx.save();
//         for (let i = 0; i < this.segments.length; i++) {
//             var segment = this.segments[i];

//             //Outer Layer of beam
//             ctx.lineWidth = dbc.BEAM_DROID_LASER_WIDTH;
//             ctx.strokeStyle = "purple";
//             ctx.lineCap = "round";
//             ctx.beginPath();
//             ctx.moveTo(segment.x - cameraX, segment.y);
//             ctx.lineTo(segment.endX - cameraX, segment.endY);
//             ctx.stroke();
//         }

//         // two loops so all inner beams are always on top of all outer beam 'glows'
//         for (let i = 0; i < this.segments.length; i++) {
//             var segment = this.segments[i];

//             //inner layer of beam.
//             ctx.lineWidth = dbc.BEAM_DROID_LASER_WIDTH / 2;
//             ctx.strokeStyle = "white";
//             ctx.lineCap = "round";
//             ctx.beginPath();
//             ctx.moveTo(segment.x - cameraX, segment.y);
//             ctx.lineTo(segment.endX - cameraX, segment.endY);
//             ctx.stroke();
//             ctx.closePath();
//         }

//         ctx.restore();
//     }
// }
