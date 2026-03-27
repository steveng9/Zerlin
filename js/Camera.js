/*
Zerlin
TCSS 491 - Computational Worlds
Joshua Atherton, Michael Josten, Steven Golob
*/


const cc = Constants.CameraConstants;

class Camera {

  constructor(sceneManager, startX, startY, width, height) {
    this.sceneManager = sceneManager;
    this.x = startX;
    this.y = startY;
    this.width = width;
    this.height = height;
    // this.parallaxManager = new ParallaxBackgroundManager(game, this);
  }

  update() {
    if (this.sceneManager.Zerlin.x - cc.ZERLIN_POSITION_ON_SCREEN * this.width >= 0 &&
        this.sceneManager.Zerlin.x <= this.sceneManager.level.getLengthAtI(7)) {
      this.x = this.sceneManager.Zerlin.x - cc.ZERLIN_POSITION_ON_SCREEN * this.width;
    } else if (this.sceneManager.Zerlin.x - cc.ZERLIN_POSITION_ON_SCREEN * this.width < 0) {
      this.x = 0;
    // } else if (this.x > this.sceneManager.level.getLengthAtI(7)) {
    //   console.log("edge of screen: " + this.x);
    //   this.x = this.sceneManager.level.getLengthAtI(7);
    }
    
    
    //console.log(this.x);
    
  }

  draw() {

  }

  isInView(entity, width, height) { // TODO: verify sure things are not drawn when not in view
    return entity.x + width + cc.BUFFER > this.x &&
      entity.x - cc.BUFFER < this.x + this.width &&
      entity.y + height + cc.BUFFER > this.y &&
      entity.y - cc.BUFFER < this.y + this.height;
  }

}


// //add a method to change out the background images we are looping through
// /**
//  * Manage and animate backgrounds.
//  */
// class ParallaxBackgroundManager {

// 	constructor(game, camera) {
// 		this.game = game;
// 		this.camera = camera;
// 	 	this.parralaxBackgroundLayers = [];
// 	}

// 	addBackgroundLayer(background) {
// 		// background.game = this.game;
// 		this.parralaxBackgroundLayers.push(background);
// 	}

// 	setParallaxBackgrounds(backgroundArray) {
// 		this.parralaxBackgroundLayers = [];
// 		backgroundArray.forEach( item => {
// 			this.parralaxBackgroundLayers.push(item);
// 		});
// 	}

// 	update() {
// 		this.parralaxBackgroundLayers.forEach(layer => {
// 			layer.update();
// 		});
// 	}

// 	draw() {
// 		this.parralaxBackgroundLayers.forEach(layer => {
// 			layer.draw();
// 		});
// 	}
// }

// /*
//  * An individual image to be drawn with its follower.
//  */
// class ParallaxScrollBackground extends Entity {

// 	constructor(game, backgroundImage, scale, camera, distanceFromCamera) {
// 		super(game, 0, 0, 0, 0);
// 		this.scale = scale; // TODO: integrate scale of image
// 		this.backgroundImage = backgroundImage;
// 		this.imageWidth = backgroundImage.width;
// 		this.camera = camera;

// 		console.assert(this.imageWidth >= this.camera.width, "Image width must be larger than camera width!");
// 		console.assert(this.backgroundImage.height >= this.camera.height, "Image height must be larger than camera height!");
// 		this.distanceFromCamera = distanceFromCamera;

// 		this.ctx = game.ctx;
// 		this.imageDistanceFromX = 0;
// 	}

// 	update() {
// 		// simulates slower movement for further distances
// 		this.x = this.camera.x - (this.camera.x * 100 / this.distanceFromCamera);

// 		// x moves slower than camera, so update how far image is drawn from x to "keep up" with camera.
// 		if (this.imageDistanceFromX + (2 * this.imageWidth) + this.x < this.camera.x + this.camera.width) {
// 			this.imageDistanceFromX = this.imageDistanceFromX + this.imageWidth;
// 		}
// 		else if (this.imageDistanceFromX + this.x > this.camera.x) {
// 			this.imageDistanceFromX = this.imageDistanceFromX - this.imageWidth;
// 		}
// 	}

// 	draw() {
// 		this.ctx.drawImage(this.backgroundImage, this.imageDistanceFromX + this.x - this.camera.x, this.y);
// 		this.ctx.drawImage(this.backgroundImage, this.imageDistanceFromX + this.x + this.imageWidth - this.camera.x, this.y);
// 	}
// }


// class ParallaxRotatingBackground extends Entity {


// 	constructor(game, backgroundImage, scale, camera) {
// 		super(game, 0, 0, 0, 0);
// 		this.scale = scale; // TODO: integrate scale of image
// 		this.backgroundImage = backgroundImage;
// 		this.imageWidth = backgroundImage.width;
// 		this.imageHeight = backgroundImage.height;
// 		this.camera = camera;
// 		this.angle = 0;

// 		console.assert(this.imageWidth >= this.camera.width, "Image width must be larger than camera width!");
// 		console.assert(this.backgroundImage.height >= this.camera.height, "Image height must be larger than camera height!");

// 		this.ctx = game.ctx;
// 		this.imageDistanceFromX = 0;
// 	}

// 	update() {
// 		this.angle += this.game.clockTick * 2 * Math.PI / 200;
// 	}

// 	draw() {

// 		this.ctx.save();
// 		this.ctx.translate(this.camera.width / 2, this.camera.height / 2);
// 		this.ctx.rotate(this.angle);

// 		this.ctx.drawImage(this.backgroundImage,
// 						   0,
// 						   0,
// 						   this.imageWidth,
// 						   this.imageHeight,
// 						   -this.imageWidth / 2,
// 						   -this.imageHeight / 2,
// 						   this.imageWidth,
// 						   this.imageHeight);
// 		this.ctx.restore();
// 	}
// }



// class ParallaxAnimatedBackground extends Entity {

// }



// class ParallaxFloatingBackground extends ParallaxScrollBackground {

// 	constructor(game, backgroundImage, scale, camera, distanceFromCamera) {
// 		super(game, backgroundImage, scale, camera, distanceFromCamera);
// 		this.functionX = 0;
// 	}

// 	update() {
// 		super.update();
// 		this.functionX += this.game.clockTick;
// 		this.y = Math.sin(this.functionX) * 10;
// 	}

// 	draw() {
// 		super.draw();
// 	}
// }
