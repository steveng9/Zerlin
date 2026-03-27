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
  AM.queueDownload("img/Zerlin bobbing walking.png");
  AM.queueDownload("img/Zerlin left bobbing walking.png");
  AM.queueDownload("img/Zerlin backwards bobbing walking.png");
  AM.queueDownload("img/Zerlin left backwards bobbing walking.png");
  AM.queueDownload("img/Zerlin standing.png");
  AM.queueDownload("img/Zerlin standing left.png");
  AM.queueDownload("img/Zerlin somersault.png");
  AM.queueDownload("img/Zerlin left somersault.png");
  AM.queueDownload("img/Zerlin falling up.png");
  AM.queueDownload("img/Zerlin falling down.png");
  AM.queueDownload("img/Zerlin falling up left.png");
  AM.queueDownload("img/Zerlin falling down left.png");
  AM.queueDownload("img/Zerlin slash.png");
  AM.queueDownload("img/Zerlin slash left.png");
  AM.queueDownload("img/Zerlin crouch.png");
  AM.queueDownload("img/Zerlin crouch left.png");
  AM.queueDownload("img/Zerlin death.png");
  AM.queueDownload("img/zerlin at fire.png");
  AM.queueDownload("img/ship take off.png");
  AM.queueDownload("img/saber up.png");
  AM.queueDownload("img/saber up left.png");
  AM.queueDownload("img/saber down.png");
  AM.queueDownload("img/saber down left.png");
  AM.queueDownload("img/throwing arm.png");
  AM.queueDownload("img/throwing arm left.png");
  AM.queueDownload("img/airborn saber.png");



  /********** Boss assets ******************/
  AM.queueDownload("img/boss flying.png");
  AM.queueDownload("img/boss flying left.png");
  AM.queueDownload("img/boss falling.png");
  AM.queueDownload("img/boss falling left.png");
  AM.queueDownload("img/beam cannon.png");
  AM.queueDownload("img/beam cannon left.png");
  AM.queueDownload("img/boss_helmet.png");
  AM.queueDownload("img/bomb.png");

  // Droid boss
  AM.queueDownload("img/leggy_droid.png");
  AM.queueDownload("img/boss_status_bar_icon.png");
  AM.queueDownload("img/explosion_josh.png");


  /********** Powerup assets ******************/
  AM.queueDownload('img/powerup_health.png');
  AM.queueDownload('img/powerup_force.png');
  AM.queueDownload('img/powerup_invincibility.png');
  AM.queueDownload('img/powerup_coin.png');
  AM.queueDownload('img/powerup_coin_T.png');
  AM.queueDownload('img/powerup_laser.png');
  AM.queueDownload('img/checkpoint.png');


  /********** Droid assets ******************/
  AM.queueDownload("img/droid-j-row.png");
  AM.queueDownload("img/Droid 1.png");
  AM.queueDownload("img/Droid 2.png");
  AM.queueDownload("img/Droid 3.png");
  AM.queueDownload("img/Droid 4.png");
  AM.queueDownload("img/Droid 5.png");
  AM.queueDownload("img/basic_droid.png");


  /********** VisualFX assets ******************/
  AM.queueDownload("img/Explosion.png");


  /********** Background assets ******************/
  //oasis
  AM.queueDownload('img/opening stars.png');
  AM.queueDownload('img/opening oasis 6.png');
  AM.queueDownload('img/opening oasis 5.png');
  AM.queueDownload('img/opening oasis 4.png');
  AM.queueDownload('img/opening oasis 3.png');
  AM.queueDownload('img/opening oasis 2.png');
  AM.queueDownload('img/opening oasis 1.png');
  AM.queueDownload('img/twinkling star.png');

  // forest
  AM.queueDownload("img/backgroundStars.png");
  AM.queueDownload("img/backgroundStars1.png");
  AM.queueDownload("img/backgroundStars2.png");
  AM.queueDownload("img/backgroundStars3.png");
  AM.queueDownload("img/backgroundTrees1.png");
  AM.queueDownload("img/backgroundTrees2.png");
  AM.queueDownload("img/backgroundTrees3.png");
  AM.queueDownload("img/backgroundTrees4.png");
  AM.queueDownload("img/god light new 1.png");
  AM.queueDownload("img/god light new 2.png");
  AM.queueDownload("img/god light new 3.png");
  AM.queueDownload("img/dagobah bat.png");
  AM.queueDownload("img/dagobah bat left.png");

  //city
  AM.queueDownload("img/city_background.png");
  AM.queueDownload("img/city_buildings_back.png");
  AM.queueDownload("img/city_buildings_foreground.png");
  AM.queueDownload("img/city_buildings_middle.png");
  AM.queueDownload("img/city_clouds_left.png");
  AM.queueDownload("img/city_clouds2.png");
  AM.queueDownload("img/city_clouds_center.png");
  AM.queueDownload("img/highway layer 1.png");
  AM.queueDownload("img/highway layer 2.png");
  AM.queueDownload("img/highway layer 3.png");
  AM.queueDownload("img/highway layer 1 right.png");
  AM.queueDownload("img/highway layer 2 right.png");
  AM.queueDownload("img/highway layer 3 right.png");

  //Hoth snow
  AM.queueDownload('img/snow layer.png');
  AM.queueDownload('img/snow level 0.png');
  AM.queueDownload('img/snow level 1.png');
  AM.queueDownload('img/snow level 2.png');
  AM.queueDownload('img/snow level 3.png');
  AM.queueDownload('img/snow level 4.png');
  AM.queueDownload('img/snow level 5.png');
  AM.queueDownload('img/snow level 6.png');



  /********** Tile assets ******************/  //tiles are 100x100
  //forest
  AM.queueDownload("img/forest_left_tile.png");
  AM.queueDownload("img/forest_center_tile.png");
  AM.queueDownload("img/forest_right_tile.png");
  AM.queueDownload("img/forest_both_rounded_tile.png");

  //city
  AM.queueDownload("img/city_tile_center.png");
  AM.queueDownload("img/city_tile_left.png");
  AM.queueDownload("img/city_tile_right.png");
  AM.queueDownload("img/city_tile_left_right.png");

  //Hoth snow
  AM.queueDownload("img/ice_tile_center.png");
  AM.queueDownload("img/ice_tile_left_right.png");
  AM.queueDownload("img/ice_tile_left.png");
  AM.queueDownload("img/ice_tile_right.png");
  /********** SceneManager assets ******************/
  //music menu
  AM.queueDownload('img/music_menu.png');
  AM.queueDownload('img/music_menu_xfx.png');
  AM.queueDownload('img/music_menu_xmusic.png');

  AM.queueDownload('img/title.png');

  /********** Pause Screen Assets ******************/
  //zerlin control icons
  AM.queueDownload('img/roll.png');
  AM.queueDownload('img/slash.png');
  AM.queueDownload('img/saber_throw.png');
  AM.queueDownload('img/jump.png');
  AM.queueDownload('img/crouch.png');
  AM.queueDownload('img/lightning.png');
  AM.queueDownload('img/flip_saber.png');
  //powerup icons
  //droid icons?

  AM.queueDownload('img/health heart.png');
  AM.queueDownload('img/force hand.png');
  AM.queueDownload('img/plus minus.png');
  AM.queueDownload('img/token.png');






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
