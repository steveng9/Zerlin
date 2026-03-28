/*
Zerlin
TCSS 491 - Computational Worlds
Joshua Atherton, Michael Josten, Steven Golob
*/

/*
 * This File will contain a status bar.
 * the status bars currently will be health and force
 */


const sbc = Constants.StatusBarConstants;

/*
 * all status bars will extend from this class.
 * Status bars dont move from their position on the canvas.
 * The status bar will be in the game engine update loop and will track
 * numbers specified in each child status bar.
 *
 * each status bar needs to be able to display numbers if needed of the
 * current number / the max of that number.
 *
 * draw the background lighter bar the full length of the bar, this bar does not change.
 * draw a darker foreground on top of the lighter bar, this bar length is
 * equal to (maxLength / maxSize) / currentSize
 */
class AbstractStatusBar extends Entity {
  constructor(game, sceneManager, x, y, hasCriticalState) {
    super(game, x, y, 0, 0);
    this.sceneManager = sceneManager;
    this.displayText = sbc.STATUS_BAR_DISPLAY_TEXT;
    this.hasCriticalState = hasCriticalState; //does the bar flash when it gets low.
    this.maxSize = 0; //the numeric size of the status bar.
    //the length of the status bar is a quarter of the canvas.
    this.maxLength = this.game.surfaceWidth * sbc.STATUS_BAR_LENGTH;
    //current value of the status bar
    this.current = this.maxSize;
    //default to white, alpha is between 1 (opaque) to 0 (transparent)
    this.backgroundColor = 'rgba(255, 255, 255, 1)';
    //default to gray
    this.foregroundColor = 'rgba(126, 126, 126, 1)';
    //the color when the bar is in critical condition
    this.criticalBackgroundColor = 'rgba(255, 255, 255, 1)';
    this.criticalForegroundColor = 'rgba(126, 126, 126, 1)';
    this.borderColor = 'rgba(0, 0, 0, 1)';
    this.flashCritical = false; //toggle boolean
    this.secondsBeforeFlash = sbc.STATUS_BAR_CRITICAL_FLASH_INTERVAL;

    this.image = null;


  }

  update() {
    super.update();
    this.setCurrent();
    this.setMaxSize();

    //flash critical color
    this.secondsBeforeFlash -= this.game.clockTick;
    //toggle flash critical state every time interval
    if (this.secondsBeforeFlash <= 0) {
      this.secondsBeforeFlash = sbc.STATUS_BAR_CRITICAL_FLASH_INTERVAL;
      if (this.flashCritical)
        this.flashCritical = false;
      else
        this.flashCritical = true;
    }
  }

  draw() {
    super.draw();
    var ctx = this.game.ctx;

    if (!this.hidden) { //if not hidden
      var colorForeground = this.foregroundColor;
      if (this instanceof HealthStatusBar && this.game.sceneManager.Zerlin.poisoned) {
        colorForeground = 'rgba(107,142,35)';
      }
      var colorBackground = this.backgroundColor;
      if (this.hasCriticalState && this.current <= sbc.STATUS_BAR_CRITICAL_AMOUNT * this.maxSize) {
        //paint the critical state
        if (this.flashCritical) {
          colorForeground = this.foregroundColor;
          colorBackground = this.criticalBackgroundColor;
        }

      }
      ctx.save();
      ctx.shadowBlur = 5;
      ctx.shadowColor = 'black';




      //draw the border of the status bars
      ctx.lineWidth = sbc.STATUS_BAR_WIDTH + 5;
      ctx.strokeStyle = this.borderColor;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + this.maxLength, this.y);
      ctx.stroke();
      ctx.closePath();


      //draw the background status bar

      ctx.lineWidth = sbc.STATUS_BAR_WIDTH;
      ctx.strokeStyle = colorBackground;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + this.maxLength, this.y);
      ctx.stroke();
      ctx.closePath();

      if (this.current > 0) {
        //draw the foreground status bar over the background status bar
        //ctx.strokeStyle = colorForeground;
        ctx.strokeStyle = colorForeground;
        //ctx.lineCap = butt;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + ((this.maxLength / this.maxSize) * this.current), this.y);
        ctx.stroke();
        ctx.closePath();

      }
      //draw the text of the status bar current/maxSize
      if (this.displayText) {
        ctx.fillText(`${this.current} / ${this.maxSize}`, this.x + this.maxLength / 2,
          this.y + sbc.STATUS_BAR_WIDTH * 0.20);
      }

      ctx.restore();
    }

  }

  /*
   * This method will be overwritten by the child classes and will set the current value
   * of the status bar every update. for example, a status bar could set the current value to
   * an entities health.
   */
  setCurrent() {
    throw new Error("AbstractStatusBar can't be instantiated");
  }

  //set the max size of the status bar, allows dynamic changing of the max size of the bar
  setMaxSize() {
    throw new Error("AbstractStatusBar can't be instantiated");
  }
  setHidden(hidden) {
    this.hidden = hidden;
  }
}


/*
 * This class is the health status bar.
 * This bar will keep track of zerlins health and display it for the
 * player to see the a visual representation of the current health.
 */
class HealthStatusBar extends AbstractStatusBar {
  constructor(game, sceneManager, x, y) {
    super(game, sceneManager, x, y, sbc.HEALTH_BAR_HAS_CRITICAL_STATE);
    this.foregroundColor = "rgba(255, 0, 0, 1)"; //red
    this.hidden = false;
    this.backgroundColor = "rgba(255, 126, 126, 1)"; //light red
    //critical colors
    this.criticalForegroundColor = 'rgba(255, 128, 0, 1)'; //orange
    this.criticalBackgroundColor = 'rgba(255, 165, 70, 1)'; //light orange

    this.maxSize = this.sceneManager.Zerlin.maxHealth;
    this.current = this.sceneManager.Zerlin.currentHealth;

    this.foregroundColor = this.game.ctx.createLinearGradient(
      this.x, this.y, this.x + this.maxLength, this.y);
    this.foregroundColor.addColorStop(0, 'rgb(165, 0, 0)');
    this.foregroundColor.addColorStop(0.5, 'rgb(221, 0, 0)');
    this.foregroundColor.addColorStop(1, 'rgb(255, 55, 55)');
  }
  /* method that will check the current health of zerlin then draw the status bar
   * with the new current health */
  setCurrent() {
    this.current = this.sceneManager.Zerlin.currentHealth;
  }
  setMaxSize() {
    this.maxSize = this.sceneManager.Zerlin.maxHealth;
  }
}

/*
 * This class is the force status bar
 * this bar will keep track of the amount of force power zerlin has and
 * will display a visual representation of the current amount of force power
 * for the player to see.
 */
class ForceStatusBar extends AbstractStatusBar {
  constructor(game, sceneManager, x, y) {
    super(game, sceneManager, x, y, sbc.FORCE_BAR_HAS_CRITICAL_STATE);
    this.foregroundColor = "rgba(0, 0, 255, 1)"; //blue
    this.hidden = false;
    this.backgroundColor = "rgba(126, 126, 255, 1)"; //light blue
    this.maxSize = this.sceneManager.Zerlin.maxForce;
    this.current = this.sceneManager.Zerlin.currentForce;

    this.foregroundColor = this.game.ctx.createLinearGradient(
      this.x, this.y, this.x + this.maxLength, this.y);
    this.foregroundColor.addColorStop(0, 'rgb(0, 0, 165)');
    this.foregroundColor.addColorStop(0.5, 'rgb(0, 0, 255)');
    this.foregroundColor.addColorStop(1, 'rgb(55, 55, 255)');
  }

  /*
   * This method will be used to check the current force power of zerlin
   *
   */
  setCurrent() {
    this.current = this.sceneManager.Zerlin.currentForce;
  }
  setMaxSize() {
    this.maxSize = this.sceneManager.Zerlin.maxForce;
  }
}

// ── Player 2 status bars ──────────────────────────────────────────────────────
class HealthStatusBarP2 extends HealthStatusBar {
  setCurrent() { this.current = this.sceneManager.Zerlin2.currentHealth; }
  setMaxSize() { this.maxSize = this.sceneManager.Zerlin2.maxHealth; }
}

class ForceStatusBarP2 extends ForceStatusBar {
  setCurrent() { this.current = this.sceneManager.Zerlin2.currentForce; }
  setMaxSize() { this.maxSize = this.sceneManager.Zerlin2.maxForce; }
}

class BossHealthStatusBar extends AbstractStatusBar {
  constructor(game, x, y, boss) {
    super(game, game.sceneManager, x, y, sbc.BOSS_BAR_HAS_CRITICAL_STATE);
    this.hidden = false;
    // console.log(x);
    // console.log(y);
    this.boss = boss;
    this.maxLength = this.game.surfaceWidth * sbc.BOSS_BAR_LENGTH;

    this.backgroundColor = 'rgb(92, 92, 92)';
    //Sthis.foregroundColor = 'rgb(196, 187, 26)';

    this.foregroundColor = this.game.ctx.createLinearGradient(
      this.x, this.y, this.x + this.maxLength, this.y);
    this.foregroundColor.addColorStop(0, 'rgb(196, 187, 26)');
    this.foregroundColor.addColorStop(0.5, 'rgb(213, 203, 28)');
    this.foregroundColor.addColorStop(1, 'rgb(231, 222, 65)');

    this.maxSize = this.boss.maxHealth;
    this.current = this.boss.currentHealth;

    this.image = this.game.assetManager.getAsset("img/enemies/boss_helmet.png");
  }

  setCurrent() {
    this.current = this.boss.currentHealth;
  }
  setMaxSize() {
    this.maxSize = this.boss.maxHealth;
  }
  draw() {
    super.draw();
    //draw helmet image to the left of the status bar
    if (this.image) {
      this.game.ctx.drawImage(this.image, this.x - 65, this.y - 30,
        50, 50);
    }
  }
}

class DroidBossHealthStatusBar extends AbstractStatusBar {
  constructor(game, x, y, boss) {
    super(game, game.sceneManager, x, y, sbc.BOSS_BAR_HAS_CRITICAL_STATE);
    this.hidden = false;
    // console.log(x);
    // console.log(y);
    this.boss = boss;
    this.maxLength = this.game.surfaceWidth * sbc.BOSS_BAR_LENGTH;

    this.backgroundColor = 'rgb(92, 92, 92)';
    //Sthis.foregroundColor = 'rgb(196, 187, 26)';

    this.foregroundColor = this.game.ctx.createLinearGradient(
      this.x, this.y, this.x + this.maxLength, this.y);
    this.foregroundColor.addColorStop(0, 'rgb(196, 187, 26)');
    this.foregroundColor.addColorStop(0.5, 'rgb(213, 203, 28)');
    this.foregroundColor.addColorStop(1, 'rgb(231, 222, 65)');

    this.maxSize = this.boss.maxHealth;
    this.current = this.boss.currentHealth;

    this.image = this.game.assetManager.getAsset("img/enemies/boss_status_bar_icon.png");
  }

  setCurrent() {
    this.current = this.boss.currentHealth;
  }
  setMaxSize() {
    this.maxSize = this.boss.maxHealth;
  }
  draw() {
    super.draw();
    //draw helmet image to the left of the status bar
    if (this.image) {
      this.game.ctx.drawImage(this.image, this.x - 65, this.y - 30,
        50, 50);
    }
  }
}

/*
* Powerups status bar, will call powerup deactivate when
* In order to use properly, powerup needs to have the time field which holds the max powerup time.
*/

class PowerupStatusBar extends Entity {
  constructor(game, sceneManager, x, y, powerup) {
    super(game, x, y);
    this.sceneManager = sceneManager;
    this.powerup = powerup; //powerup to call deactivate on

    this.maxPowerupTime = this.powerup.time;
    this.currentPowerupTime = this.powerup.time;

    this.powerup.animation.scale = powerup.smallScale;
    this.y = sbc.POWERUP_Y;

    this.color = 'rgb(57, 255, 20)';
  }
  update(i) {
    super.update();
    this.currentPowerupTime -= this.game.clockTick;
    if (this.currentPowerupTime <= 0) {
      this.removeFromWorld = true;
    }
    this.x = sbc.POWERUP_START_X + (i * sbc.POWERUP_PAD_X);

  }
  draw() {
    super.draw();
    var animation = this.powerup.animation;
    var ctx = this.game.ctx;
    if (animation != null) {
      ctx.save();

      ctx.lineWidth = 4;
      ctx.strokeStyle = this.color;
      ctx.lineCap = "round";
      if (this.currentPowerupTime > 0) {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y+sbc.POWERUP_BAR_Y);
        ctx.lineTo(this.x + ((sbc.POWERUP_LENGTH / this.maxPowerupTime) * this.currentPowerupTime),
            this.y + sbc.POWERUP_BAR_Y);
        ctx.stroke();
        ctx.closePath();
      }
      ctx.restore();
      animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
  }
  reset() {
    this.currentPowerupTime = this.maxPowerupTime;
  }
  getPowerup() {
    return this.powerup;
  }
}
