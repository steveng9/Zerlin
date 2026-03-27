/*
Zerlin
TCSS 491 - Computational Worlds
Joshua Atherton, Michael Josten, Steven Golob
*/

var zConst = Constants.ZerlinConstants;
var dbConst = Constants.DroidBasicConstants;
var bc = Constants.BossConstants;
const cm = Constants.CollisionManagerConstants;


/*
 * Detects and handles collisions for game entities.
 */
class CollisionManager {

  constructor(game, sceneManager) {
    this.game = game;
    this.sceneManager = sceneManager;
  }

  handleCollisions() {
    // this.droidOnDroid();
    this.droidOnSaber();
    this.laserOnDroid();
    this.laserOnSaber();
    this.laserOnZerlin();
    this.ZerlinOnPowerup();
    this.ZerlinOnPlatform();
    this.ZerlinOnEdgeOfMap();
    this.beamOnPlatform();
    this.beamOnSaber();
    this.beamOnZerlin();
    this.beamOnDroid();
    this.beamOnBoss();
    this.saberOnBoss();
    this.laserOnBoss();
    this.catchSaber();
    this.bombOnPlatform();
    this.bombExplosionOnZerlin();
    this.ZerlinOnCheckpoint();

    // TODO: loop through only visible tiles instead of entire level
  }

  /* On droids colliding, swap deltaX and deltaY */
  droidOnDroid() {
    //check collision with other droids.
    //can optimize by not checking every single droid with each other twice.

    // for (var i = this.sceneManager.droids.length - 1; i >= 0; i--) {
    // 	var droid1 = this.sceneManager.droids[i];
    // 	for (var j = this.sceneManager.droids.length - 1; j >= 0; j--) {
    // 		var droid2 = this.sceneManager.droids[j];
    // 		if(droid1 != null && droid2 != null && droid1 != droid2
    // 			&& collideCircleWithCircle(droid1.boundCircle.x, droid1.boundCircle.y, droid1.boundCircle.radius,
    // 				droid2.boundCircle.x, droid2.boundCircle.y, droid2.boundCircle.radius)) {

    // 			//handle collision of droids with droids.
    // 			//swap velocities, bounce effect.
    // 			/*
    // 			* BUG ALERT:
    // 			* kinda strange, has the characteristics that we want as in that
    // 			* it only bounces some times, but it is a bug/feature in this code that
    // 			* only makes them bounce some times instead of having the
    // 			* chance they can bounce being bound to a constant
    // 			*/
    // 			var tempX = droid1.deltaX;
    // 			var tempY = droid1.deltaY;
    // 			droid1.deltaX = droid2.deltaX;
    // 			droid1.deltaY = droid2.deltaY;
    // 			droid2.deltaX = tempX;
    // 			droid2.deltaY = tempY;

    //tag code modified for droids, doesn't work
    // var temp = {deltaX: droid1.deltaX, deltaY: droid1.deltaY};
    // var dist = distance(droid1, droid2);
    // var delta = droid1.boundCircle.radius + droid2.boundCircle.radius - dist;
    // var difX = (droid1.boundCircle.x - droid2.boundCircle.x)/dist;
    // var difY = (droid1.boundCircle.y - droid2.boundCircle.y)/dist;

    // droid1.x += difX * delta / 2;
    // droid1.y += difY * delta / 2;
    // droid2.x -= difX * delta / 2;
    // droid2.y -= difY * delta / 2;

    // droid1.deltaX = droid2.deltaX;
    // droid1.deltaY = droid2.deltaY;
    // droid2.deltaX = temp.deltaX;
    // droid2.deltaY = temp.deltaY;
    // droid1.x += droid1.deltaX * this.sceneManager.clockTick;
    // droid1.y += droid1.deltaY * this.sceneManager.clockTick;
    // droid2.x += droid2.deltaX * this.sceneManager.clockTick;
    // droid2.y += droid2.deltaY * this.sceneManager.clockTick;

    // 		}
    // 	}

    // }

  }

  droidOnSaber() {
    var zerlin = this.sceneManager.Zerlin;
    if (zerlin.slashing && zerlin.slashZone.active) {
      for (var i = this.sceneManager.droids.length - 1; i >= 0; i--) {
        var droid = this.sceneManager.droids[i];
        // check if droid in circular path of saber and not below zerlin
        if (collidePointWithCircle(droid.boundCircle.x,
            droid.boundCircle.y,
            zerlin.slashZone.outerCircle.x,
            zerlin.slashZone.outerCircle.y,
            zerlin.slashZone.outerCircle.radius) &&
          !collidePointWithCircle(droid.boundCircle.x,
            droid.boundCircle.y,
            zerlin.slashZone.innerCircle.x,
            zerlin.slashZone.innerCircle.y,
            zerlin.slashZone.innerCircle.radius) &&
          droid.boundCircle.y < zerlin.y) {
          if (droid instanceof LeggyDroidBoss) {
            droid.hitWithSaber();
          } else {
            droid.explode();
          }
        }
      }
    } else if (zerlin.lightsaber.throwing) {
      for (var i = this.sceneManager.droids.length - 1; i >= 0; i--) {
        var droid = this.sceneManager.droids[i];
        if (collidePointWithCircle(droid.boundCircle.x, droid.boundCircle.y, zerlin.lightsaber.airbornSaber.x, zerlin.lightsaber.airbornSaber.y, zerlin.lightsaber.airbornSaber.radius)) {
          if (this.sceneManager.droids[i] instanceof LeggyDroidBoss) {
            this.sceneManager.droids[i].hitWithSaber();
          } else {
            droid.explode();
          }
        }
      }
    }
  }

  laserOnDroid() {
    for (var i = this.sceneManager.lasers.length - 1; i >= 0; i--) {
      if (this.sceneManager.lasers[i].isDeflected) {
        for (var j = this.sceneManager.droids.length - 1; j >= 0; j--) {
          if (this.isLaserCollidedWithDroid(this.sceneManager.lasers[i], this.sceneManager.droids[j])) {
            if (this.sceneManager.droids[j] instanceof LeggyDroidBoss) {
              this.sceneManager.droids[j].hitWithLaser();
            } else {
              this.sceneManager.droids[j].explode();
            }
            this.sceneManager.lasers[i].removeFromWorld = true;
          }
        }
      }
    }
  }

  laserOnSaber() {
    if (!this.sceneManager.Zerlin.lightsaber.hidden && !this.sceneManager.Zerlin.lightsaber.throwing && !this.sceneManager.Zerlin.lightsaber.shocking) {
      for (var i = this.sceneManager.lasers.length - 1; i >= 0; i--) {
        var laser = this.sceneManager.lasers[i];
        if (!laser.isDeflected) {
          var collision = this.isCollidedWithSaber(laser);
          if (collision.collided) {
            this.sceneManager.Zerlin.lightsaber.spark(collision.intersection);
            if (this.sceneManager.Zerlin.lightsaber.splitLasers && this.sceneManager.Zerlin.lightsaber.homingLasers) {
              this.deflectLaserSplitAndHoming(laser, collision.intersection);
            } else if (this.sceneManager.Zerlin.lightsaber.splitLasers) {
              this.deflectLaserSplit(laser, collision.intersection);
            } else if (this.sceneManager.Zerlin.lightsaber.homingLasers) {
              this.deflectLaserHoming(laser, collision.intersection);
            } else {
              this.deflectLaser(laser, collision.intersection);
            }

            if (laser.poisoned) {
              this.game.audio.playSoundFx(this.game.audio.saberDeflectLaser);
            } else {
              this.game.audio.playSoundFx(this.game.audio.enemy, 'retroBlasterShot');
            }
          }
        }
      }
    }
  }

  laserOnZerlin() {
    var zerlin = this.sceneManager.Zerlin;
    if (!zerlin.boundingbox.hidden && !zerlin.invincible) {
      for (var i = 0; i < this.sceneManager.lasers.length; i++) {
        var laser = this.sceneManager.lasers[i];
        if (!laser.isDeflected &&
        laser.x > zerlin.boundingbox.left &&
        laser.x < zerlin.boundingbox.right &&
        laser.y > zerlin.boundingbox.top &&
        laser.y < zerlin.boundingbox.bottom) {
          // this.game.audio.wound.play();
          if (laser.poisoned)
            zerlin.poisoned = true;
          this.game.audio.playSoundFx(this.game.audio.hero, 'heroHurt');
          zerlin.hits++;
          zerlin.currentHealth--; //eventually subtract by laser damage
          //then maybe make zerlin invincible for a few ticks
          // console.log(zerlin.hits);
          laser.removeFromWorld = true;
        }
      }
    }
  }

  ZerlinOnPowerup() {
    var zerlin = this.sceneManager.Zerlin;
    for (var i = 0; i < this.sceneManager.powerups.length; i++) {
      var powerup = this.sceneManager.powerups[i];
      if (collideCircleWithRectangle(powerup.boundCircle.x, powerup.boundCircle.y, powerup.boundCircle.radius,
          zerlin.boundingbox.x, zerlin.boundingbox.y, zerlin.boundingbox.width, zerlin.boundingbox.height)) {

        //play power up pickup sound
        this.sceneManager.addActivePowerup(powerup);
        // call the powerup effect.
        powerup.effect();
        powerup.playSound();

        powerup.removeFromWorld = true;
      }

    }

  }

  ZerlinOnPlatform() {
    var zerlin = this.sceneManager.Zerlin;
    if (zerlin.falling) { // check if landed
      for (let i = 0; i < this.sceneManager.level.tiles.length; i++) {
        let tile = this.sceneManager.level.tiles[i];
        if (zerlin.boundingbox.collide(tile.boundingBox) && zerlin.lastBottom < tile.boundingBox.top) {
          zerlin.falling = false;
          zerlin.tile = tile;
          zerlin.deltaY = 0;
          zerlin.setXY(zerlin.x, tile.boundingBox.top + zConst.Z_FEET_ABOVE_FRAME * zConst.Z_SCALE);
          return;
        }
      }
    } else { // check if falls off current platform
      for (let i = 0; i < this.sceneManager.level.tiles.length; i++) {
        if (zerlin.isTileBelow(this.sceneManager.level.tiles[i])) {
          zerlin.tile = this.sceneManager.level.tiles[i];
          return;
        }
      }
      zerlin.falling = true;
      zerlin.tile = null;
    }
  }

  ZerlinOnEdgeOfMap() { // TODO: currently, keeps zerlin from falling off edge of map, but do we want to allow that for daring players? Adventurous but foolhardy
    var zerlin = this.sceneManager.Zerlin;
    if (zerlin.y > 2 * this.sceneManager.camera.height) {
      if (zerlin.alive) {
        this.sceneManager.droids = [];
        this.sceneManager.lasers = [];
        this.sceneManager.powerups = [];
        this.sceneManager.level.set();
        console.log(this.sceneManager.checkPoint.boundingBox.x);
        zerlin.setXY(this.sceneManager.checkPoint.boundingBox.x, 0);
        zerlin.deltaY = 0;
      }
    } else if (zerlin.x < cm.EDGE_OF_MAP_BUFFER) {
      zerlin.setXY(cm.EDGE_OF_MAP_BUFFER, zerlin.y);
    } else if (zerlin.x > this.sceneManager.level.length - cm.EDGE_OF_MAP_BUFFER) {
      zerlin.setXY(this.sceneManager.level.length - cm.EDGE_OF_MAP_BUFFER, zerlin.y);
    }

  }

  ZerlinOnCheckpoint() {
    var zerlin = this.sceneManager.Zerlin;
    for (var i = 0; i < this.sceneManager.otherEntities.length; i++) {
        if (this.sceneManager.otherEntities[i] instanceof CheckPoint) {
            var checkPoint = this.sceneManager.otherEntities[i];
            if (checkPoint.boundingBox.collide(zerlin.boundingbox)) {
                checkPoint.removeFromWorld = true;
                this.sceneManager.setCheckPoint(checkPoint);
                checkPoint.playSound();
            }
        }
	}
  }

  beamOnSaber() {
    this.sceneManager.Zerlin.lightsaber.deflectingBeam = false;
    if (this.sceneManager.boss && this.sceneManager.boss.beamCannon.beam && !this.sceneManager.Zerlin.lightsaber.hidden
      && !this.sceneManager.Zerlin.lightsaber.throwing && !this.sceneManager.Zerlin.lightsaber.shocking) {
      var zerlin = this.sceneManager.Zerlin;
      var lightsaber = zerlin.lightsaber;
      var beamSegments = this.sceneManager.boss.beamCannon.beam.segments;
      let j = 0;
      while (j < beamSegments.length) {
        // console.log(beamSegments.length);
        if (!beamSegments[j].deflected) {
          var collisionWithSaber = this.isCollidedLineWithLine({
            p1: {
              x: beamSegments[j].x,
              y: beamSegments[j].y
            },
            p2: {
              x: beamSegments[j].endX,
              y: beamSegments[j].endY
            }
          }, {
            p1: lightsaber.bladeCollar,
            p2: lightsaber.bladeTip
          });
          // TODO: check for collision with ANY deflective agent (i. e. a mirror or laser shield or something)
          if (collisionWithSaber.collided) {
            lightsaber.deflectingBeam = true;
            beamSegments[j].endX = collisionWithSaber.intersection.x;
            beamSegments[j].endY = collisionWithSaber.intersection.y;
            var newAngle = 2 * lightsaber.getSaberAngle() - beamSegments[j].angle;
            beamSegments.push({
              x: collisionWithSaber.intersection.x,
              y: collisionWithSaber.intersection.y,
              angle: newAngle,
              endX: Math.cos(newAngle) * bc.MAX_BEAM_LENGTH + collisionWithSaber.intersection.x,
              endY: Math.sin(newAngle) * bc.MAX_BEAM_LENGTH + collisionWithSaber.intersection.y,
              deflected: true
            });
          }
        }
        j++;
      }
    }
    this.beamOnPlatform();
  }

  beamOnDroid() {
    if (this.sceneManager.boss && this.sceneManager.boss.beamCannon.beam) {
      var beamSegments = this.sceneManager.boss.beamCannon.beam.segments;
      // only check second segment for collision on droids
      if (beamSegments.length > bc.MICRO_BEAM_COUNT) {
        for (var j = this.sceneManager.droids.length - 1; j >= 0; j--) {
          for (let k = bc.MICRO_BEAM_COUNT; k < beamSegments.length; k++) {
            let beamSeg = beamSegments[k];
            let droidCircle = this.sceneManager.droids[j].boundCircle;
            if (collideLineWithCircle(beamSeg.x, beamSeg.y, beamSeg.endX, beamSeg.endY, droidCircle.x, droidCircle.y, droidCircle.radius)) {
              this.sceneManager.droids[j].explode();
            }
          }
        }
      }
    }
  }

  beamOnZerlin() {
    if (this.sceneManager.boss && this.sceneManager.boss.beamCannon.beam) {
      var beam = this.sceneManager.boss.beamCannon.beam;
      var zerlinBox = this.sceneManager.Zerlin.boundingbox;
      beam.isSizzling = false;
      if (!zerlinBox.hidden) {
        var beamSegments = beam.segments;
        for (let j = 0; j < bc.MICRO_BEAM_COUNT; j++) {
          let beamSeg = beamSegments[j];
          let zerlinCollision = collideLineWithRectangle(beamSeg.x, beamSeg.y, beamSeg.endX, beamSeg.endY,
            zerlinBox.x, zerlinBox.y, zerlinBox.width, zerlinBox.height);
          if (zerlinCollision.collides) {
            beam.isSizzling = true;

            if (!this.sceneManager.Zerlin.invincible) {
              this.sceneManager.Zerlin.currentHealth -= this.game.clockTick * bc.BEAM_HP_PER_SECOND;
              // console.log(this.sceneManager.Zerlin.currentHealth);
              // console.log(this.sceneManager.Zerlin.hits);
            }

            // find intersection with box with shortest beam length, end beam there
            var closestIntersection = findClosestIntersectionOnBox(zerlinCollision, beamSeg);
            beamSeg.endX = closestIntersection.x;
            beamSeg.endY = closestIntersection.y;
            // beamSegments.splice(j+1);
          }
        }
      }
    }
  }

  beamOnBoss() {
    if (this.sceneManager.boss && this.sceneManager.boss.beamCannon.beam) {
      var beam = this.sceneManager.boss.beamCannon.beam;
      var bossBox = this.sceneManager.boss.boundingbox;
      // beam.isSizzling = false;
      var beamSegments = beam.segments;
      if (beamSegments.length > bc.MICRO_BEAM_COUNT) {
        for (let j = bc.MICRO_BEAM_COUNT; j < beamSegments.length; j++) {
          var beamSeg = beamSegments[j];
          var bossCollision = collideLineWithRectangle(beamSeg.x, beamSeg.y, beamSeg.endX, beamSeg.endY,
            bossBox.x, bossBox.y, bossBox.width, bossBox.height);
          if (bossCollision.collides) {

            this.sceneManager.boss.hits += this.game.clockTick;
            this.sceneManager.boss.beamDamageTimer += this.game.clockTick;
            //addition
            this.sceneManager.boss.currentHealth -= zConst.Z_BOSS_BEAM_DAMAGE;

            // find intersection with box with shortest beam length, end beam there
            var closestIntersection = findClosestIntersectionOnBox(bossCollision, beamSeg);
            beamSeg.endX = closestIntersection.x;
            beamSeg.endY = closestIntersection.y;
            if (this.sceneManager.boss.beamDamageTimer > bc.B_BEAM_EXPLOSION_THRESHHOLD) {
              this.sceneManager.addEntity(new DroidExplosion(this.game, closestIntersection.x, closestIntersection.y, .7, .2));

              this.sceneManager.boss.beamCannon.turnOff();
              this.sceneManager.boss.fall();
              this.sceneManager.boss.beamDamageTimer = 0;
              break;
            }
          }
        }
      }
    }
  }



  beamOnPlatform() {
    // only detects collision with top of platforms

    if (this.sceneManager.boss && this.sceneManager.boss.beamCannon.beam) {
      var beamSegments = this.sceneManager.boss.beamCannon.beam.segments;
      for (let j = 0; j < beamSegments.length; j++) {
        var beamSeg = beamSegments[j];
        var beamAngle = shaveRadians(beamSeg.angle);
        if (beamAngle < Math.PI && beamAngle > 0) { // going down only, not up
          for (let k = 0; k < this.sceneManager.level.tiles.length; k++) {
            let tile = this.sceneManager.level.tiles[k];
            let collisionWithPlatform = this.isCollidedLineWithLine(tile.surface, {
              p1: {
                x: beamSeg.x,
                y: beamSeg.y
              },
              p2: {
                x: beamSeg.endX,
                y: beamSeg.endY
              }
            });
            if (collisionWithPlatform.collided) {
              beamSeg.endX = collisionWithPlatform.intersection.x;
              beamSeg.endY = collisionWithPlatform.intersection.y;
            }
          }
        }
      }
    }
  }

  laserOnBoss() {
    if (this.game.boss && !this.game.boss.boundingbox.hidden) {
      var boss = this.game.boss;
      var bossBox = boss.boundingbox;
      for (var i = 0; i < this.game.lasers.length; i++) {
        var laser = this.game.lasers[i];
        if (laser.isDeflected &&
          laser.x > bossBox.left &&
          laser.x < bossBox.right &&
          laser.y > bossBox.top &&
          laser.y < bossBox.bottom) {

          //play sound of boss being hit
          boss.hits++;
          boss.currentHealth -= 1 //laser damage later?
          laser.removeFromWorld = true;

        }
      }
    }
  }

  saberOnBoss() {
    if (this.sceneManager.boss && !this.sceneManager.boss.boundingbox.hidden) {
      var zerlin = this.sceneManager.Zerlin;
      var bossBox = this.sceneManager.boss.boundingbox;
      var bossCenterX = bossBox.x + bossBox.width / 2;
      var bossCenterY = bossBox.y + bossBox.height / 2;
      if (zerlin.slashing && zerlin.slashZone.active) {

        // check if droid in circular path of saber and not below zerlin
        if (collidePointWithCircle(bossCenterX,
            bossCenterY,
            zerlin.slashZone.outerCircle.x,
            zerlin.slashZone.outerCircle.y,
            zerlin.slashZone.outerCircle.radius) &&
          !collidePointWithCircle(bossCenterX,
            bossCenterY,
            zerlin.slashZone.innerCircle.x,
            zerlin.slashZone.innerCircle.y,
            zerlin.slashZone.innerCircle.radius) &&
          bossCenterY < zerlin.y) {
          // this.sceneManager.addEntity(new DroidExplosion(this.game, bossCenterX, bossBox.y + bossBox.height / 2, 2.3, .7));
          // this.sceneManager.boss.hideBox();
          // this.sceneManager.boss.hits += 3;
          // //added ---- below
          // this.sceneManager.boss.currentHealth -= zConst.Z_SLASH_DAMAGE;
          this.sceneManager.boss.hitBySaber(2.3);
        }
      } else if (zerlin.lightsaber.throwing) {
        if (collidePointWithCircle(bossCenterX, bossCenterY, zerlin.lightsaber.airbornSaber.x, zerlin.lightsaber.airbornSaber.y, zerlin.lightsaber.airbornSaber.radius)) {
          this.sceneManager.boss.hitBySaber(.7);
          // this.sceneManager.boss.currentHealth -= zc.AIRBORN_SABER_DAMAGE;
          // this.sceneManager.addEntity(new DroidExplosion(this.game, bossCenterX, bossCenterY, .7, .2));
        }
      }
    }
  }

  catchSaber() {
    var saberArm = this.sceneManager.Zerlin.lightsaber;
    if (saberArm.throwing) {
      if (saberArm.airbornSaber.throwTimer > .5) {
        if (collidePointWithCircle(saberArm.x, saberArm.y, saberArm.airbornSaber.x, saberArm.airbornSaber.y, saberArm.airbornSaber.radius)) {
          saberArm.catch();
        }
      }
    }
  }

  bombOnPlatform() {
    if (this.sceneManager.boss) {
      let bombs = this.sceneManager.boss.bombs;
      for (let i = bombs.length - 1; i >= 0; i--) {
        for (let k = 0; k < this.sceneManager.level.tiles.length; k++) {
          let tile = this.sceneManager.level.tiles[k];
          if (collideLineWithCircle2(tile.surface, bombs[i].boundingCircle)) {
            bombs[i].explode();
            break;
          }
        }
      }
    }
  }

  bombExplosionOnZerlin() {
    var zerlin = this.sceneManager.Zerlin;
    if (!zerlin.boundingbox.hidden && !zerlin.invincible) {
      for (let i = 0; i < this.sceneManager.otherEntities.length; i++) {
        if (this.sceneManager.otherEntities[i] instanceof DamagingExplosion && !this.sceneManager.otherEntities[i].damageDone) {
          if (collideCircleWithRectangle2(this.sceneManager.otherEntities[i].boundingCircle, zerlin.boundingbox)) {
            this.sceneManager.otherEntities[i].damageDone = true;
            zerlin.currentHealth -= bc.BOMB_DAMAGE;
          }
        }
      }
    }
  }


  isLaserCollidedWithDroid(laser, droid) {
    return collideLineWithCircle(laser.x, laser.y, laser.tailX, laser.tailY, droid.boundCircle.x,
      droid.boundCircle.y, droid.boundCircle.radius);
  }

  // helper functions

  isCollidedWithSaber(laser) {
    var lightsaber = this.sceneManager.Zerlin.lightsaber;
    var laserP1 = {
      x: laser.x,
      y: laser.y
    };
    var laserP2 = {
      x: laser.prevX,
      y: laser.prevY
    };

    // decrease miss percentage by also checking previous blade
    var collidedWithCurrentBlade = this.isCollidedLineWithLine({
      p1: laserP1,
      p2: laserP2
    }, {
      p1: lightsaber.bladeCollar,
      p2: lightsaber.bladeTip
    });
    var collidedWithPreviousBlade = this.isCollidedLineWithLine({
      p1: laserP1,
      p2: laserP2
    }, {
      p1: lightsaber.prevBladeCollar,
      p2: lightsaber.prevBladeTip
    });

    return {
      collided: collidedWithCurrentBlade.collided || collidedWithPreviousBlade.collided,
      intersection: collidedWithCurrentBlade.intersection
    };
  }

  isCollidedLineWithLine(line1, line2) {
    // TODO: possibly change segment intersection using clockwise check (more elegant)
    var m1 = this.calcSlope(line1.p1, line1.p2);
    var b1 = line1.p1.y - m1 * line1.p1.x;
    var m2 = this.calcSlope(line2.p1, line2.p2);
    var b2 = line2.p2.y - m2 * line2.p2.x;

    var parallel = m1 === m2;
    if (!parallel) {
      var intersection = {};
      intersection.x = (b2 - b1) / (m1 - m2);
      intersection.y = m1 * intersection.x + b1;
      var isCollided = this.isPointOnSegment(intersection, line1) &&
        this.isPointOnSegment(intersection, line2);
      return {
        collided: isCollided,
        intersection: intersection
      };
    } else { // can't collide if parallel.
      return false;
    }
  }
  calcSlope(p1, p2) {
    return (p1.y - p2.y) / (p1.x - p2.x);
  }
  isPointOnSegment(pt, segment) {
    return (pt.x >= Math.min(segment.p1.x, segment.p2.x)) &&
      (pt.x <= Math.max(segment.p1.x, segment.p2.x)) &&
      (pt.y >= Math.min(segment.p1.y, segment.p2.y)) &&
      (pt.y <= Math.max(segment.p1.y, segment.p2.y));
  }
  deflectLaser(laser, collisionPt) {
    laser.isDeflected = true;

    var zerlin = this.sceneManager.Zerlin;
    laser.angle = 2 * zerlin.lightsaber.getSaberAngle() - laser.angle;
    laser.deltaX = Math.cos(laser.angle) * laser.speed + zerlin.deltaX;
    laser.deltaY = Math.sin(laser.angle) * laser.speed + zerlin.deltaY;
    // TODO: prevent rare ultra slow lasers
    laser.slope = laser.deltaY / laser.deltaX;

    // move laser so tail is touching the deflection point, instead of the head
    var deltaMagnitude = Math.sqrt(Math.pow(laser.deltaX, 2) + Math.pow(laser.deltaY, 2));
    laser.tailX = collisionPt.x;
    laser.tailY = collisionPt.y;
    laser.x = laser.tailX + laser.deltaX / deltaMagnitude * laser.length;
    laser.y = laser.tailY + laser.deltaY / deltaMagnitude * laser.length;
    // laser.angle = this.findAngle(this.x, this.y, this.tailX, this.tailY);
  }

  deflectLaserHoming(laser, collisionPt) {
    laser.isDeflected = true;

    var zerlin = this.sceneManager.Zerlin;
    var coreAngle = 2 * zerlin.lightsaber.getSaberAngle() - laser.angle;
    var newLaser = new HomingLaser(this.game, laser.x, laser.y, laser.speed, coreAngle, laser.length, laser.width, laser.color, laser.deflectedColor);
    newLaser.isDeflected = true;
    this.sceneManager.lasers.push(newLaser);
    laser.removeFromWorld = true;
  }

  deflectLaserSplit(laser, collisionPt) {
    laser.isDeflected = true;

    var zerlin = this.sceneManager.Zerlin;
    var coreAngle = 2 * zerlin.lightsaber.getSaberAngle() - laser.angle;

    var individualAngle = coreAngle - puc.SPLIT_LASER_ARC_WIDTH / 2;
    for (let i = 0; i < puc.SPLIT_LASER_AMOUNT; i++) {
      let newLaser = DroidLaser.angleConstructor(this.game, laser.x, laser.y, laser.speed, individualAngle, laser.length, laser.width, laser.color, laser.deflectedColor);
      newLaser.isDeflected = true;
      this.sceneManager.lasers.push(newLaser);
      individualAngle += puc.SPLIT_LASER_ARC_WIDTH / (puc.SPLIT_LASER_AMOUNT - 1);
    }
    laser.removeFromWorld = true;
  }

  deflectLaserSplitAndHoming(laser, collisionPt) {
    laser.isDeflected = true;

    var zerlin = this.sceneManager.Zerlin;
    var coreAngle = 2 * zerlin.lightsaber.getSaberAngle() - laser.angle;

    var individualAngle = coreAngle - puc.SPLIT_LASER_ARC_WIDTH / 2;
    for (let i = 0; i < puc.SPLIT_LASER_AMOUNT; i++) {
      let newLaser = new HomingLaser(this.game, laser.x, laser.y, laser.speed, individualAngle, laser.length, laser.width, laser.color, laser.deflectedColor);
      newLaser.isDeflected = true;
      this.sceneManager.lasers.push(newLaser);
      individualAngle += puc.SPLIT_LASER_ARC_WIDTH / (puc.SPLIT_LASER_AMOUNT - 1);
    }
    laser.removeFromWorld = true;
  }

}

class BoundingBox {

  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.left = x;
    this.top = y;
    this.right = x + width;
    this.bottom = y + height;
  }

  collide(oth) {
    if ((this.right > oth.left) &&
      (this.left < oth.right) &&
      (this.top < oth.bottom) &&
      (this.bottom > oth.top)) {
      return true;
    }
    return false;
  }

  updateCoordinates(x, y) {
    this.x = x;
    this.y = y;

    this.left = x;
    this.top = y;
    this.right = x + this.width;
    this.bottom = y + this.height;
  }

  translateCoordinates(deltaX, deltaY) {
    this.x += deltaX;
    this.y += deltaY;
    this.left += deltaX;
    this.top += deltaY;
    this.right += deltaX;
    this.bottom += deltaY;
  }

}

class BoundingCircle {

  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }

  updateCoordinates(x, y) {
    this.x = x;
    this.y = y;
  }

  translateCoordinates(deltaX, deltaY) {
    this.x += deltaX;
    this.y += deltaY;
  }
}

/**
 * function that will calculate the distance between point a and point b.
 * both arguments need to have x and y prototype or field
 */
var distance = function(a, b) {
  return Math.sqrt(Math.pow((a.x - b.x), 2) + Math.pow((a.y - b.y), 2));
}

/* START OF COLLISION FUNCTIONS */

/**
 * This method will return a boolean if the the circles collide.
 * @param {number} cx1 circle 1 x cord
 * @param {number} cy1 ''
 * @param {number} cr1 circle 1 radius
 * @param {number} cx2 circle 2 x cord
 * @param {number} cy2 ''
 * @param {number} cr2 circle 2 radius
 */
var collideCircleWithCircle = function(cx1, cy1, cr1, cx2, cy2, cr2) {
  result = false;
  //get distance between circles
  var dist = distance({
    x: cx1,
    y: cy1
  }, {
    x: cx2,
    y: cy2
  });

  //compare distance with the sum of the radii
  if (dist <= cr1 + cr2) {
    result = true;
  }
  return result;
}

/**
 * Function that will check the if the line segment has any point along
 * the line segment inside the radius of the circle.
 * @param {number} x1 is the x cord of end point of line
 * @param {number} y1 ''
 * @param {number} x2 is the x cord of another end point of line
 * @param {number} y2 ''
 * @param {number} cx circle x locations
 * @param {number} cy ''
 * @param {number} r  radius of circle
 */
var collideLineWithCircle = function(x1, y1, x2, y2, cx, cy, r) {
  //Check if either end point is in the circle, if so, return right away
  inside1 = collidePointWithCircle(x1, y1, cx, cy, r);
  inside2 = collidePointWithCircle(x2, y2, cx, cy, r);
  if (inside1 || inside2) return true;

  //get length of the line
  var length = distance({
    x: x1,
    y: y1
  }, {
    x: x2,
    y: y2
  });

  //get dot product of line and circle
  var dot = (((cx - x1) * (x2 - x1)) + ((cy - y1) * (y2 - y1))) / Math.pow(length, 2);

  //find closest point on line to the circle
  var closestX = x1 + (dot * (x2 - x1));
  var closestY = y1 + (dot * (y2 - y1));

  //check if the point is on the line segment
  var onSegment = collidePointWithLine(x1, y1, x2, y2, closestX, closestY);
  if (!onSegment) return false;

  //get distance to the closest point from circle
  var dist = distance({
    x: closestX,
    y: closestY
  }, {
    x: cx,
    y: cy
  });

  if (dist <= r) {
    return true;
  }
  return false;

}

var collideLineWithCircle2 = function(line, circle) {
  return collideLineWithCircle(line.p1.x, line.p1.y, line.p2.x, line.p2.y, circle.x, circle.y, circle.radius);
}

/**
 * This function will check to see if a point is on a line segment
 * @param {number} x1 is the start x cord of the line segment
 * @param {number} y1 ''
 * @param {number} x2 is the end x cord of the line segment
 * @param {number} y2 ''
 * @param {number} px is the point x cord to compare with the line segment
 * @param {number} py ''
 */
var collidePointWithLine = function(x1, y1, x2, y2, px, py) {
  //get distance between endpoints and point
  var distance1 = distance({
    x: x1,
    y: y1
  }, {
    x: px,
    y: py
  });
  var distance2 = distance({
    x: x2,
    y: y2
  }, {
    x: px,
    y: py
  });
  //get distance of line
  var lineDist = distance({
    x: x1,
    y: y1
  }, {
    x: x2,
    y: y2
  });

  //because of accuracy of floats, define a buffer of collision
  var buffer = 0.1 //higher # = less accurate

  //if the 2 distances are equal to the line length, then the point is on the line
  //use buffer to give a range of collision
  if (distance1 + distance2 >= lineDist - buffer && distance1 + distance2 <= lineDist + buffer) {
    return true;
  }
  return false;
}

/**
 * This function will check if the point is inside the radius of the circle
 * @param {number} px is the x value of a point
 * @param {number} py is the y value of a point
 * @param {number} cx is the x value of the circle origin
 * @param {number} cy ''
 * @param {number} r is the radius of the circle
 */
var collidePointWithCircle = function(px, py, cx, cy, r) {
  var result = false;
  //get distance between point and circle with pythagorean theroem
  var dist = distance({
    x: px,
    y: py
  }, {
    x: cx,
    y: cy
  });
  //if distance is less than r, than there is a collision
  if (dist <= r) {
    result = true;
  }
  return result;

}

/**
 * This function will calculate if there is a collision on the line segment
 * and will also give the point of intersection.
 * @param {number} x1 Line 1 Endpoint 1 x cord
 * @param {number} y1 ''
 * @param {number} x2 Line 1 Endpoint 2 x cord
 * @param {number} y2 ''
 * @param {number} x3 Line 2 Endpoint 1 x cord
 * @param {number} y3 ''
 * @param {number} x4 Line 2 Endpoint 2 x cord
 * @param {number} y4 ''
 * @return object {collides: boolean, x: intersectionX, y: intersectionY}
 */
var collideLineWithLine = function(x1, y1, x2, y2, x3, y3, x4, y4) {
  var result = {
    collides: false,
    x: 0,
    y: 0
  };
  //calculate the distance to the intersection point
  var uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
  var uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

  // if uA and uB is between 0-1, then the lines collide.
  if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
    //intersection points
    var intX = x1 + (uA * (x2 - x1));
    var intY = y1 + (uA * (y2 - y1));
    result.collides = true;
    result.x = intX;
    result.y = intY;
  }
  return result;

}
var collideLineWithLineHelper = function(line1, line2) {
  return collideLineWithLine(line1.p1.x, line1.p1.y, line1.p2.x, line1.p2.y, line2.p1.x, line2.p1.y, line2.p2.x, line2.p2.y).collides;
}

/**
 * This function will return a boolean if the line segment collides with
 * the rectangle
 * @param {number} x1 is an endpoint 1x cord
 * @param {number} y1 ''
 * @param {number} x2 is endpoint 2 line segment x cord
 * @param {number} y2 ''
 * @param {number} rx rectangle x cordinate (top left)
 * @param {number} ry rectangle y cordinate (top left)
 * @param {number} rw rectangle width
 * @param {number} rh rectangle height
 */
var collideLineWithRectangle = function(x1, y1, x2, y2, rx, ry, rw, rh) {
  //check collision of line segment with each side of the rectangle
  var left = collideLineWithLine(x1, y1, x2, y2, rx, ry, rx, ry + rh);
  var right = collideLineWithLine(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh);
  var top = collideLineWithLine(x1, y1, x2, y2, rx, ry, rx + rw, ry);
  var bottom = collideLineWithLine(x1, y1, x2, y2, rx, ry + rh, rx + rw, ry + rh);

  return {
    collides: left.collides || right.collides || top.collides || bottom.collides,
    left: left,
    right: right,
    top: top,
    bottom: bottom
  };
}

var collideLineWithRectangle2 = function(line, rect) {
  return collideLineWithRectangle(line.p1.x, line.p1.y, line.p2.x, line.p2.y, rect.x, rect.y, rect.width, rect.height).collides;
}


var findClosestIntersectionOnBox = function(intersections, startOfLine) {
  var minimumLengthBeam = Number.MAX_VALUE;
  var closestIntersection = {};

  if (intersections.left.collides) {
    let length1 = distance(startOfLine, intersections.left);
    if (length1 < minimumLengthBeam) {
      closestIntersection = intersections.left;
      minimumLengthBeam = length1;
    }
  }
  if (intersections.right.collides) {
    let length2 = distance(startOfLine, intersections.right);
    if (length2 < minimumLengthBeam) {
      closestIntersection = intersections.right;
      minimumLengthBeam = length2;
    }
  }
  if (intersections.top.collides) {
    let length3 = distance(startOfLine, intersections.top);
    if (length3 < minimumLengthBeam) {
      closestIntersection = intersections.top;
      minimumLengthBeam = length3;
    }
  }
  if (intersections.bottom.collides) {
    let length4 = distance(startOfLine, intersections.bottom);
    if (length4 < minimumLengthBeam) {
      closestIntersection = intersections.bottom;
      minimumLengthBeam = length4;
    }
  }
  return closestIntersection;
}

/**
 *
 * @param {number} cx is the center of circle x cord
 * @param {number} cy ''
 * @param {number} cr is the circle radius
 * @param {number} rx is the rectangle x cord
 * @param {number} ry is the top left rectangle y cord
 * @param {number} rw is the width of the rectangle
 * @param {number} rh is the height of the rectangle
 */
var collideCircleWithRectangle = function(cx, cy, cr, rx, ry, rw, rh) {
  var result = false;
  //temp variables to set edges for testing
  var testX = cx;
  var testY = cy;

  //calculate which edge is the closest.
  if (cx < rx) testX = rx; //test left edge
  else if (cx > rx + rw) testX = rx + rw; //test right edge
  if (cy < ry) testY = ry; // test top edge
  else if (cy > ry + rh) testY = ry + rh; //test bottom edge

  //get distance from closest edge
  var dist = distance({
    x: cx,
    y: cy
  }, {
    x: testX,
    y: testY
  });

  //if distance is less than circle radius then there is a collision.
  if (dist <= cr) {
    result = true;
  }
  return result;
}

var collideCircleWithRectangle2 = function(circle, box) {
  return collideCircleWithRectangle(circle.x, circle.y, circle.radius, box.x, box.y, box.width, box.height);
}
