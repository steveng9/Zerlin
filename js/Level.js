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
    this.surfaceColor = tileImages.surfaceColor || { r: 80, g: 80, b: 90 };
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

  /**
   * Draw soft drop shadows on platform surfaces beneath each player and droid.
   * Call this after level.draw() and before entity draws so shadows appear
   * on top of tiles but under characters.
   * @param {Zerlin[]} players
   * @param {AbstractDroid[]} droids
   */
  drawEntityShadows(players, droids) {
    var vanishY   = this.game.surfaceHeight / 2;
    var ryScale   = lc.SHADOW_RY_SCALE;

    for (var z of players) {
      if (!z.alive) continue;
      var zTile = z.tile ? z.tile : this._findTileBelow(z.x, z.y);
      if (!zTile) continue;
      var dist = zTile.y - z.y;
      var alpha = dist < 0 ? 0.45 : Math.max(0, 0.45 * (1 - dist / 200));
      if (alpha > 0.02) {
        var ry = Math.max(0.5, Math.abs(zTile.y - vanishY) * ryScale);
        this._drawEntityShadow(z.x - this.camera.x, zTile.y, 28, ry, alpha);
      }
    }

    for (var droid of droids) {
      if (!droid.animation) continue;
      var dw = droid.animation.frameWidth  * droid.animation.scale;
      var dh = droid.animation.frameHeight * droid.animation.scale;
      var dCx = droid.x + dw / 2;
      var dBottom = droid.y + dh;
      var dTile = this._findTileBelow(dCx, dBottom);
      if (!dTile) continue;
      var ddist = dTile.y - dBottom;
      var dalpha = Math.max(0, 0.3 * (1 - ddist / 200));
      if (dalpha > 0.02) {
        var dry = Math.max(0.5, Math.abs(dTile.y - vanishY) * ryScale);
        this._drawEntityShadow(dCx - this.camera.x, dTile.y, 22, dry, dalpha);
      }
    }
  }

  _drawEntityShadow(screenX, tileWorldY, rx, ry, alpha) {
    var ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = alpha;
    var grad = ctx.createRadialGradient(screenX, tileWorldY, 0, screenX, tileWorldY, rx);
    grad.addColorStop(0, 'rgba(0,0,0,0.8)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(screenX, tileWorldY, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  _findTileBelow(worldX, worldY) {
    var best = null;
    for (var tile of this.tiles) {
      if (worldX >= tile.x && worldX <= tile.x + tile.width && tile.y >= worldY - 100) {
        if (!best || tile.y < best.y) best = tile;
      }
    }
    return best;
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
    this._surfaceColor = level.surfaceColor;

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
    var screenX = this.x - this.camera.x;
    var isFloor = this.rowIndex !== undefined && (this.rowIndex === this.totalRows - 1);

    if (isFloor) {
      this._drawFloorSurface(screenX);
      // Floor front face is hidden below camera sightline — no tile image drawn.
    } else {
      // Top surface strip drawn first, behind the front face.
      if (this.rowIndex !== undefined) {
        this._drawTopStrip(screenX);
      }
      // Front face (facade): tile image drawn on top of the strip.
      this.ctx.drawImage(this.tileImage, screenX, this.y);
    }

    if (lc.DRAW_BOXES) {
      this.ctx.strokeStyle = "black";
      this.ctx.strokeRect(this.boundingBox.x - this.camera.x, this.boundingBox.y, this.boundingBox.width, this.boundingBox.height);
    }
  }

  // Sample the average colour of a tile image, ignoring transparent pixels.
  _sampleTileColor(image) {
    try {
      var sz = 16;
      var oc = document.createElement('canvas');
      oc.width = sz; oc.height = sz;
      var octx = oc.getContext('2d');
      octx.drawImage(image, 0, 0, sz, sz);
      var d = octx.getImageData(0, 0, sz, sz).data;
      var r = 0, g = 0, b = 0, count = 0;
      for (var i = 0; i < d.length; i += 4) {
        if (d[i + 3] > 128) { // opaque pixels only
          r += d[i]; g += d[i + 1]; b += d[i + 2];
          count++;
        }
      }
      if (count === 0) return { r: 55, g: 55, b: 65 };
      return { r: Math.round(r / count), g: Math.round(g / count), b: Math.round(b / count) };
    } catch (e) {
      return { r: 55, g: 55, b: 65 };
    }
  }

  // Draw the thin top-surface parallelogram on non-floor tiles.
  // The strip's front edge is at the tile's top (tileTopY) and its back edge
  // converges toward the canvas vertical centre (vanishY).  Strip depth scales
  // with distance from vanishY so the same real depth reads consistently at
  // every height.  The back edge gets a horizontal parallax shift to reinforce
  // the sense of Z-depth.
  _drawTopStrip(screenX) {
    var vanishY = this.game.surfaceHeight / 2;
    var tileTopY = this.y;
    // Signed distance: positive = tile below vanishY (camera looks down).
    //                  negative = tile above vanishY (camera looks up).
    var distFromVanish = tileTopY - vanishY;
    if (Math.abs(distFromVanish) < 2) return;

    var df = lc.TILE_DEPTH_FACTOR;

    // Vertical: back edge converges toward vanishY (signed — correct direction
    // for both above- and below-centre tiles).
    var frontEdgeY = tileTopY;
    var backEdgeY  = tileTopY - distFromVanish * df;

    // Horizontal: distance-based 1-point perspective referenced to screen centre.
    // Neutral lean (backEdge == frontEdge) when tile is at screen centre, not level start.
    // df = (1 - 100/D) gives the same rate as the parallax layer system.
    var dfH = 1 - 100 / lc.TILE_SURFACE_DIST;
    var screenCenterX = this.camera.width / 2;
    var left  = screenX;
    var right = screenX + this.width;
    var backLeft  = left  + (screenCenterX - left)  * dfH;
    var backRight = right + (screenCenterX - right) * dfH;

    var topY   = Math.min(frontEdgeY, backEdgeY);
    var botY   = Math.max(frontEdgeY, backEdgeY);
    var stripH = botY - topY;
    if (stripH < 1) return;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(left,      frontEdgeY);
    this.ctx.lineTo(right,     frontEdgeY);
    this.ctx.lineTo(backRight, backEdgeY);
    this.ctx.lineTo(backLeft,  backEdgeY);
    this.ctx.closePath();
    this.ctx.clip();

    // Fully opaque gradient — createLinearGradient direction auto-handles
    // both strip orientations (above/below centre tile).
    var c = this._surfaceColor;
    var frontStop = `rgb(${Math.round(c.r*0.85)},${Math.round(c.g*0.85)},${Math.round(c.b*0.85)})`;
    var backStop  = `rgb(${Math.round(c.r*0.48)},${Math.round(c.g*0.48)},${Math.round(c.b*0.48)})`;
    var grad = this.ctx.createLinearGradient(0, backEdgeY, 0, frontEdgeY);
    grad.addColorStop(0, backStop);
    grad.addColorStop(1, frontStop);
    this.ctx.fillStyle = grad;
    var fillLeft = Math.min(left, backLeft) - 1;
    var fillW    = Math.max(right, backRight) - fillLeft + 2;
    this.ctx.fillRect(fillLeft, topY, fillW, stripH);

    this.ctx.restore();
  }

  // Draw the floor's top surface — a large parallelogram that extends into
  // the foreground (down the screen) and a small amount behind the tile's
  // top edge (upward).  The gradient is derived from the tile's average colour.
  _drawFloorSurface(screenX) {
    var backEdgeY  = this.y - lc.FLOOR_BACK_OVERSHOOT;
    var frontEdgeY = this.game.surfaceHeight + 120;

    // Distance-based 1-point perspective referenced to screen centre — same fix
    // as _drawTopStrip.  df = (1 - 100/D): positive for D>100 (converges toward
    // centre), negative for D<100 (diverges away from centre, i.e. foreground).
    var dfBack  = 1 - 100 / lc.FLOOR_BACK_DIST;
    var dfFront = 1 - 100 / lc.FLOOR_FRONT_DIST;
    var screenCenterX = this.camera.width / 2;

    var left  = screenX;
    var right = screenX + this.width;
    var backLeft   = left  + (screenCenterX - left)  * dfBack;
    var backRight  = right + (screenCenterX - right) * dfBack;
    var frontLeft  = left  + (screenCenterX - left)  * dfFront;
    var frontRight = right + (screenCenterX - right) * dfFront;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(backLeft,   backEdgeY);
    this.ctx.lineTo(backRight,  backEdgeY);
    this.ctx.lineTo(frontRight, frontEdgeY);
    this.ctx.lineTo(frontLeft,  frontEdgeY);
    this.ctx.closePath();
    this.ctx.clip();

    var c = this._surfaceColor;
    var r = c.r, g = c.g, b = c.b;
    var grad = this.ctx.createLinearGradient(0, backEdgeY, 0, frontEdgeY);
    grad.addColorStop(0,    `rgb(${Math.round(r*0.88)},${Math.round(g*0.88)},${Math.round(b*0.88)})`);
    grad.addColorStop(0.25, `rgb(${Math.round(r*0.55)},${Math.round(g*0.55)},${Math.round(b*0.55)})`);
    grad.addColorStop(1,    `rgb(6,7,10)`);
    this.ctx.fillStyle = grad;

    var fillLeft = Math.min(backLeft, frontLeft) - 1;
    var fillW    = Math.max(backRight, frontRight) - fillLeft + 2;
    this.ctx.fillRect(fillLeft, backEdgeY, fillW, frontEdgeY - backEdgeY);

    this.ctx.restore();
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
