/*
Zerlin
TCSS 491 - Computational Worlds
Joshua Atherton, Michael Josten, Steven Golob
*/

//PHI is now a global constant so dont need to call c.PHI, can just call PHI
var gec = Constants.GameEngineConstants;

window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function( /* function */ callback, /* DOMElement */ element) {
      window.setTimeout(callback, 1000 / 60);
    };
})();

class GameEngine {

  constructor(assetManager) {
    this.assetManager = assetManager;
    this.ctx = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
    this.mouse = {
      x: 100,
      y: 100
    };
    this.click = null;
    this.keys = {};    
  }

  init(ctx) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.timer = new Timer(this);
    this.sceneManager = new SceneManager2(this);
    this.audio = new SoundEngine(this);
    this.startInput();
    this.sceneManager.init();

    var godModeButton = document.getElementById("godMode");
    godModeButton.addEventListener('click', event => {
      this.sceneManager.toggleGodMode();
    });
    console.log('game initialized');
  }

  start() { //todo: don't start the game until user clicks on canvas
    console.log("starting game");
    this.audio.backgroundMusic.play();
    var that = this;
    (function gameLoop() {
      that.loop();
      requestAnimationFrame(gameLoop);
    })();
  }

  loop() {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
  }

  update() {
    // if (!this.paused) {
    this.sceneManager.update();
    this.click = null;
    this.keys['Enter'] = false;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.surfaceWidth, this.surfaceHeight);
    this.ctx.save();
    this.sceneManager.draw();

    this.ctx.restore();
  }



  startInput() {
    console.log('Starting input');
    var that = this;

    var getXandY = e => {
      var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
      var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;
      return {
        x: x,
        y: y
      };
    }

    this.ctx.canvas.addEventListener("keydown", (e) => {
      e.preventDefault();
      if (that.keys[e.code]) {
        return;
      } // prevent repeating calls when key is held down
      if (e.code === Constants.KeyConstants.PAUSE) {
        if (that.sceneManager.paused) {
          that.sceneManager.unpause();
        } else {
          that.sceneManager.pause();
        }
      }
      that.keys[e.code] = true;
    }, false);

    this.ctx.canvas.addEventListener("keyup", function(e) {
      that.keys[e.code] = false;
      e.preventDefault();
    }, false);


    // Mouse
    this.ctx.canvas.addEventListener("click", function(e) {
      that.click = getXandY(e);
    }, false);

    this.ctx.canvas.addEventListener("contextmenu", function(e) {
      e.preventDefault();
    }, false);

    this.ctx.canvas.addEventListener("mousemove", function(e) {
      that.mouse = getXandY(e);
      //console.log(e);
    }, false);

    this.ctx.canvas.addEventListener("mousedown", function(e) {
      if (e.button === 2) { // right click
        that.rightClickDown = true; // change to inside that.keys['rightClick']
        // that.keys['rightClick'] = true;
      } else if (e.button === 0) { // left click
        that.keys['leftClick'] = true;
      }
    }, false);

    this.ctx.canvas.addEventListener("mouseup", function(e) {
      if (e.button === 2) { // right click
        that.rightClickDown = false;
      } else if (e.button === 0) {
        that.keys['leftClick'] = false;
      }
    }, false);

    console.log('Input started');
  }

}

class Timer {
  constructor() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
    this.disabled = false;
  }
  tick() {
    if (this.disabled) {
      return 0;
    }
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;
    var gameDelta = Math.min(wallDelta, this.maxStep); // TODO: are these 3  lines okay?
    this.gameTime += gameDelta;
    return gameDelta;
  }
  disable() {
    this.disabled = true;
  }
  enable() {
    this.disabled = false;
  }
}



class Entity {
  constructor(game, x, y, deltaX, deltaY) {
    this.game = game;
    this.sceneManager = this.game.sceneManager;
    this.x = x;
    this.y = y;
    this.removeFromWorld = false;
    // Entity's velocity
    this.deltaX = deltaX;
    this.deltaY = deltaY;
  }
  update() {

  }
  draw() {

  }
  rotateAndCache(image, angle) {
    var offscreenCanvas = document.createElement('canvas');
    var size = Math.max(image.width, image.height);
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    var offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
    offscreenCtx.translate(size / 2, size / 2);
    offscreenCtx.rotate(angle);
    offscreenCtx.translate(0, 0);
    offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
    offscreenCtx.restore();
    //offscreenCtx.strokeStyle = "red";
    //offscreenCtx.strokeRect(0,0,size,size);
    return offscreenCanvas;
  }
  scaleAndCache(image, scale) {

  }
  outsideScreen() {
    return (this.x < 0 ||
      this.x > this.game.surfaceWidth ||
      this.y < 0 ||
      this.y > this.game.surfaceHeight);

  }

}
