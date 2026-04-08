// Constant array to hold the different background music
const backgroundMusicArray = [];
backgroundMusicArray['kashyyyk'] = new Howl({
  src: [
    "sound/kashyyykTheme.ogg",
    "sound/kashyyykTheme.m4a",
    "sound/kashyyykTheme.mp3",
    "sound/kashyyykTheme.ac3"
  ],
  html5: true,
  loop: true,
  volume: 1,
});
backgroundMusicArray['yodaForceTheme'] = new Howl({
  src: [
    "sound/yodaForceTheme.ogg",
    "sound/yodaForceTheme.m4a",
    "sound/yodaForceTheme.mp3",
    "sound/yodaForceTheme.ac3"
  ],
  html5: true,
  loop: true,
  volume: 1,
});
backgroundMusicArray['yodaTheme'] = new Howl({
  src: [
    "sound/yodaTheme.ogg",
    "sound/yodaTheme.m4a",
    "sound/yodaTheme.mp3",
    "sound/yodaTheme.ac3"
  ],
  html5: true,
  loop: true,
  preload: true
});
backgroundMusicArray['clashOfLightsabersTheme'] = new Howl({
  src: [
    "sound/clashOfLightsabersTheme.ogg",
    "sound/clashOfLightsabersTheme.m4a",
    "sound/clashOfLightsabersTheme.mp3",
    "sound/clashOfLightsabersTheme.ac3"
  ],
  html5: true,
  loop: true,
  volume: 1,
});
backgroundMusicArray['bossSong'] = new Howl({
  src: [
    "sound/bossSong.ogg",
    "sound/bossSong.m4a",
    "sound/bossSong.mp3",
    "sound/bossSong.wav"
  ],
  html5: true,
  loop: true,
  volume: 1,
});




/**
 * Class that holds a music menu to control the play and pause music backgrounds
 * and the sound fx. Also can pause and play music using the sound engine.
 */
class MusicMenu {
  constructor(game, xPosition, yPosition, images) {
    this.gameEngine = game;
    this.x = xPosition;
    this.y = yPosition;
    this.menu = images[0];
    this.xMusic = images[1];
    this.xFx = images[2];

    this.ctx = this.gameEngine.ctx //not needed
    this.xMusicChecked = true;  // music off by default; one click to enable
    this.xFxChecked = Constants.GameEngineConstants.SFX_MUTED_DEFAULT;

  }

  update() {
    let clickXandY = this.gameEngine.click;
    let changeInState = false;
    if (clickXandY != null) {
      // console.log(clickXandY);
      //music x
      if (
        clickXandY.x >= this.x + 3 &&
        clickXandY.x <= this.x + 70 &&
        clickXandY.y >= this.y + 5 &&
        clickXandY.y <= this.y + 18
      ) {
        changeInState = true;
        this.xMusicChecked = !this.xMusicChecked;
        // console.log("music checked", this.xMusicChecked);
      }
      //fx x
      if (
        clickXandY.x >= this.x + 3 &&
        clickXandY.x <= this.x + 70 &&
        clickXandY.y >= this.y + 21 &&
        clickXandY.y <= this.y + 34
      ) {
        changeInState = true;
        this.xFxChecked = !this.xFxChecked;
        // console.log("fx checked", this.xFxChecked);
      }
    }

    //play and pause pause audio if previous state has changed
    if (changeInState) {
      if (this.xMusicChecked) {
        this.gameEngine.audio.pauseBackgroundMusic();
      } else {
        this.gameEngine.audio.unPauseBackgroundMusic();
      }
      //play or pause sound fx
      if (this.xFxChecked) {
        this.gameEngine.audio.muteSoundFX();
      } else {
        this.gameEngine.audio.unMuteSoundFX();
      }
    }
  }

  draw() {
    //draw music music menu background
    this.ctx.drawImage(this.menu, this.x, this.y);
    if (this.xMusicChecked) {
      this.ctx.drawImage(this.xMusic, this.x, this.y);
    }
    if (this.xFxChecked) {
      this.ctx.drawImage(this.xFx, this.x, this.y);
    }
    // this.strokeStyle = "white"; // draw click zones
    // this.ctx.strokeRect(this.x + 3, this.y + 5, 60, 13);
    // this.ctx.strokeRect(this.x + 3, this.y + 21, 60, 13);
  }
}




/**
 *
 */
class SoundEngine {
  constructor(game) {
    this.gameEngine = game;
    //set to yodaTheme by default
    this.backgroundMusic = backgroundMusicArray['yodaTheme'];
    this.backgroundMusic.volume = 1;
    this.backgroundMusic.onload = function() {
      this.backgroundMusic.fade(0, 1, 5000);
    }

    this.lightsaber = new Howl({
      src: [
        "sound/lightSaber.ogg",
        "sound/lightSaber.m4a",
        "sound/lightSaber.mp3",
        "sound/lightSaber.ac3"
      ],
      html5: true,
      "sprite": {
        "lightsaberHit": [
          0,
          1280
        ],
        "lightsaberSwing": [
          3000,
          705.3061224489796
        ],
        "lightsaberOn": [
          5000,
          1081.9047619047622
        ],
        "lightsaberOff": [
          8000,
          626.0317460317459
        ]
      },
      loop: false,
      volume: .07
    });

    this.item = new Howl({
      src: [
        "sound/item.ogg",
        "sound/item.m4a",
        "sound/item.mp3",
        "sound/item.ac3"
      ],
      html5: true,
      "sprite": {
        "pickupHeartItem": [
          0,
          224.7619047619048
        ],
        "itemPowerdown": [
          2000,
          712.3809523809523
        ],
        "itemPowerup": [
          4000,
          567.6190476190479
        ]
      },
      loop: false,
      volume: .1
    });

    this.hero = new Howl({
      src: [
        "sound/hero.ogg",
        "sound/hero.m4a",
        "sound/hero.mp3",
        "sound/hero.ac3"
      ],
      html5: true,
      "sprite": {
        "heroHurt": [
          0,
          318.73015873015873
        ],
        "forceJump": [
          2000,
          1141.5873015873012
        ],
        "heroDeath": [
          5000,
          769.5238095238093
        ],
        "heroWalk": [
          7000,
          133.33333333333374
        ]
      },
      volume: .07
    });

    this.enemy = new Howl({
      src: [
        "sound/enemy.ogg",
        "sound/enemy.m4a",
        "sound/enemy.mp3",
        "sound/enemy.ac3"
      ],
      html5: true,
      "sprite": {
        "bowcasterShoot": [
          0,
          759.3650793650794
        ],
        "powerfulBlaster": [
          2000,
          772.0634920634924
        ],
        "retroBlasterShot": [
          4000,
          2041.8367346938774
        ],
        "rubbleExplosion": [
          8000,
          2483.809523809523
        ],
        "explosionBoomBoom": [
          12000,
          1717.1201814058961
        ],
        "largeExplosion": [
          15000,
          2605.714285714285
        ]
      },
      loop: false,
      volume: .1
    });

    this.beam = new Howl({
      src: [
        "sound/beam2.wav"
      ],
      html5: true,
      loop: true,
      volume: .2
    });

    this.saberHum = new Howl({
      src: [
        "sound/saber humming.wav"
      ],
      html5: true,
      loop: true,
      volume: .05
    });

    this.wound = new Howl({
      src: [
        "sound/tissue-wound.wav"
      ],
      html5: true,
      loop: false,
      volume: .15
    });

    this.sizzle = new Howl({
      src: [
        "sound/butter sizzling.wav"
      ],
      html5: true,
      loop: true,
      volume: .5
    });
    this.sizzle2 = new Howl({
      src: [
        "sound/meat sizzling.wav"
      ],
      html5: true,
      loop: true,
      volume: .5
    });
    this.jetPack = new Howl({
      src: [
        "sound/jet pack.wav"
      ],
      html5: true,
      loop: true,
      volume: .1
    });
    this.deflectBeam = new Howl({
      src: [
        "sound/laserLoop1.wav"
      ],
      html5: true,
      loop: true,
      volume: .8
    });

    this.campFire = new Howl({
      src: [
        "sound/camp fire.wav"
      ],
      html5: true,
      loop: true,
      volume: .1
    });

    this.shipTakeOff = new Howl({
      src: [
        "sound/ship taking off.wav"
      ],
      html5: true,
      loop: false,
      volume: .8
    });

    /* boss droid sounds */
    this.droidBossMechanical = new Howl({
      src: [
        "sound/bossDroidDoor.wav",
        "sound/bossDroidDoor.mp3"
      ],
      html5: true,
      loop: true,
      volume: 1
    });
    this.saberDeflectLaser = new Howl({
      src: [
        "sound/laserHitSaber.mp3"
      ],
      html5: true,
      loop: false,
      volume: .25
    });
    this.poisonShot = new Howl({
      src: [
        "sound/poisonLaser.mp3",
        "poisonLaser.wav"
      ],
      html5: true,
      loop: false,
      volume: .4
    });
    this.lightning = new Howl({
      src: [
        "sound/lightning1.wav"
      ],
      html5: true,
      loop: false,
      volume: .1
    });
    this.continue = new Howl({
      src: [
        "sound/e6.wav"
      ],
      html5: true,
      loop: false,
      volume: .35
    });
    this.plus = new Howl({
      src: [
        "sound/c7.wav"
      ],
      html5: true,
      loop: false,
      volume: .1
    });
    this.minus = new Howl({
      src: [
        "sound/a6.wav"
      ],
      html5: true,
      loop: false,
      volume: .1
    });


    /***** set the default sound volumes *****/
    this.item.volume(1, 'pickupHeartItem');
    this.enemy.volume(1, 'rubbleExplosion');
    this.enemy.volume(.7, 'retroBlasterShot');
    this.hero.volume(.1, 'heroHurt');
    this.lightsaber.volume(.25, 'lightsaberSwing');

    this.bossSongPlaying = false;
    this.bossBackgroundMusic = backgroundMusicArray['bossSong'];
    this.bossBackgroundMusic.volume = 1;

    //array holding all of the howler soundFX objects
    this.soundFXArray = [this.lightsaber, this.item, this.hero,
      this.enemy, this.beam, this.saberHum, this.wound, this.sizzle,
      this.sizzle2, this.sizzle2, this.jetPack, this.deflectBeam,
      this.droidBossMechanical, this.saberDeflectLaser, this.poisonShot,
      this.shipTakeOff, this.campFire, this.lightning, this.continue, this.plus, this.minus
    ];
    this.soundFxMuted = Constants.GameEngineConstants.SFX_MUTED_DEFAULT;
  }

  //pauseBackgroundMusic, unpauseBackgroundMusic
  unPauseBackgroundMusic() {
    if (!this.backgroundMusic.playing() && !this.bossSongPlaying) {
      this.backgroundMusic.play();
    }
    if (!this.bossBackgroundMusic.playing() && this.bossSongPlaying) {
      this.bossBackgroundMusic.play();
    }

  }
  pauseBackgroundMusic() {
    if (this.backgroundMusic.playing() && !this.bossSongPlaying) {
      this.backgroundMusic.pause();
    }
    if (this.bossBackgroundMusic.playing() && this.bossSongPlaying) {
      this.bossBackgroundMusic.pause();
    }

  }

  //add methods to mute and unmute sound effects
  muteSoundFX() {
    this.soundFxMuted = true;
    // works but need to restore the volumes as they were.....
    this.soundFXArray.forEach(function(item) {
      item.stop();
    });
  }
  unMuteSoundFX() {
    this.soundFxMuted = false;
    this.soundFXArray.forEach(function(item) {
      // item.volume(3);
    });
    if (this.gameEngine.sceneManager.boss) //hacky way to reinitalize jetpack noise after unmuting
      this.gameEngine.sceneManager.boss.jetPackSoundOn = false;
  }

  endAllSoundFX() {
    this.soundFXArray.forEach(function(item) {
      item.stop();
    });
  }

  //method to changeout background music
  switchBackgroundMusic(keyOfBackgroundMusicArray) {
    this.backgroundMusic = backgroundMusicArray[keyOfBackgroundMusicArray];
  }

  //play a sound fx if not currently muted
  playSoundFx(howlerSound, id = '', volume = null) {
    if (!this.soundFxMuted) {
      var soundId = id === '' ? howlerSound.play() : howlerSound.play(id);
      if (volume !== null) howlerSound.volume(volume, soundId);
    }
  }

  playSound(howlerSound) {
    if (!this.soundFxMuted) {
      howlerSound.play();
    }
  }
  playBossSong() {
    this.backgroundMusic.stop();
    this.bossBackgroundMusic.play();
    this.bossSongPlaying = true;
  }
  playBackgroundSong() {
    this.bossBackgroundMusic.stop();
    this.backgroundMusic.play();
    this.bossSongPlaying = false;
  }
}
