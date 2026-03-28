/*
Zerlin
TCSS 491 - Computational Worlds
Joshua Atherton, Michael Josten, Steven Golob
*/

/**
 * Manage all assets for this game.
 */
class AssetManager {
  constructor() {
    this.successCount = 0;
    this.errorCount = 0;
    this.cache = [];
    this.downloadQueue = [];
  }
  queueDownload(path) {
    // console.log("Queueing " + path);
    this.downloadQueue.push(path);
  }
  isDone() {
    return this.downloadQueue.length === this.successCount + this.errorCount;
  }
  downloadAll(callback) {
    for (var i = 0; i < this.downloadQueue.length; i++) {
      (function(that, path) {
        var img = new Image();
        img.addEventListener("load", function() {
          that.successCount++;
          if (that.isDone()) callback();
        });
        img.addEventListener("error", function() {
          console.log("Error loading " + path);
          that.errorCount++;
          if (that.isDone()) callback();
        });
        // Load as blob then convert to data-URL so canvas.getImageData is never
        // blocked by the browser's cross-origin taint rule (affects file:// protocol).
        var xhr = new XMLHttpRequest();
        xhr.open('GET', path, true);
        xhr.responseType = 'blob';
        xhr.onload = function() {
          if (this.status === 200 || this.status === 0) { // status 0 = file://
            var reader = new FileReader();
            reader.onloadend = function() { img.src = reader.result; };
            reader.readAsDataURL(xhr.response);
          } else {
            img.src = path; // fallback
          }
        };
        xhr.onerror = function() { img.src = path; };
        xhr.send();
        that.cache[path] = img;
      })(this, this.downloadQueue[i]);
    }
  }
  getAsset(path) {
    return this.cache[path];
  }
}

/**
 * Driver function to load all assets for the game and launch
 * the game after completion.
 */
(function() {
  var AM = new AssetManager();

  /********** Zerlin assets ******************/
  AM.queueDownload("img/hero/Zerlin bobbing walking.png");
  AM.queueDownload("img/hero/Zerlin left bobbing walking.png");
  AM.queueDownload("img/hero/Zerlin backwards bobbing walking.png");
  AM.queueDownload("img/hero/Zerlin left backwards bobbing walking.png");
  AM.queueDownload("img/hero/Zerlin standing.png");
  AM.queueDownload("img/hero/Zerlin standing left.png");
  AM.queueDownload("img/hero/Zerlin somersault.png");
  AM.queueDownload("img/hero/Zerlin left somersault.png");
  AM.queueDownload("img/hero/Zerlin falling up.png");
  AM.queueDownload("img/hero/Zerlin falling down.png");
  AM.queueDownload("img/hero/Zerlin falling up left.png");
  AM.queueDownload("img/hero/Zerlin falling down left.png");
  AM.queueDownload("img/hero/Zerlin slash.png");
  AM.queueDownload("img/hero/Zerlin slash left.png");
  AM.queueDownload("img/hero/Zerlin crouch.png");
  AM.queueDownload("img/hero/Zerlin crouch left.png");
  AM.queueDownload("img/hero/Zerlin death.png");
  AM.queueDownload("img/hero/zerlin at fire.png");
  AM.queueDownload("img/effects/ship take off.png");
  AM.queueDownload("img/hero/saber up.png");
  AM.queueDownload("img/hero/saber up left.png");
  AM.queueDownload("img/hero/saber down.png");
  AM.queueDownload("img/hero/saber down left.png");
  AM.queueDownload("img/hero/throwing arm.png");
  AM.queueDownload("img/hero/throwing arm left.png");
  AM.queueDownload("img/hero/airborn saber.png");



  /********** Boss assets ******************/
  AM.queueDownload("img/enemies/boss flying.png");
  AM.queueDownload("img/enemies/boss flying left.png");
  AM.queueDownload("img/enemies/boss falling.png");
  AM.queueDownload("img/enemies/boss falling left.png");
  AM.queueDownload("img/enemies/beam cannon.png");
  AM.queueDownload("img/enemies/beam cannon left.png");
  AM.queueDownload("img/enemies/boss_helmet.png");
  AM.queueDownload("img/enemies/bomb.png");

  // Droid boss
  AM.queueDownload("img/enemies/leggy_droid.png");
  AM.queueDownload("img/enemies/boss_status_bar_icon.png");
  AM.queueDownload("img/enemies/explosion_josh.png");


  /********** Powerup assets ******************/
  AM.queueDownload('img/ui/powerup_health.png');
  AM.queueDownload('img/ui/powerup_force.png');
  AM.queueDownload('img/ui/powerup_invincibility.png');
  AM.queueDownload('img/ui/powerup_coin.png');
  AM.queueDownload('img/ui/powerup_coin_T.png');
  AM.queueDownload('img/ui/powerup_laser.png');
  AM.queueDownload('img/ui/checkpoint.png');


  /********** Droid assets ******************/
  AM.queueDownload("img/enemies/droid-j-row.png");
  AM.queueDownload("img/enemies/Droid 1.png");
  AM.queueDownload("img/enemies/Droid 2.png");
  AM.queueDownload("img/enemies/Droid 3.png");
  AM.queueDownload("img/enemies/Droid 4.png");
  AM.queueDownload("img/enemies/Droid 5.png");
  AM.queueDownload("img/enemies/basic_droid.png");


  /********** VisualFX assets ******************/
  AM.queueDownload("img/enemies/Explosion.png");


  /********** Background assets ******************/
  //oasis
  AM.queueDownload('img/levels/opening/opening stars.png');
  AM.queueDownload('img/levels/opening/opening oasis 6.png');
  AM.queueDownload('img/levels/opening/opening oasis 5.png');
  AM.queueDownload('img/levels/opening/opening oasis 4.png');
  AM.queueDownload('img/levels/opening/opening oasis 3.png');
  AM.queueDownload('img/levels/opening/opening oasis 2.png');
  AM.queueDownload('img/levels/opening/opening oasis 1.png');
  AM.queueDownload('img/effects/twinkling star.png');

  // forest
  AM.queueDownload("img/levels/dagobah/backgroundStars.png");
  AM.queueDownload("img/levels/dagobah/backgroundStars1.png");
  AM.queueDownload("img/levels/dagobah/backgroundStars2.png");
  AM.queueDownload("img/levels/dagobah/backgroundStars3.png");
  AM.queueDownload("img/levels/dagobah/backgroundTrees1.png");
  AM.queueDownload("img/levels/dagobah/backgroundTrees2.png");
  AM.queueDownload("img/levels/dagobah/backgroundTrees3.png");
  AM.queueDownload("img/levels/dagobah/backgroundTrees4.png");
  AM.queueDownload("img/levels/dagobah/god light new 1.png");
  AM.queueDownload("img/levels/dagobah/god light new 2.png");
  AM.queueDownload("img/levels/dagobah/god light new 3.png");
  AM.queueDownload("img/enemies/dagobah bat.png");
  AM.queueDownload("img/enemies/dagobah bat left.png");

  //city
  AM.queueDownload("img/levels/coruscant/city_background.png");
  AM.queueDownload("img/levels/coruscant/city_buildings_back.png");
  AM.queueDownload("img/levels/coruscant/city_buildings_foreground.png");
  AM.queueDownload("img/levels/coruscant/city_buildings_middle.png");
  AM.queueDownload("img/levels/coruscant/city_clouds_left.png");
  AM.queueDownload("img/levels/coruscant/city_clouds2.png");
  AM.queueDownload("img/levels/coruscant/city_clouds_center.png");
  AM.queueDownload("img/levels/coruscant/highway layer 1.png");
  AM.queueDownload("img/levels/coruscant/highway layer 2.png");
  AM.queueDownload("img/levels/coruscant/highway layer 3.png");
  AM.queueDownload("img/levels/coruscant/highway layer 1 right.png");
  AM.queueDownload("img/levels/coruscant/highway layer 2 right.png");
  AM.queueDownload("img/levels/coruscant/highway layer 3 right.png");

  //Hoth snow
  AM.queueDownload('img/levels/hoth/snow layer.png');
  AM.queueDownload('img/levels/hoth/snow level 0.png');
  AM.queueDownload('img/levels/hoth/snow level 1.png');
  AM.queueDownload('img/levels/hoth/snow level 2.png');
  AM.queueDownload('img/levels/hoth/snow level 3.png');
  AM.queueDownload('img/levels/hoth/snow level 4.png');
  AM.queueDownload('img/levels/hoth/snow level 5.png');
  AM.queueDownload('img/levels/hoth/snow level 6.png');



  /********** Tile assets ******************/  //tiles are 100x100
  //forest
  AM.queueDownload("img/levels/dagobah/forest_left_tile.png");
  AM.queueDownload("img/levels/dagobah/forest_center_tile.png");
  AM.queueDownload("img/levels/dagobah/forest_right_tile.png");
  AM.queueDownload("img/levels/dagobah/forest_both_rounded_tile.png");

  //city
  AM.queueDownload("img/levels/coruscant/city_tile_center.png");
  AM.queueDownload("img/levels/coruscant/city_tile_left.png");
  AM.queueDownload("img/levels/coruscant/city_tile_right.png");
  AM.queueDownload("img/levels/coruscant/city_tile_left_right.png");

  //Hoth snow
  AM.queueDownload("img/levels/hoth/ice_tile_center.png");
  AM.queueDownload("img/levels/hoth/ice_tile_left_right.png");
  AM.queueDownload("img/levels/hoth/ice_tile_left.png");
  AM.queueDownload("img/levels/hoth/ice_tile_right.png");
  /********** SceneManager assets ******************/
  //music menu
  AM.queueDownload('img/ui/music_menu.png');
  AM.queueDownload('img/ui/music_menu_xfx.png');
  AM.queueDownload('img/ui/music_menu_xmusic.png');

  AM.queueDownload('img/ui/title.png');

  /********** Pause Screen Assets ******************/
  //zerlin control icons
  AM.queueDownload('img/hero/roll.png');
  AM.queueDownload('img/hero/slash.png');
  AM.queueDownload('img/hero/saber_throw.png');
  AM.queueDownload('img/hero/jump.png');
  AM.queueDownload('img/hero/crouch.png');
  AM.queueDownload('img/hero/lightning.png');
  AM.queueDownload('img/hero/flip_saber.png');
  //powerup icons
  //droid icons?

  AM.queueDownload('img/ui/health heart.png');
  AM.queueDownload('img/hero/force hand.png');
  AM.queueDownload('img/ui/plus minus.png');
  AM.queueDownload('img/ui/token.png');






  AM.downloadAll(function() {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");
    console.log('all files loaded');

    var gameEngine = new GameEngine(AM);
    gameEngine.init(ctx);

    gameEngine.start();

    console.log("All Done!");
  });
})();
