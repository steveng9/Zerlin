/*
Zerlin
TCSS 491 - Computational Worlds
Joshua Atherton, Michael Josten, Steven Golob
*/



var bc = Constants.BossConstants;

class Boss extends Entity {
	constructor(game, startX, startY) {
		// NOTE: this.(x, y) is his arm socket.
		super(game, startX, startY, 0, 0);

		this.assetManager = game.assetManager;
		this.ctx = game.ctx;
		this.falling = false;
		this.hits = 0;
		this.beamCannon = new BeamCannon(game, this);
		this.shooting = false;
		this.attackModeTimer = 0;
		this.secondsBeforeFire = bc.B_SHOOT_INTERVAL;
		this.secondsBeforeDropBomb = bc.BOMB_DROP_INTERVAL;
		this.jetPackSoundOn = false;
		this.beamDamageTimer = 0;
		this.sceneManager = this.game.sceneManager;
		this.alive = true;
		this.beamMode = true;
		this.bombs = [];
		this.hitWithSaberRecoveryTime = 0;

		/* Boss Health Stats */
		this.maxHealth = bc.B_MAX_HEALTH;
		this.currentHealth = this.maxHealth;

		this.faceLeft();
		this.createAnimations();
		var targetOrbitalX = (this.game.surfaceWidth / 2) + dbc.BASIC_DROID_ORBITAL_X_OFFSET;
		var targetOrbitalY = (this.game.surfaceHeight / 2) + dbc.BASIC_DROID_ORBITAL_Y_OFFSET;
		this.targetOrbitalPointLeft = {
			x: targetOrbitalX
		};

		targetOrbitalX = (this.game.surfaceWidth / 2) + dbc.BASIC_DROID_ORBITAL_X_OFFSET;
		this.targetOrbitalPointRight = {
			x: targetOrbitalX
		};
	}

	update() {
		this.hitWithSaberRecoveryTime -= this.game.clockTick;
		if (this.currentHealth <= 0) {
			this.die();
		}

		if (!this.falling) {
			if (!this.jetPackSoundOn) {
				//this.game.audio.playSoundFx(this.game.audio.jetPack);
				this.game.audio.playSound(this.game.audio.jetPack);
				this.jetPackSoundOn = true;
			}

			// this.deltaX = Math.cos(this.game.timer.gameTime) * bc.B_ACCELERATION;
			this.calcMovement();
		} else {
			this.lastBottom = this.boundingbox.bottom;
			this.deltaY += zc.GRAVITATIONAL_ACCELERATION * .7 * this.game.clockTick;
			this.reactionTime -= this.game.clockTick;
			if (this.reactionTime < 0) {
				this.falling = false;
				this.game.audio.playSoundFx(this.game.audio.jetPack);
				this.jetPackSoundOn = true;
			}
		}

		if (this.sceneManager.Zerlin.x < this.x && this.facingRight) {
			this.faceLeft();
		} else if (this.sceneManager.Zerlin.x > this.x && !this.facingRight) {
			this.faceRight();
		}

		if (this.boundingbox.hidden) {
			this.imuneToDamageTimer -= this.game.clockTick;
			if (this.imuneToDamageTimer < 0) {
				this.boundingbox.hidden = false;
			}
		}



		this.attackModeTimer += this.game.clockTick;
		if (this.beamMode && this.attackModeTimer > bc.BEAM_MODE_DURATION) {
			this.beamMode = false;
			this.attackModeTimer = 0;
		} else if (!this.beamMode && this.attackModeTimer > bc.BOMB_MODE_DURATION) {
			this.beamMode = true;
			this.attackModeTimer = 0;
		}

		if (this.beamMode) {
			this.secondsBeforeFire -= this.game.clockTick;
			if (this.secondsBeforeFire <= 0 && !this.shooting) {
				this.shoot();
			}
			if (this.shooting) {
				this.shootingTime -= this.game.clockTick;
				if (this.shootingTime <= 0) {
					this.shooting = false;
					if (this.beamCannon.on) {
						this.beamCannon.turnOff();
						// reset damage timer for every shoot
						this.secondsBeforeFire = bc.B_SHOOT_INTERVAL;
					}
				}
			}
		} else { // bomb mode
			this.secondsBeforeDropBomb -= this.game.clockTick;
			if (this.secondsBeforeDropBomb <= 0) {
				this.dropBomb();
				this.secondsBeforeDropBomb = bc.BOMB_DROP_INTERVAL;
			}
		}

		this.x += this.game.clockTick * this.deltaX;
		this.y += this.game.clockTick * this.deltaY;

		this.boundingbox.translateCoordinates(this.game.clockTick * this.deltaX, this.game.clockTick * this.deltaY);

		this.beamCannon.update();
		super.update();
		for (let i = this.bombs.length - 1; i >= 0; i--) {
			this.bombs[i].update();
			if (this.bombs[i].removeFromWorld) {
				this.bombs.splice(i, 1);
			}
		};
	}

	draw() {
		this.drawY = this.y - bc.B_ARM_SOCKET_Y * bc.B_SCALE;
		if (this.facingRight) {
			this.drawX = this.x - bc.B_ARM_SOCKET_X * bc.B_SCALE;
			if (this.falling) {
				this.animation = this.fallRightAnimation;
			} else {
				this.animation = this.flyRightAnimation;
			}
		} else { // facing left
			this.drawX = this.x - (bc.B_WIDTH - bc.B_ARM_SOCKET_X) * bc.B_SCALE;
			if (this.falling) {
				this.animation = this.fallLeftAnimation;
			} else {
				this.animation = this.flyLeftAnimation;
			}
		}

		this.animation.drawFrame(this.game.clockTick, this.ctx, this.drawX - this.sceneManager.camera.x, this.drawY);
		this.beamCannon.draw();

		if (bc.B_DRAW_COLLISION_BOUNDRIES) {
			this.ctx.strokeStyle = "black";
			if (!this.boundingbox.hidden) {
				this.ctx.strokeRect(this.boundingbox.x - this.sceneManager.camera.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
			}
		}
		this.bombs.forEach(function(bomb) {
			bomb.draw();
		});
	}

	calcMovement() {
		this.targetOrbitalPointLeft.x = this.sceneManager.Zerlin.x - dbc.BASIC_DROID_ORBITAL_X_OFFSET;
		//add 200 so that the droids uses up all the canvas becuase when targeting Zerlin,
		//doesn't use all of the canvas
		this.targetOrbitalPointRight.x = this.sceneManager.Zerlin.x + dbc.BASIC_DROID_ORBITAL_X_OFFSET + 200;

		if (this.y > (this.sceneManager.camera.height - bc.B_HOVERING_HEIGHT)) {
			this.deltaY -= bc.B_ACCELERATION * this.game.clockTick;
		} else {
			this.deltaY += bc.B_ACCELERATION * this.game.clockTick;
		}
		if (Math.abs(this.deltaY) > 200) {
			this.deltaY *= .99;
		}

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

		//after calculating change in x and y then increment x and y by delta x and delta y
		// this.x += this.game.clockTick * (Math.random() * this.deltaX);
		// this.y += this.game.clockTick * (Math.random() * this.deltaY);
		this.x += this.game.clockTick * this.deltaX;
		this.y += this.game.clockTick * this.deltaY;

		this.boundingbox.translateCoordinates(this.game.clockTick * this.deltaX, this.game.clockTick * this.deltaY);
	}

	hitBySaber(explosionScale) {

    	if (this.hitWithSaberRecoveryTime <= 0) {
			this.currentHealth -= zc.AIRBORN_SABER_DAMAGE;
	 		this.sceneManager.addEntity(new DroidExplosion(this.game, this.boundingbox.x + this.boundingbox.width / 2, this.boundingbox.y + this.boundingbox.height / 2, explosionScale, .2));
	 	}
	 	this.hitWithSaberRecoveryTime = .5;
	}


	die() {
		this.alive = false;
		this.game.audio.jetPack.stop();
		if (this.shooting) {
			this.shooting = false;
			if (this.beamCannon.on) {
				this.beamCannon.turnOff();
			}
			this.sceneManager.addEntity(new DroidExplosion(this.game, 
									this.x + (this.animation.scale * this.animation.frameWidth / 2), 
									this.y + (this.animation.scale * this.animation.frameHeight / 2),
									7, .5, .2));
			this.removeFromWorld = true;
		}
	}

	fall() {
		this.game.audio.jetPack.stop();
		this.jetPackSoundOn = false;
		this.reactionTime = bc.B_FALLING_REACTION_TIME;
		this.falling = true;
	}

	hideBox() {
		this.boundingbox.hidden = true;
		this.imuneToDamageTimer = bc.B_RECOVERY_PERIOD;
	}

	shoot() {
		this.shooting = true;
		this.secondsBeforeFire = bc.B_SHOOT_INTERVAL;
		this.shootingTime = bc.B_SHOOT_DURATION;
		this.beamCannon.turnOn();
	}

	dropBomb() {
		this.bombs.push(new Bomb(this.game, this.x, this.y, this.deltaX, this.deltaY)); 
	}

	setXY(x, y) {
		this.x = x;
		this.y = y;
		// update boundingBox
		if (this.facingRight) {
			this.faceRight();
		} else {
			this.faceLeft();
		}
	}

	isTileBelow(tile) {
		return (this.boundingbox.left < tile.boundingBox.right) &&
			(this.boundingbox.right > tile.boundingBox.left) &&
			(this.boundingbox.bottom + 10 > tile.boundingBox.top) &&
			(this.boundingbox.bottom - 10 < tile.boundingBox.top);
	}

	/*
	 * check if animation is done (can't call animation.isDone() because it does not have latest clockTick yet in update())
	 */
	isAnimationDone() {
		return (this.animation.elapsedTime + this.game.clockTick) >= this.animation.totalTime;
	}

	faceRight() {
		this.facingRight = true;
		this.boundingbox = new BoundingBox(this.x - 5 * bc.B_SCALE, this.y - 80 * bc.B_SCALE, 60 * bc.B_SCALE, 160 * bc.B_SCALE);
		this.beamCannon.faceRight();
	}

	faceLeft() {
		this.facingRight = false;
		this.boundingbox = new BoundingBox(this.x - 55 * bc.B_SCALE, this.y - 80 * bc.B_SCALE, 60 * bc.B_SCALE, 160 * bc.B_SCALE);
		this.beamCannon.faceLeft();
	}


	createAnimations() {
		this.flyRightAnimation = new Animation(this.assetManager.getAsset("img/boss flying.png"),
			0, 0,
			bc.B_WIDTH,
			bc.B_HEIGHT,
			bc.B_FLYING_FRAME_SPEED,
			bc.B_FLYING_FRAMES,
			true, false,
			bc.B_SCALE);
		this.flyLeftAnimation = new Animation(this.assetManager.getAsset("img/boss flying left.png"),
			0, 0,
			bc.B_WIDTH,
			bc.B_HEIGHT,
			bc.B_FLYING_FRAME_SPEED,
			bc.B_FLYING_FRAMES,
			true, false,
			bc.B_SCALE);
		this.fallRightAnimation = new Animation(this.assetManager.getAsset("img/boss falling.png"),
			0, 0,
			bc.B_WIDTH,
			bc.B_HEIGHT,
			bc.B_FALLING_FRAME_SPEED,
			bc.B_FALLING_FRAMES,
			true, false,
			bc.B_SCALE);
		this.fallLeftAnimation = new Animation(this.assetManager.getAsset("img/boss falling left.png"),
			0, 0,
			bc.B_WIDTH,
			bc.B_HEIGHT,
			bc.B_FALLING_FRAME_SPEED,
			bc.B_FALLING_FRAMES,
			true, false,
			bc.B_SCALE);
		// this.dieAnimation =
	}
}



class BeamCannon extends Entity {

	constructor(game, body) {
		super(game, body.x, body.y, 0, 0);
		this.assetManager = game.assetManager;
		this.ctx = game.ctx;
		this.angle = 0;
		this.body = body;
		this.hidden = false;
		this.width = bc.BC_WIDTH * bc.B_SCALE;
		this.height = bc.BC_HEIGHT * bc.B_SCALE;
		this.beamAngleDelta = 0;
		this.beamAngle = 0;
		this.beam = null;
		this.setUpCannonImages();
		this.faceRight();
		this.lengthSocketToMuzzle = Math.sqrt(Math.pow(this.muzzleY, 2) + Math.pow(this.muzzleX, 2));
		this.muzzleWidth = bc.MUZZLE_WIDTH * bc.B_SCALE;
	}

	update() {
		this.x = this.body.x;
		this.y = this.body.y;

		this.setBeamAngle();
		if (this.beam) {
			this.beam.update();
		}
		super.update();
	}

	draw() {
		if (!this.hidden) {
			this.ctx.save();
			if (this.beam) {
				this.beam.draw();
			}
			this.ctx.translate(this.x - this.sceneManager.camera.x, this.y);
			this.ctx.rotate(this.beamAngle);
			this.ctx.drawImage(this.image,
				0,
				0,
				bc.BC_WIDTH,
				bc.BC_HEIGHT,
				-(this.armSocketX),
				-(this.armSocketY),
				this.width,
				this.height);

			// this.ctx.beginPath();
			// this.ctx.strokeStyle = "green";
			// this.ctx.arc(this.muzzleX, this.muzzleY, 5, 0, Math.PI * 2, false);
			// this.ctx.stroke();
			// this.ctx.closePath();
			this.ctx.restore();
		}
		super.draw();
	}

	turnOn() {
		this.on = true;
		this.beam = new Beam(this);
		// this.sceneManager.beams.push(this.beam);
		//this.game.audio.playSoundFx(this.game.audio.beam);
		this.game.audio.playSound(this.game.audio.beam);
	}

	turnOff() {
		this.on = false;
		this.beam.removeFromWorld = true;
		this.game.audio.sizzle.stop();
		this.game.audio.beam.stop();
		this.beam = null;
	}

	faceRight() {
		this.image = this.faceRightCannonImage;
		this.armSocketX = bc.BC_X_AXIS * bc.B_SCALE;
		this.armSocketY = bc.BC_RIGHT_Y_AXIS * bc.B_SCALE;
		this.muzzleX = (bc.BC_MUZZLE_X - bc.BC_X_AXIS) * bc.B_SCALE;
		this.muzzleY = (bc.BC_MUZZLE_RIGHT_Y - bc.BC_RIGHT_Y_AXIS) * bc.B_SCALE;
		this.angleSocketToMuzzle = Math.atan2(this.muzzleY, this.muzzleX);
		this.facingRight = true;
		// console.log("right");
		// console.log(this.muzzleX);
		// console.log(this.muzzleY);
	}

	faceLeft() {
		this.image = this.faceLeftCannonImage;
		this.armSocketX = bc.BC_X_AXIS * bc.B_SCALE;
		this.armSocketY = bc.BC_LEFT_Y_AXIS * bc.B_SCALE;
		this.muzzleX = (bc.BC_MUZZLE_X - bc.BC_X_AXIS) * bc.B_SCALE;
		this.muzzleY = (bc.BC_MUZZLE_LEFT_Y - bc.BC_LEFT_Y_AXIS) * bc.B_SCALE;
		this.angleSocketToMuzzle = Math.atan2(this.muzzleY, this.muzzleX);
		this.facingRight = false;
		// console.log("left");
		// console.log(this.muzzleX);
		// console.log(this.muzzleY);
	}

	setBeamAngle() {
		/*
					Axis  A	|\
						| \
						|  \
				 elbow  B |___\ C   Target
		*/
		var zerlinBox = this.sceneManager.Zerlin.boundingbox;
		var angleAxisToTarget = Math.atan2(zerlinBox.y + zerlinBox.height / 2 - this.y, zerlinBox.x + zerlinBox.width / 2 - this.x);
		var distanceAxisToTarget = distance(this, this.sceneManager.Zerlin.boundingbox);
		var distanceAxisToElbow = this.muzzleY;
		var angleBCA = Math.asin(distanceAxisToElbow / distanceAxisToTarget);
		var angleToZerlin = angleAxisToTarget - angleBCA;

		var angleDiff = shaveRadians(angleToZerlin - this.beamAngle);
		if (angleDiff > Math.PI) {
			// rotate beam clockwise
			this.beamAngleDelta -= bc.BEAM_ANGLE_ACCELERATION_RADIANS * this.game.clockTick;
		} else {
			// rotate beam counterclockwise
			this.beamAngleDelta += bc.BEAM_ANGLE_ACCELERATION_RADIANS * this.game.clockTick;
		}
		this.beamAngleDelta *= .92; // zero in on target by reducing speed of beam rotation
		this.beamAngle += this.beamAngleDelta * this.game.clockTick;
	}

	setUpCannonImages() {
		this.faceRightCannonImage = this.assetManager.getAsset("img/beam cannon.png");
		this.faceLeftCannonImage = this.assetManager.getAsset("img/beam cannon left.png");
	}

}

/*
 * Converts an angle to inside range [0, Math.PI * 2).
 */
var shaveRadians = function(angle) {
	var newAngle = angle;
	while (newAngle >= Math.PI * 2) {
		newAngle -= Math.PI * 2;
	}
	while (newAngle < 0) {
		newAngle += Math.PI * 2;
	}
	return newAngle;
}



class Beam {
	constructor(cannon) {
		this.game = cannon.game;
		this.sceneManager = cannon.sceneManager;
		this.cannon = cannon;
		this.segments = [];
		for (let i = 0; i < bc.MICRO_BEAM_COUNT; i++) {
			this.segments.push({
				x: cannon.x,
				y: cannon.y,
				angle: cannon.beamAngle
			});
		}
		this.isSizzling = false;
		this.sizzlingSoundOn = false;
		this.width = this.cannon.muzzleWidth / bc.MICRO_BEAM_COUNT * 2;
	}

	update() {
		this.segments.splice(bc.MICRO_BEAM_COUNT); // recreate all deflected segments;
		var xOffsetArmSocketToCenterOfMuzzle = this.cannon.lengthSocketToMuzzle * Math.cos(this.cannon.beamAngle + this.cannon.angleSocketToMuzzle);
		var yOffsetArmSocketToCenterOfMuzzle = this.cannon.lengthSocketToMuzzle * Math.sin(this.cannon.beamAngle + this.cannon.angleSocketToMuzzle);

		var xOffsetCenterOfMuzzleToCorner = -this.cannon.muzzleWidth / 2 * Math.sin(this.cannon.beamAngle);
		var yOffsetCenterOfMuzzleToCorner = this.cannon.muzzleWidth / 2 * Math.cos(this.cannon.beamAngle);
		// console.log(this.cannon.lengthSocketToMuzzle);

		for (let i = 0; i < bc.MICRO_BEAM_COUNT; i++) {
			let microBeamPlacementMultiplier = (2 / (bc.MICRO_BEAM_COUNT - 1) * i - 1);
			this.segments[i].x = this.cannon.x + xOffsetArmSocketToCenterOfMuzzle + xOffsetCenterOfMuzzleToCorner * microBeamPlacementMultiplier;
			this.segments[i].y = this.cannon.y + yOffsetArmSocketToCenterOfMuzzle + yOffsetCenterOfMuzzleToCorner * microBeamPlacementMultiplier;
			this.segments[i].angle = this.cannon.beamAngle;
			// set beam to reasonable length
			this.segments[i].endX = Math.cos(this.segments[i].angle) * bc.MAX_BEAM_LENGTH + this.segments[i].x;
			this.segments[i].endY = Math.sin(this.segments[i].angle) * bc.MAX_BEAM_LENGTH + this.segments[i].y;
		}

		// collision manager adds new segments if deflected.

		if (this.isSizzling && !this.sizzlingSoundOn) {
			//this.game.audio.playSoundFx(this.game.audio.sizzle);
			this.game.audio.playSound(this.game.audio.sizzle);
			this.sizzlingSoundOn = true;
		} else if (!this.isSizzling && this.sizzlingSoundOn) {
			this.game.audio.sizzle.stop();
			this.sizzlingSoundOn = false;
		}
	}

	draw() {
		var cameraX = this.sceneManager.camera.x; // just draw beams without checking if in view of camera?
		var ctx = this.game.ctx;
		ctx.save();
		for (let i = 0; i < this.segments.length; i++) {
			var segment = this.segments[i];

			//Outer Layer of beam
			ctx.lineWidth = this.width * 5;
			ctx.strokeStyle = "red";
			ctx.lineCap = "round";
			ctx.beginPath();
			ctx.moveTo(segment.x - cameraX, segment.y);
			ctx.lineTo(segment.endX - cameraX, segment.endY);
			ctx.stroke();
		}

		for (let i = 0; i < this.segments.length; i++) {
			var segment = this.segments[i];

			//Outer Layer of beam
			ctx.lineWidth = this.width * 3;
			ctx.strokeStyle = "orange";
			ctx.lineCap = "round";
			ctx.beginPath();
			ctx.moveTo(segment.x - cameraX, segment.y);
			ctx.lineTo(segment.endX - cameraX, segment.endY);
			ctx.stroke();
		}

		// two loops so all inner beams are always on top of all outer beam 'glows'
		for (let i = 0; i < this.segments.length; i++) {
			var segment = this.segments[i];

			//inner layer of beam.
			ctx.lineWidth = this.width;
			ctx.strokeStyle = "white";
			ctx.lineCap = "round";
			ctx.beginPath();
			ctx.moveTo(segment.x - cameraX, segment.y);
			ctx.lineTo(segment.endX - cameraX, segment.endY);
			ctx.stroke();
			ctx.closePath();
		}

		ctx.restore();
	}
}


class Bomb extends Entity {

	constructor(game, startX, startY, deltaX, deltaY) {
		super(game, startX, startY, deltaX, deltaY);
		this.camera = this.game.sceneManager.camera;
		this.animation = new Animation(this.game.assetManager.getAsset("img/bomb.png"), 
			0, 0, 204, 192, bc.BOMB_FRAME_DURATION, bc.FRAMES, false, false, bc.BOMB_SCALE);
		this.boundingCircle = new BoundingCircle(this.x + (this.animation.frameWidth / 2 * bc.BOMB_SCALE), (this.y + this.animation.frameWidth / 2 * bc.BOMB_SCALE), this.animation.frameWidth / 2 * bc.BOMB_SCALE);
	}

	update() {
		this.deltaY += zc.GRAVITATIONAL_ACCELERATION * this.game.clockTick;

		this.x += this.deltaX * this.game.clockTick;
		this.y += this.deltaY * this.game.clockTick;
		this.boundingCircle.translateCoordinates(this.deltaX * this.game.clockTick, this.deltaY * this.game.clockTick);
	}

	draw() {
		this.animation.drawFrame(this.game.clockTick, this.game.ctx, this.x - this.camera.x, this.y);

		// draw bounding circle
		
		// this.game.ctx.beginPath();
		// this.game.ctx.strokeStyle = "black";
		// this.game.ctx.arc(this.boundingCircle.x - this.camera.x,
		// 	this.boundingCircle.y, this.boundingCircle.radius, 0, Math.PI * 2, false);
		// this.game.ctx.stroke();
		// this.game.ctx.closePath();
	}

	explode() {
		this.removeFromWorld = true;
		this.game.sceneManager.addEntity(new DamagingExplosion(this.game, this.boundingCircle.x, this.boundingCircle.y));

	}
}
