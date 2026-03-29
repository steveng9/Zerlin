/*
Zerlin
TCSS 491 - Computational Worlds
Joshua Atherton, Michael Josten, Steven Golob
*/

/**
 * Separates entity construction from Level data.
 *
 * Level.set() previously did two unrelated things:
 *   1. Parsed the layout string and instantiated entities (side-effectful).
 *   2. Stored resulting arrays on the Level object.
 *
 * LevelLoader.load() handles (1), returning a plain result object so that
 * the caller (Level.set()) can decide what to do with the arrays. This
 * makes the entity-spawning logic reusable and independently testable.
 */
class LevelLoader {

  /**
   * Parse a level's layout grid and return the instantiated entity arrays.
   *
   * @param {Level}        level        The Level instance (provides tileImages, camera, etc.)
   * @param {GameEngine}   game
   * @param {SceneManager2} sceneManager Used to call addEntity() for CheckPoints.
   * @returns {{ tiles: Tile[], unspawnedDroids: AbstractDroid[], unspawnedPowerups: PowerUp[], unspawnedBoss: Boss|null, checkpoints: CheckPoint[] }}
   */
  static load(level, game, sceneManager) {
    const lc = Constants.LevelConstants;
    var layout   = level.levelLayout;
    var camera   = level.camera;
    var rows     = layout.length;
    var rowHeight = camera.height / rows;

    var tiles            = [];
    var unspawnedDroids  = [];
    var unspawnedPowerups = [];
    var unspawnedBoss    = null;
    var checkpoints      = [];

    // Recompute level length in case tileWidth changed since construction
    level.length = layout[0].length * level.tileWidth;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < layout[i].length; j++) {
        var ch = layout[i][j];
        if (ch === ' ') continue;

        if (ch === '-') {
          var image = level.tileImages.centerTile;
          if (layout[i][j - 1] !== '-' && layout[i][j + 1] !== '-') {
            image = level.tileImages.leftRightTile;
          } else if (layout[i][j - 1] !== '-') {
            image = level.tileImages.leftTile;
          } else if (layout[i][j + 1] !== '-') {
            image = level.tileImages.rightTile;
          }
          tiles.push(new Tile(level, image, j * level.tileWidth, i * camera.height / rows));

        } else if (ch === '~') {
          tiles.push(new FallingTile(level, level.tileImages.leftRightTile, j * level.tileWidth, i * camera.height / rows));

        } else if (ch === '=') {
          var image2 = level.tileImages.centerTile;
          if (layout[i][j - 1] !== '=' && layout[i][j + 1] !== '=') {
            image2 = level.tileImages.leftRightTile;
          } else if (layout[i][j - 1] !== '=') {
            image2 = level.tileImages.leftTile;
          } else if (layout[i][j + 1] !== '=') {
            image2 = level.tileImages.rightTile;
          }
          tiles.push(new MovingTile(level, image2, j * level.tileWidth, i * camera.height / rows, lc.TILE_INITIAL_VELOCITY, 0, lc.TILE_ACCELERATION));

        } else if (ch === 'd') {
          unspawnedDroids.push(new BasicDroid(game, game.assetManager.getAsset("img/enemies/droid-j-row.png"), j * level.tileWidth, i * rowHeight, 14, .2, 100, 100, Constants.DroidBasicConstants.BASIC_DROID_SCALE, 45));
        } else if (ch === 's') {
          unspawnedDroids.push(new ScatterShotDroid(game, game.assetManager.getAsset("img/enemies/Droid 3.png"), j * level.tileWidth, i * rowHeight, 10, .2));
        } else if (ch === 'b') {
          unspawnedDroids.push(new SlowBurstDroid(game, game.assetManager.getAsset("img/enemies/Droid 1.png"), j * level.tileWidth, i * rowHeight, 2, .8));
        } else if (ch === 'f') {
          unspawnedDroids.push(new FastBurstDroid(game, game.assetManager.getAsset("img/enemies/Droid 2.png"), j * level.tileWidth, i * rowHeight, 10, .12));
        } else if (ch === 'n') {
          unspawnedDroids.push(new SniperDroid(game, game.assetManager.getAsset("img/enemies/Droid 4.png"), j * level.tileWidth, i * rowHeight, 6, .2));
        } else if (ch === 'm') {
          unspawnedDroids.push(new MultishotDroid(game, game.assetManager.getAsset("img/enemies/Droid 5.png"), j * level.tileWidth, i * rowHeight, 21, .12));
        } else if (ch === 'X') {
          unspawnedBoss = new Boss(game, j * level.tileWidth, i * game.surfaceHeight / rows);
        } else if (ch === '*') {
          unspawnedDroids.push(new LeggyDroidBoss(game, game.assetManager.getAsset("img/enemies/leggy_droid.png"), j * level.tileWidth, i * rowHeight, 4, .51));

        } else if (ch === 'H') {
          unspawnedPowerups.push(new HealthPowerUp(game, game.assetManager.getAsset("img/ui/powerup_health.png"), j * level.tileWidth, i * rowHeight));
        } else if (ch === 'F') {
          unspawnedPowerups.push(new ForcePowerUp(game, game.assetManager.getAsset("img/ui/powerup_force.png"), j * level.tileWidth, i * rowHeight));
        } else if (ch === 'I') {
          unspawnedPowerups.push(new InvincibilityPowerUp(game, game.assetManager.getAsset('img/ui/powerup_invincibility.png'), j * level.tileWidth, i * game.surfaceHeight / rows));
        } else if (ch === 'S') {
          unspawnedPowerups.push(new SplitLaserPowerUp(game, j * level.tileWidth, i * game.surfaceHeight / rows));
        } else if (ch === 'T') {
          unspawnedPowerups.push(new TinyModePowerUp(game, j * level.tileWidth, i * game.surfaceHeight / rows));
        } else if (ch === 'W') {
          unspawnedPowerups.push(new HomingLaserPowerUp(game, j * level.tileWidth, i * rowHeight));

        } else if (ch === 'C') {
          checkpoints.push(new CheckPoint(game, j * level.tileWidth, (i + 1) * rowHeight));
        }
      }
    }

    return { tiles, unspawnedDroids, unspawnedPowerups, unspawnedBoss, checkpoints };
  }
}
