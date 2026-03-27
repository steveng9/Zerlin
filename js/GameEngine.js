/*
Zerlin
TCSS 491 - Computational Worlds
Joshua Atherton, Michael Josten, Steven Golob
*/

//PHI is now a global constant so dont need to call c.PHI, can just call PHI
var gec = Constants.GameEngineConstants;

// --- Saber sprite recoloring ---
// Converts a pixel (RGB) to HSL (all values 0-1)
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h, s, l];
}

function hslToRgb(h, s, l) {
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const hue2 = (t) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  return [Math.round(hue2(h + 1/3) * 255), Math.round(hue2(h) * 255), Math.round(hue2(h - 1/3) * 255)];
}

// Returns an offscreen canvas with green pixels hue-shifted by hueShift degrees.
// Skin tones (hue < 80°) are left untouched.
// Falls back to a canvas hue-rotate filter if getImageData is blocked (file:// CORS taint).
function recolorGreenPixels(img, hueShift) {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth || img.width;
  c.height = img.naturalHeight || img.height;
  const cx = c.getContext('2d');
  try {
    cx.drawImage(img, 0, 0);
    const id = cx.getImageData(0, 0, c.width, c.height), d = id.data;
    const shift = hueShift / 360;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 10) continue;
      const [h, s, l] = rgbToHsl(d[i], d[i + 1], d[i + 2]);
      if (s > 0.40 && h >= 90/360 && h <= 155/360) {
        const [r, g, b] = hslToRgb((h + shift) % 1, s, l);
        d[i] = r; d[i + 1] = g; d[i + 2] = b;
      }
    }
    cx.putImageData(id, 0, 0);
  } catch (e) {
    // file:// blocks getImageData — fall back to CSS filter on the offscreen canvas
    cx.filter = 'hue-rotate(' + hueShift + 'deg)';
    cx.drawImage(img, 0, 0);
  }
  return c;
}

function hueLabel(deg) {
  if (deg === 0)   return 'Green (original)';
  if (deg < 60)    return 'Cyan-green';
  if (deg < 100)   return 'Cyan';
  if (deg < 150)   return 'Blue';
  if (deg < 200)   return 'Indigo';
  if (deg < 240)   return 'Purple';
  if (deg < 290)   return 'Magenta';
  if (deg < 330)   return 'Red';
  return 'Orange';
}

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
    this.saberSpriteCache = new WeakMap(); // img → Map(hueShift → canvas)
  }

  // Returns a cached recolored canvas for img at the current saberHue.
  // If saberHue is 0 (original green), returns img unchanged.
  getRecoloredSprite(img) {
    if (!img || this.saberHue === 0) return img;
    if (!this.saberSpriteCache.has(img)) this.saberSpriteCache.set(img, new Map());
    const hueMap = this.saberSpriteCache.get(img);
    if (!hueMap.has(this.saberHue)) hueMap.set(this.saberHue, recolorGreenPixels(img, this.saberHue));
    return hueMap.get(this.saberHue);
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

    var infiniteHealthButton = document.getElementById("infiniteHealth");
    infiniteHealthButton.addEventListener('click', () => {
      this.sceneManager.toggleInfiniteHealth();
      var on = this.sceneManager.infiniteHealth;
      infiniteHealthButton.value = on ? "Infinite Health: ON" : "Infinite Health: OFF";
      infiniteHealthButton.style.background = on ? "#cc3300" : "";
      infiniteHealthButton.style.color = on ? "#ffffff" : "";
    });

    var trainingGroundButton = document.getElementById("trainingGroundButton");
    trainingGroundButton.addEventListener('click', () => {
      this.sceneManager.startTrainingGroundScene();
    });

    var campaignButton = document.getElementById("campaignButton");
    campaignButton.addEventListener('click', () => {
      this.sceneManager.levelNumber = 1;
      this.sceneManager.newLevel = true;
      this.sceneManager.startOpeningScene();
    });

    var laserSlider = document.getElementById("laserSpeedSlider");
    laserSlider.addEventListener('input', () => {
      var mult = parseFloat(laserSlider.value);
      document.getElementById("laserSpeedVal").textContent = mult.toFixed(1) + "\u00d7";
      this.sceneManager.setTrainingLaserSpeed(mult);
    });

    var droidSlider = document.getElementById("droidCountSlider");
    droidSlider.addEventListener('input', () => {
      var count = parseInt(droidSlider.value);
      document.getElementById("droidCountVal").textContent = count;
      this.sceneManager.trainingTargetDroids = count;
    });

    this.saberHue = 120; // degrees of hue-rotate; 0 = original green, 120 = blue
    var saberHueSlider = document.getElementById("saberHueSlider");
    saberHueSlider.addEventListener('input', () => {
      this.saberHue = parseInt(saberHueSlider.value);
      document.getElementById("saberHueVal").textContent = hueLabel(this.saberHue);
    });
    saberHueSlider.value = this.saberHue;
    document.getElementById("saberHueVal").textContent = hueLabel(this.saberHue);

    this.lightningHue = 240; // hue of lightning color; 240 = blue (default)
    var lightningHueSlider = document.getElementById("lightningHueSlider");
    lightningHueSlider.addEventListener('input', () => {
      this.lightningHue = parseInt(lightningHueSlider.value);
      document.getElementById("lightningHueVal").textContent = hueLabel(this.lightningHue);
    });
    lightningHueSlider.value = this.lightningHue;
    document.getElementById("lightningHueVal").textContent = hueLabel(this.lightningHue);

    document.querySelectorAll('input[name="trainingBg"]').forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.checked) {
          this.sceneManager.setTrainingBackground(parseInt(radio.value));
        }
      });
    });
    // Sync slider UI to the initial SceneManager state (driven by constants)
    laserSlider.value = this.sceneManager.trainingLaserMult;
    document.getElementById("laserSpeedVal").textContent = this.sceneManager.trainingLaserMult.toFixed(1) + "\u00d7";
    droidSlider.value = this.sceneManager.trainingTargetDroids;
    document.getElementById("droidCountVal").textContent = this.sceneManager.trainingTargetDroids;

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
