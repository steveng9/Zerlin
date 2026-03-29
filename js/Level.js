/*
Zerlin
TCSS 491 - Computational Worlds
Joshua Atherton, Michael Josten, Steven Golob
*/


/*
Assets:
//powerups are capital

-  =  tile
=  =  moving tile
~  =  falling tile
d  =  basic droid
s  =  scatter shot droid
b  =  slow burst droid
f  =  fast burst droid
m  =  multi-shot droid
n  =  sniper droid

H  =  health powerup
F  =  force powerup
I  =  invincibility powerup
S  =  split-shot powerup
T  =  tiny mode powerup
W  =  homing laser power up

C  =  checkpoint

*  =  leggy droid boss
X  =  Boss
*/

const lc = Constants.LevelConstants;

class Level {
  constructor(game, sceneManager, levelLayout, backgrounds, tileImages) {
    this.game = game;
    this.sceneManager = sceneManager;
    this.camera = sceneManager.camera;

    this.levelLayout = levelLayout;
    this.tileImages = {};
    this.parralaxBackgroundLayers = [];
    this.instantiateLayers(backgrounds, tileImages);
    console.assert(tileImages.centerTile.width === tileImages.leftTile.width);
    console.assert(tileImages.leftTile.width === tileImages.rightTile.width);
    this.tileWidth = this.tileImages.centerTile.width;
    this.tileHeight = this.tileImages.centerTile.height;
    this.ctx = game.ctx;

    this.length = this.levelLayout[0].length * this.tileWidth;
  }

  set() {
    var result = LevelLoader.load(this, this.game, this.sceneManager);
    this.tiles             = result.tiles;
    this.unspawnedDroids   = result.unspawnedDroids;
    this.unspawnedPowerups = result.unspawnedPowerups;
    this.unspawnedBoss     = result.unspawnedBoss;
    // CheckPoints are entities that need to be registered with the scene
    result.checkpoints.forEach(cp => this.sceneManager.addEntity(cp));
  }

  instantiateLayers(backgrounds, tileImages) {
    for (let i = 0; i < backgrounds.length; i++) {
      this.parralaxBackgroundLayers.push(backgrounds[i]);
    }
    this.tileImages = {
      centerTile: this.game.assetManager.getAsset(tileImages.centerTile),
      leftTile: this.game.assetManager.getAsset(tileImages.leftTile),
      rightTile: this.game.assetManager.getAsset(tileImages.rightTile),
      leftRightTile: this.game.assetManager.getAsset(tileImages.leftRightTile)
    };
  }

  update() {
    this.parralaxBackgroundLayers.forEach(layer => {
      layer.update();
    });
    // adds droids to game engine when in view of camera
    for (let i = this.unspawnedDroids.length - 1; i >= 0; i--) {
      let droid = this.unspawnedDroids[i];
      let dimension = droid.boundCircle.radius * 2;
      if (this.camera.isInView(droid, dimension, dimension)) {
        this.sceneManager.addDroid(droid);
        this.unspawnedDroids.splice(i, 1);
      }
    }
    for (let i = this.unspawnedPowerups.length - 1; i >= 0; i--) {
      let powerup = this.unspawnedPowerups[i];
      let dimension = powerup.boundCircle.radius * 2;
      if (this.camera.isInView(powerup, dimension, dimension)) {
        this.sceneManager.addPowerup(powerup);
        this.unspawnedPowerups.splice(i, 1);
      }
    }

    //spawn the boss into the level
    if (this.unspawnedBoss) {
      if (this.sceneManager.camera.isInView(this.unspawnedBoss, 0, 0)) {
        this.sceneManager.boss = this.unspawnedBoss;
        this.unspawnedBoss = null;
      }
    }

    this.tiles.forEach(function(tile) {
      if (tile instanceof MovingTile || tile instanceof FallingTile) {
        tile.update();
      }
    });
  }

  draw() {
    var that = this;
    this.parralaxBackgroundLayers.forEach(layer => {
      layer.draw();
    });
    this.tiles.forEach(function(tile) {
      if (that.camera.isInView(tile, tile.width, tile.height)) {
        tile.draw();
      }
    });
  }
  // method that will return the length of the level minus the offset of i.
  getLengthAtI(i) {
    return (this.levelLayout[0].length - i) * this.tileWidth;
  }

}





//Draw a tile of given size.
class Tile extends Entity {
  constructor(level, image, startX, startY) {
    super(level.game, startX, startY, 0, 0);
    this.camera = level.camera;
    this.tileImage = image;
    this.width = image.width;
    this.height = image.height;
    this.ctx = this.game.ctx;
    this.drawBox = true;


    // add + 2 to y to increase precision on bounding box to actual platform image
    this.boundingBox = new BoundingBox(this.x, this.y + 2, this.width, this.height);
    this.surface = {
      p1: {
        x: this.x,
        y: this.y
      },
      p2: {
        x: this.width + this.x,
        y: this.y
      }
    };
  }
  update() {

  }
  draw() {
    this.ctx.drawImage(this.tileImage, this.x - this.camera.x, this.y);

    if (lc.DRAW_BOXES) {
      this.ctx.strokeStyle = "black";
      this.ctx.strokeRect(this.boundingBox.x - this.camera.x, this.boundingBox.y, this.boundingBox.width, this.boundingBox.height);
    }
  }
}

/**
 Tiles that have a lifeSpan and steadily move down the screen once that
 lifeSpan has expired. Lifespan count down starts when a player sees the tile.
*/
class FallingTile extends Tile {
  constructor(game, image, startX, startY) {
    super(game, image, startX, startY);
    this.lifeSpan = 4;
    this.playerHasSeenTile = false;
    this.deltaYForZerlin = 0;
  }

  update() {
    if (this.camera.isInView(this, this.width, this.height))
      this.playerHasSeenTile = true;

    if (this.playerHasSeenTile)
      this.lifeSpan += -1 * this.game.clockTick;
    if (this.lifeSpan < 0) { //falling tile
      this.falling = true;
      this.y += 15 * this.game.clockTick; //was 10
      this.boundingBox.updateCoordinates(this.x, this.y);
      this.surface = {
        p1: {
          x: this.x,
          y: this.y
        },
        p2: {
          x: this.width + this.x,
          y: this.y
        }
      };
    }
    if (this.y > this.game.surfaceHeight) {
      this.removeFromWorld = true;
      // console.log("removed from world");
    }
  }
}


class MovingTile extends Tile {
  constructor(game, image, startX, startY, initialDeltaX, initialDeltaY, acceleration) {
    super(game, image, startX, startY);
    this.initialDeltaX = initialDeltaX;
    this.deltaX = initialDeltaX;
    this.deltaY = initialDeltaY;
    this.startX = startX;
    this.startY = startY;
    this.acceleration = acceleration;
  }

  update() {
    if (this.x < this.startX) {
      this.deltaX += this.acceleration * this.game.clockTick;
    } else {
      this.deltaX -= this.acceleration * this.game.clockTick;
    }
    if (this.prevX < this.startX && this.x >= this.startX) { // give tile its initial velocity to prevent gradual decay of pendulum motion
      this.deltaX = this.initialDeltaX;
    }


    this.prevX = this.x;
    this.x += this.deltaX * this.game.clockTick;
    this.surface = {
      p1: {
        x: this.x,
        y: this.y
      },
      p2: {
        x: this.width + this.x,
        y: this.y
      }
    };
    // this.y += this.deltaY * this.game.clockTick;
    this.boundingBox.translateCoordinates(this.deltaX * this.game.clockTick, this.deltaY * this.game.clockTick);
  }

}




/*
 * An individual image to be drawn with its follower.
 */
class ParallaxScrollBackground extends Entity {

  constructor(game, sceneManager, backgroundImage, scale, distanceFromCamera, x, y) {
    super(game, 0, 0, 0, 0);
    this.startX = x ? x : 0;
    this.startY = y ? y : 0;
    this.x = this.startX;
    this.y = this.startY;

    this.camera = sceneManager.camera;
    this.scale = scale; // TODO: integrate scale of image
    this.backgroundImage = game.assetManager.getAsset(backgroundImage);
    this.imageWidth = this.backgroundImage.width;
    this.imageHeight = this.backgroundImage.height;
    // this.game.camera = camera;

    console.assert(this.imageWidth >= this.camera.width, "Image width must be larger than camera width!");
    console.assert(this.backgroundImage.height >= this.camera.height, "Image height must be larger than camera height!");
    this.distanceFromCamera = distanceFromCamera;

    this.ctx = game.ctx;
    this.imageDistanceFromX = 0;
  }

  update() {
    // simulates slower movement for further distances
    this.x = this.startX + this.camera.x - (this.camera.x * 100 / this.distanceFromCamera);
    this.y = this.startY + this.camera.y - (this.camera.y * 100 / this.distanceFromCamera);

    // x moves slower than camera, so update how far image is drawn from x to "keep up" with camera.
    while (this.imageDistanceFromX + (2 * this.imageWidth) + this.x < this.camera.x + this.camera.width) {
      this.imageDistanceFromX = this.imageDistanceFromX + this.imageWidth;
    }
    while (this.imageDistanceFromX + this.x > this.camera.x) {
      this.imageDistanceFromX = this.imageDistanceFromX - this.imageWidth;
    }
  }

  draw() {
    this.ctx.drawImage(this.backgroundImage, this.imageDistanceFromX + this.x - this.camera.x, this.y - this.camera.y);
    this.ctx.drawImage(this.backgroundImage, this.imageDistanceFromX + this.x + this.imageWidth - this.camera.x, this.y - this.camera.y);
  }
}


class ParallaxRotatingBackground extends ParallaxScrollBackground {


  constructor(game, sceneManager, backgroundImage, scale, distanceFromCamera) {
    super(game, sceneManager, backgroundImage, scale, distanceFromCamera);
    this.camera = sceneManager.camera;
    this.scale = scale; // TODO: integrate scale of image
    this.backgroundImage = game.assetManager.getAsset(backgroundImage);
    this.imageWidth = this.backgroundImage.width;
    this.imageHeight = this.backgroundImage.height;
    this.angle = 0;

    console.assert(this.imageWidth >= this.camera.width, "Image width must be larger than camera width!");
    console.assert(this.backgroundImage.height >= this.camera.height, "Image height must be larger than camera height!");

    this.ctx = game.ctx;
    this.imageDistanceFromX = 0;
  }

  instantiate(game, camera) {
    this.game = game;
    this.camera = camera;
  }

  update() {
    this.angle += this.game.clockTick * 2 * Math.PI / 500;
  }

  draw() {

    this.ctx.save();
    this.ctx.translate(this.camera.width / 2, this.camera.height / 2);
    this.ctx.rotate(this.angle);

    this.ctx.drawImage(this.backgroundImage,
      0,
      0,
      this.imageWidth,
      this.imageHeight,
      -this.imageWidth / 2,
      -this.imageHeight / 2,
      this.imageWidth,
      this.imageHeight);
    this.ctx.restore();
  }
}



class ParallaxAnimatedBackground extends Entity {

  constructor(game, sceneManager, animation, scale, distanceFromCamera, x, y) {
    super(game, 0, 0, 0, 0);
    this.startX = x ? x : 0;
    this.startY = y ? y : 0;
    this.x = this.startX;
    this.y = this.startY;

    this.camera = sceneManager.camera;
    this.scale = scale; // TODO: integrate scale of image
    this.animation = animation;
    // this.imageWidth = this.backgroundImage.width;
    // this.game.camera = camera;

    this.distanceFromCamera = distanceFromCamera;

    this.ctx = game.ctx;
    // this.imageDistanceFromX = 0;
  }

  update() {
    // simulates slower movement for further distances
    this.x = this.startX + this.camera.x - (this.camera.x * 100 / this.distanceFromCamera);
    this.y = this.startY + this.camera.y - (this.camera.y * 100 / this.distanceFromCamera);
  }

  draw() {
    this.animation.drawFrame(this.game.clockTick, this.game.ctx, this.x - this.camera.x, this.y - this.camera.y);
  }

}



class ParallaxFloatingBackground extends ParallaxScrollBackground {

  constructor(game, sceneManager, backgroundImage, scale, distanceFromCamera, functionStartX) {
    super(game, sceneManager, backgroundImage, scale, distanceFromCamera);
    this.camera = sceneManager.camera;
    this.functionX = functionStartX;
  }

  instantiate(game, camera) {
    this.game = game;
    this.camera = camera;
  }

  update() {
    super.update();
    this.functionX += this.game.clockTick;
    this.y = Math.sin(this.functionX) * 13000 / this.distanceFromCamera;
  }

  draw() {
    super.draw();
  }
}




var SNOW_PERIOD_FACTOR = 3;
var SNOW_SPEED = 10;

class ParallaxSnowBackground extends Entity {

  constructor(game, sceneManager, distanceFromCamera) {
    super(game, 0, 0, 0, 0);

    this.camera = sceneManager.camera;
    this.backgroundImage = game.assetManager.getAsset("img/levels/hoth/snow layer.png");
    this.imageWidth = this.backgroundImage.width;
    this.imageHeight = this.backgroundImage.height;
    this.distanceFromCamera = distanceFromCamera;
    this.functionX = Math.random() * 2 * Math.PI / SNOW_PERIOD_FACTOR;

    this.ctx = game.ctx;
    this.imageDistanceFromX = 0;
    this.scale = 10 * Math.pow(Math.E, -this.distanceFromCamera * .001);
    this.deltaY = 120000 / this.distanceFromCamera + SNOW_SPEED;
    //console.log(this.scale);
  }

  instantiate(game, camera) {
    this.game = game;
    this.camera = camera;
  }

  update() {
    this.functionX += this.game.clockTick;

    // simulates slower movement for further distances
    this.x = this.camera.x - (this.camera.x * 100 / this.distanceFromCamera);

    // snow movement
    this.x += Math.sin(this.functionX * SNOW_PERIOD_FACTOR) * this.scale * 10;
    this.y += this.deltaY * this.game.clockTick;


    // x moves slower than camera, so update how far image is drawn from x to "keep up" with camera.
    if (this.imageDistanceFromX + (2 * this.imageWidth * this.scale) + this.x < this.camera.x + this.camera.width) {
      this.imageDistanceFromX += this.imageWidth * this.scale;
    } else if (this.imageDistanceFromX + this.x > this.camera.x) {
      this.imageDistanceFromX -= this.imageWidth * this.scale;
    }

    if (this.y > this.camera.y) {
      this.y -= this.imageHeight * this.scale;
    }

  }

  draw() {
    //void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    this.ctx.drawImage(this.backgroundImage, 0, 0, this.imageWidth, this.imageHeight, 
                                            this.imageDistanceFromX + this.x - this.camera.x, 
                                            this.y - this.camera.y,
                                            this.imageWidth * this.scale,
                                            this.imageHeight * this.scale);

    this.ctx.drawImage(this.backgroundImage, 0, 0, this.imageWidth, this.imageHeight, 
                                            this.imageDistanceFromX + this.x + this.imageWidth * this.scale - this.camera.x, 
                                            this.y - this.camera.y,
                                            this.imageWidth * this.scale,
                                            this.imageHeight * this.scale);

    this.ctx.drawImage(this.backgroundImage, 0, 0, this.imageWidth, this.imageHeight, 
                                            this.imageDistanceFromX + this.x - this.camera.x, 
                                            this.y + this.imageHeight * this.scale - this.camera.y,
                                            this.imageWidth * this.scale,
                                            this.imageHeight * this.scale);

    this.ctx.drawImage(this.backgroundImage, 0, 0, this.imageWidth, this.imageHeight, 
                                            this.imageDistanceFromX + this.x + this.imageWidth * this.scale - this.camera.x, 
                                            this.y + this.imageHeight * this.scale - this.camera.y,
                                            this.imageWidth * this.scale,
                                            this.imageHeight * this.scale);

  }

}





class ParallaxGodLightBackground extends ParallaxScrollBackground {
  constructor(game, sceneManager, backgroundImage, distanceFromCamera) {
    super(game, sceneManager, backgroundImage, 1, distanceFromCamera, 0, 0);
    this.opacity = 0;
    this.timer = 0;
  }

  update() {
    super.update();
    this.timer += this.game.clockTick;
    this.opacity = (lc.MAX_GOD_LIGHT_OPACITY + .4) * (Math.sin(2 * this.timer * Math.PI / lc.GOD_LIGHT_INTERVAL) + 1) / 2 - .4;

  }

  draw() {
    var originalAlpha = this.ctx.globalAlpha;
    this.ctx.globalAlpha = this.opacity > 0? this.opacity : 0;
    super.draw();
    this.ctx.globalAlpha = originalAlpha;
  }
}





class ParallaxHoverHighwayBackground extends ParallaxScrollBackground {
  constructor(game, sceneManager, backgroundImage, distanceFromCamera, movingRight) {
    super(game, sceneManager, backgroundImage, 1, distanceFromCamera, 0, 0);
    this.movingRight = movingRight;
    this.timer = 0;
  }

  update() {
    super.update();
    this.timer += this.game.clockTick;
    if (this.movingRight) {
      this.x += this.timer * lc.HIGHWAY_SPEED * 100 / this.distanceFromCamera;
    } else {
      this.x -= this.timer * lc.HIGHWAY_SPEED * 100 / this.distanceFromCamera;
    }
    // x moves slower than camera, so update how far image is drawn from x to "keep up" with camera.
    while (this.imageDistanceFromX + (2 * this.imageWidth) + this.x < this.camera.x + this.camera.width) {
      this.imageDistanceFromX = this.imageDistanceFromX + this.imageWidth;
    }
    while (this.imageDistanceFromX + this.x > this.camera.x) {
      this.imageDistanceFromX = this.imageDistanceFromX - this.imageWidth;
    }

  }

  draw() {
    super.draw();
  }
}

class ParallaxBirdBackground extends Entity {
  constructor(game, scenemanager, spriteSheet, scale, clockwise, startX, distanceFromCamera) {
    super(game, scenemanager, 0, 0, 0);
    this.camera = scenemanager.camera;
    this.distanceFromCamera = distanceFromCamera;
    this.clockwise = clockwise;
    this.animation = new Animation(game.assetManager.getAsset(spriteSheet), 0, 0, 200, 200, .05, 5, true, false, scale);
    this.arcCenter = {x: 0, y: -1100};
    this.angle = Math.random() * Math.PI * 2;
    this.pathRadius = 1500;
    this.startX = startX;
  }

  update() {
    this.arcCenter.x = this.startX + this.camera.x - (this.camera.x * 100 / this.distanceFromCamera);
    if (this.clockwise) {
      this.angle += this.game.clockTick * .3;
    } else {
      this.angle -= this.game.clockTick * .3;
    }
    if (this.angle >= Math.PI * 2) {
      this.angle -= Math.PI * 2;
    }

    this.x = this.arcCenter.x + Math.cos(this.angle) * this.pathRadius;
    this.y = this.arcCenter.y + Math.sin(this.angle) * this.pathRadius;
  }

  draw() {
    if (this.camera.isInView(this, this.animation.frameWidth * this.animation.scale, this.animation.frameHeight * this.animation.scale)) { 
      this.animation.drawFrame(this.game.clockTick, this.game.ctx, this.x - this.camera.x, this.y - this.camera.y);
    }
  }
}
